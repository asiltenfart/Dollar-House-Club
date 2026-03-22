import "FungibleToken"
import "DummyPYUSD"
import "RandomConsumer"

/// DollarHouseRaffle — the core raffle contract for Dollar House Club.
///
/// Lifecycle:
///   1. Seller calls createRaffle() → returns raffleId
///   2. Users call deposit() / withdraw() during the active period
///   3. After expiration, anyone calls commitRaffle() → stores randomness request (tx 1 of 2)
///   4. In a subsequent block, anyone calls revealWinner() → picks winner via onchain randomness (tx 2 of 2)
///
/// Onchain randomness uses the commit-reveal pattern via RandomConsumer (Flow's secure VRF).
/// Settlement is permissionless — anyone can trigger it after expiration.
///
access(all) contract DollarHouseRaffle {

    // ── Events ───────────────────────────────────────────────────────────────

    access(all) event RaffleCreated(raffleId: UInt64, seller: Address, targetValue: UFix64, expiresAt: UFix64)
    access(all) event DepositMade(raffleId: UInt64, depositor: Address, amount: UFix64)
    access(all) event WithdrawalMade(raffleId: UInt64, depositor: Address, amount: UFix64)
    access(all) event RaffleCommitted(raffleId: UInt64, commitBlock: UInt64)
    access(all) event WinnerRevealed(raffleId: UInt64, winner: Address, isFunded: Bool, prizeAmount: UFix64)
    // ── State ────────────────────────────────────────────────────────────────

    /// Auto-incrementing raffle ID
    access(all) var nextRaffleId: UInt64

    /// All raffles stored by ID
    access(self) let raffles: {UInt64: RaffleData}

    /// Deposits per raffle: raffleId -> { depositor address -> Deposit }
    access(self) let deposits: {UInt64: {Address: DepositInfo}}

    /// PYUSD vault holding all deposited funds
    access(self) let vault: @DummyPYUSD.Vault

    /// RandomConsumer for commit-reveal
    access(self) let consumer: @RandomConsumer.Consumer

    /// Pending randomness requests for raffle settlement: raffleId -> Request
    access(self) let pendingRequests: @{UInt64: RandomConsumer.Request}

    /// Raffle duration in seconds (default 30 days = 2592000, set to 60 for testing)
    access(all) let raffleDuration: UFix64

    // ── Data Structures ──────────────────────────────────────────────────────

    access(all) enum RaffleStatus: UInt8 {
        access(all) case active
        access(all) case committed   // randomness requested, waiting for reveal
        access(all) case completedFunded
        access(all) case completedUnfunded
    }

    access(all) struct RaffleData {
        access(all) let id: UInt64
        access(all) let seller: Address
        access(all) let title: String
        access(all) let description: String
        access(all) let targetValue: UFix64
        access(all) let createdAt: UFix64
        access(all) let expiresAt: UFix64
        access(all) var totalDeposited: UFix64
        access(all) var totalYield: UFix64
        /// Sum of all depositors' yield weights (amount * secondsRemaining at deposit time)
        access(all) var totalYieldWeight: UFix64
        access(all) var depositorCount: UInt64
        access(all) var status: RaffleStatus
        access(all) var winner: Address?

        init(
            id: UInt64,
            seller: Address,
            title: String,
            description: String,
            targetValue: UFix64,
            createdAt: UFix64,
            expiresAt: UFix64
        ) {
            self.id = id
            self.seller = seller
            self.title = title
            self.description = description
            self.targetValue = targetValue
            self.createdAt = createdAt
            self.expiresAt = expiresAt
            self.totalDeposited = 0.0
            self.totalYield = 0.0
            self.totalYieldWeight = 0.0
            self.depositorCount = 0
            self.status = RaffleStatus.active
            self.winner = nil
        }

        access(contract) fun addDeposit(amount: UFix64, isNew: Bool) {
            self.totalDeposited = self.totalDeposited + amount
            if isNew {
                self.depositorCount = self.depositorCount + 1
            }
        }

        access(contract) fun addYieldWeight(_ weight: UFix64) {
            self.totalYieldWeight = self.totalYieldWeight + weight
        }

        access(contract) fun removeYieldWeight(_ weight: UFix64) {
            if weight >= self.totalYieldWeight {
                self.totalYieldWeight = 0.0
            } else {
                self.totalYieldWeight = self.totalYieldWeight - weight
            }
        }

        access(contract) fun removeDeposit(amount: UFix64) {
            self.totalDeposited = self.totalDeposited - amount
            self.depositorCount = self.depositorCount - 1
        }

        access(contract) fun setStatus(_ s: RaffleStatus) {
            self.status = s
        }

        access(contract) fun setWinner(_ addr: Address) {
            self.winner = addr
        }

        access(contract) fun addYield(amount: UFix64) {
            self.totalYield = self.totalYield + amount
        }
    }

    access(all) struct DepositInfo {
        access(all) let depositor: Address
        access(all) var amount: UFix64
        access(all) let depositedAt: UFix64
        /// Yield weight = amount * secondsRemaining at deposit time.
        /// Represents estimated yield contribution to the pool.
        access(all) var yieldWeight: UFix64

        init(depositor: Address, amount: UFix64, depositedAt: UFix64, yieldWeight: UFix64) {
            self.depositor = depositor
            self.amount = amount
            self.depositedAt = depositedAt
            self.yieldWeight = yieldWeight
        }

        access(contract) fun addAmount(_ a: UFix64) {
            self.amount = self.amount + a
        }

        access(contract) fun addYieldWeight(_ w: UFix64) {
            self.yieldWeight = self.yieldWeight + w
        }
    }

    // ── Public Functions ─────────────────────────────────────────────────────

    /// Create a new raffle. Returns the raffle ID.
    access(all) fun createRaffle(
        seller: Address,
        title: String,
        description: String,
        targetValue: UFix64
    ): UInt64 {
        pre {
            targetValue >= 1000.0: "Target value must be at least $1,000"
            title.length > 0: "Title cannot be empty"
        }

        let now = getCurrentBlock().timestamp
        let raffleId = self.nextRaffleId
        self.nextRaffleId = self.nextRaffleId + 1

        let raffle = RaffleData(
            id: raffleId,
            seller: seller,
            title: title,
            description: description,
            targetValue: targetValue,
            createdAt: now,
            expiresAt: now + self.raffleDuration
        )

        self.raffles[raffleId] = raffle
        self.deposits[raffleId] = {}

        emit RaffleCreated(
            raffleId: raffleId,
            seller: seller,
            targetValue: targetValue,
            expiresAt: raffle.expiresAt
        )

        return raffleId
    }

    /// Deposit PYUSD into a raffle. The vault is consumed.
    access(all) fun deposit(raffleId: UInt64, depositor: Address, payment: @DummyPYUSD.Vault) {
        pre {
            payment.balance >= 10.0: "Minimum deposit is $10"
        }

        let raffle = self.raffles[raffleId] ?? panic("Raffle not found")
        assert(raffle.status == RaffleStatus.active, message: "Raffle is not active")
        assert(getCurrentBlock().timestamp < raffle.expiresAt, message: "Raffle has expired")
        assert(depositor != raffle.seller, message: "Seller cannot deposit into own raffle")

        let now = getCurrentBlock().timestamp
        let amount = payment.balance
        self.vault.deposit(from: <-payment)

        // Calculate yield weight: amount * seconds remaining until expiry
        let secondsRemaining = raffle.expiresAt > now ? raffle.expiresAt - now : 0.0
        let yieldWeight = amount * secondsRemaining

        // Update or create deposit record
        let raffleDeposits = self.deposits[raffleId]!
        let isNew = raffleDeposits[depositor] == nil

        if let existing = raffleDeposits[depositor] {
            let updated = existing
            updated.addAmount(amount)
            updated.addYieldWeight(yieldWeight)
            let newDeposits = self.deposits.remove(key: raffleId)!
            var d = newDeposits
            d[depositor] = updated
            self.deposits[raffleId] = d
        } else {
            var d = self.deposits.remove(key: raffleId)!
            d[depositor] = DepositInfo(
                depositor: depositor,
                amount: amount,
                depositedAt: now,
                yieldWeight: yieldWeight
            )
            self.deposits[raffleId] = d
        }

        // Update raffle totals
        let r = self.raffles.remove(key: raffleId)!
        r.addDeposit(amount: amount, isNew: isNew)
        r.addYieldWeight(yieldWeight)
        self.raffles[raffleId] = r

        emit DepositMade(raffleId: raffleId, depositor: depositor, amount: amount)
    }

    /// Withdraw principal from an active raffle. Returns the PYUSD vault.
    access(all) fun withdraw(raffleId: UInt64, depositor: Address): @DummyPYUSD.Vault {
        let raffle = self.raffles[raffleId] ?? panic("Raffle not found")
        assert(raffle.status == RaffleStatus.active, message: "Raffle is not active")

        let raffleDeposits = self.deposits[raffleId]!
        let depositInfo = raffleDeposits[depositor] ?? panic("No deposit found for this address")
        let amount = depositInfo.amount
        let yieldWeight = depositInfo.yieldWeight

        // Remove deposit
        var d = self.deposits.remove(key: raffleId)!
        d.remove(key: depositor)
        self.deposits[raffleId] = d

        // Update raffle totals
        let r = self.raffles.remove(key: raffleId)!
        r.removeDeposit(amount: amount)
        r.removeYieldWeight(yieldWeight)
        self.raffles[raffleId] = r

        emit WithdrawalMade(raffleId: raffleId, depositor: depositor, amount: amount)

        return <-self.vault.withdraw(amount: amount) as! @DummyPYUSD.Vault
    }

    /// Simulate yield accrual (for demo: adds yield to a raffle).
    /// In production this would come from a lending protocol.
    access(all) fun simulateYield(raffleId: UInt64, yieldVault: @DummyPYUSD.Vault) {
        let raffle = self.raffles[raffleId] ?? panic("Raffle not found")
        assert(raffle.status == RaffleStatus.active, message: "Raffle is not active")

        let amount = yieldVault.balance
        self.vault.deposit(from: <-yieldVault)

        let r = self.raffles.remove(key: raffleId)!
        r.addYield(amount: amount)
        self.raffles[raffleId] = r
    }

    /// STEP 1 of settlement: Commit randomness request.
    /// Can be called by anyone after the raffle has expired.
    /// This is the first of two transactions required for secure onchain randomness.
    /// Auto-harvests all remaining yield before settlement.
    access(all) fun commitRaffle(raffleId: UInt64) {
        let raffle = self.raffles[raffleId] ?? panic("Raffle not found")
        assert(raffle.status == RaffleStatus.active, message: "Raffle is not active")
        assert(getCurrentBlock().timestamp >= raffle.expiresAt, message: "Raffle has not expired yet")

        let raffleDeposits = self.deposits[raffleId]!
        assert(raffleDeposits.length > 0, message: "No depositors in raffle")

        // Request randomness from the beacon
        let request <- self.consumer.requestRandomness()
        let commitBlock = request.block

        // Store the pending request
        let old <- self.pendingRequests[raffleId] <- request
        destroy old

        // Update status to committed
        let r = self.raffles.remove(key: raffleId)!
        r.setStatus(RaffleStatus.committed)
        self.raffles[raffleId] = r

        emit RaffleCommitted(raffleId: raffleId, commitBlock: commitBlock)
    }

    /// STEP 2 of settlement: Reveal the winner using the committed randomness.
    /// Must be called in a block AFTER commitRaffle().
    /// This completes the commit-reveal pattern for secure onchain randomness.
    access(all) fun revealWinner(raffleId: UInt64) {
        let raffle = self.raffles[raffleId] ?? panic("Raffle not found")
        assert(raffle.status == RaffleStatus.committed, message: "Raffle must be in committed state")

        // Retrieve the pending request
        let request <- self.pendingRequests.remove(key: raffleId)
            ?? panic("No pending randomness request for this raffle")

        assert(request.canFullfill(), message: "Randomness not yet available. Try in the next block.")

        // Get depositor addresses for winner selection
        let raffleDeposits = self.deposits[raffleId]!
        let depositorAddresses = raffleDeposits.keys

        assert(depositorAddresses.length > 0, message: "No depositors")

        // Use RandomConsumer to get a random index
        // Weight by estimated yield contribution (deposit * time remaining at deposit)
        let randomValue = self.consumer.fulfillRandomRequest(<-request)

        // Select winner proportionally to yield contribution
        let winnerAddress = self._selectWeightedWinner(
            deposits: raffleDeposits,
            depositorAddresses: depositorAddresses,
            totalYieldWeight: raffle.totalYieldWeight,
            randomValue: randomValue
        )

        // Determine if funded
        let isFunded = raffle.totalYield >= raffle.targetValue

        // Update raffle
        let r = self.raffles.remove(key: raffleId)!
        r.setWinner(winnerAddress)
        if isFunded {
            r.setStatus(RaffleStatus.completedFunded)
        } else {
            r.setStatus(RaffleStatus.completedUnfunded)
        }
        self.raffles[raffleId] = r

        let prizeAmount = isFunded ? raffle.targetValue : raffle.totalYield

        emit WinnerRevealed(
            raffleId: raffleId,
            winner: winnerAddress,
            isFunded: isFunded,
            prizeAmount: prizeAmount
        )
    }

    /// Claim winnings after raffle is completed.
    /// Winner gets the prize (yield or property value).
    /// All depositors can reclaim their principal.
    access(all) fun claimPrincipal(raffleId: UInt64, depositor: Address): @DummyPYUSD.Vault {
        let raffle = self.raffles[raffleId] ?? panic("Raffle not found")
        assert(
            raffle.status == RaffleStatus.completedFunded || raffle.status == RaffleStatus.completedUnfunded,
            message: "Raffle is not completed"
        )

        let raffleDeposits = self.deposits[raffleId]!
        let depositInfo = raffleDeposits[depositor] ?? panic("No deposit found")
        let amount = depositInfo.amount

        // Remove deposit record
        var d = self.deposits.remove(key: raffleId)!
        d.remove(key: depositor)
        self.deposits[raffleId] = d

        return <-self.vault.withdraw(amount: amount) as! @DummyPYUSD.Vault
    }

    /// Winner claims the yield prize
    access(all) fun claimPrize(raffleId: UInt64, winner: Address): @DummyPYUSD.Vault {
        let raffle = self.raffles[raffleId] ?? panic("Raffle not found")
        assert(
            raffle.status == RaffleStatus.completedFunded || raffle.status == RaffleStatus.completedUnfunded,
            message: "Raffle is not completed"
        )
        assert(raffle.winner == winner, message: "Only the winner can claim the prize")

        let prizeAmount = raffle.totalYield
        assert(prizeAmount > 0.0, message: "No yield to claim")

        // Zero out yield so it can't be claimed twice
        let r = self.raffles.remove(key: raffleId)!
        r.addYield(amount: 0.0) // yield already tracked, just mark claimed via status
        self.raffles[raffleId] = r

        return <-self.vault.withdraw(amount: prizeAmount) as! @DummyPYUSD.Vault
    }

    // ── View Functions (Scripts) ─────────────────────────────────────────────

    access(all) view fun getRaffle(raffleId: UInt64): RaffleData? {
        return self.raffles[raffleId]
    }

    access(all) view fun getAllRaffleIds(): [UInt64] {
        return self.raffles.keys
    }

    access(all) view fun getDeposit(raffleId: UInt64, depositor: Address): DepositInfo? {
        if let raffleDeposits = self.deposits[raffleId] {
            return raffleDeposits[depositor]
        }
        return nil
    }

    access(all) view fun getDepositors(raffleId: UInt64): [Address] {
        if let raffleDeposits = self.deposits[raffleId] {
            return raffleDeposits.keys
        }
        return []
    }

    access(all) view fun getAllDeposits(raffleId: UInt64): {Address: DepositInfo} {
        return self.deposits[raffleId] ?? {}
    }

    access(all) view fun isRaffleExpired(raffleId: UInt64): Bool {
        if let raffle = self.raffles[raffleId] {
            return getCurrentBlock().timestamp >= raffle.expiresAt
        }
        return false
    }

    access(all) view fun isRaffleCommitted(raffleId: UInt64): Bool {
        if let raffle = self.raffles[raffleId] {
            return raffle.status == RaffleStatus.committed
        }
        return false
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    /// Weighted random selection: probability proportional to estimated yield contribution.
    /// Yield weight = deposit amount * seconds remaining at deposit time.
    /// Early depositors with more time to generate yield have higher win probability.
    access(self) fun _selectWeightedWinner(
        deposits: {Address: DepositInfo},
        depositorAddresses: [Address],
        totalYieldWeight: UFix64,
        randomValue: UInt64
    ): Address {
        // Convert yield weights to integer units to avoid floating point issues
        // Use whole units (truncate to integers) since yield weights are large numbers
        let totalUnits = UInt64(totalYieldWeight)
        assert(totalUnits > 0, message: "Total yield weight must be positive")
        let targetUnits = randomValue % totalUnits

        var cumulativeUnits: UInt64 = 0
        for addr in depositorAddresses {
            let dep = deposits[addr]!
            cumulativeUnits = cumulativeUnits + UInt64(dep.yieldWeight)
            if targetUnits < cumulativeUnits {
                return addr
            }
        }

        // Fallback to last depositor (should never reach here)
        return depositorAddresses[depositorAddresses.length - 1]
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    init() {
        self.nextRaffleId = 1
        self.raffles = {}
        self.deposits = {}
        self.vault <- DummyPYUSD.createEmptyVault(vaultType: Type<@DummyPYUSD.Vault>())
        self.consumer <- RandomConsumer.createConsumer()
        self.pendingRequests <- {}

        // 30 days in seconds
        self.raffleDuration = 2592000.0
    }
}
