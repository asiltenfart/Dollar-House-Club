import "FungibleToken"
import "DummyPYUSD"
import "RandomConsumer"

/// DollarHouseRaffle — the core raffle contract for Dollar House Club.
///
/// Lifecycle:
///   1. Seller calls createRaffle() → returns raffleId
///   2. Users call deposit() / withdraw() during the active period
///   3. After expiration, anyone calls commitRaffle() → stores randomness request (tx 1 of 2)
///   4. In a subsequent block, anyone calls revealWinner() → picks winner via on-chain randomness (tx 2 of 2)
///   5. Winner calls claimPrize(), other depositors call claimPrincipal()
///
/// Resources enforce uniqueness — raffles and deposits cannot be duplicated.
/// View structs (RaffleView, DepositView) are used by scripts for reading.
///
/// Security: deposit/withdraw/claim functions require an authorized account reference
/// to prevent impersonation attacks. The signer's address is derived from the reference.
///
access(all) contract DollarHouseRaffle {

    // ── Events ───────────────────────────────────────────────────────────────

    access(all) event RaffleCreated(raffleId: UInt64, seller: Address, targetValue: UFix64, expiresAt: UFix64)
    access(all) event DepositMade(raffleId: UInt64, depositor: Address, amount: UFix64)
    access(all) event WithdrawalMade(raffleId: UInt64, depositor: Address, amount: UFix64)
    access(all) event YieldAdded(raffleId: UInt64, amount: UFix64)
    access(all) event RaffleCommitted(raffleId: UInt64, commitBlock: UInt64)
    access(all) event WinnerRevealed(raffleId: UInt64, winner: Address, isFunded: Bool, prizeAmount: UFix64)
    access(all) event PrincipalClaimed(raffleId: UInt64, depositor: Address, amount: UFix64)
    access(all) event PrizeClaimed(raffleId: UInt64, winner: Address, amount: UFix64)

    // ── State ────────────────────────────────────────────────────────────────

    /// Auto-incrementing raffle ID counter.
    access(all) var nextRaffleId: UInt64

    /// All raffles stored as resources, keyed by raffle ID.
    access(self) let raffles: @{UInt64: Raffle}

    /// Central vault holding all deposited principal and accrued yield.
    access(self) let vault: @DummyPYUSD.Vault

    /// Random beacon consumer for commit-reveal randomness.
    access(self) let consumer: @RandomConsumer.Consumer

    /// Pending randomness requests, keyed by raffle ID.
    access(self) let pendingRequests: @{UInt64: RandomConsumer.Request}

    /// Duration of each raffle in seconds (30 days).
    access(all) let raffleDuration: UFix64

    /// Minimum deposit amount in PYUSD.
    access(all) let minDeposit: UFix64

    /// Minimum target value for a raffle.
    access(all) let minTargetValue: UFix64

    // ── Enum ─────────────────────────────────────────────────────────────────

    access(all) enum RaffleStatus: UInt8 {
        access(all) case active
        access(all) case committed
        access(all) case completedFunded
        access(all) case completedUnfunded
    }

    // ── View Structs (returned by scripts) ───────────────────────────────────

    access(all) struct RaffleView {
        access(all) let id: UInt64
        access(all) let seller: Address
        access(all) let title: String
        access(all) let description: String
        access(all) let targetValue: UFix64
        access(all) let createdAt: UFix64
        access(all) let expiresAt: UFix64
        access(all) let totalDeposited: UFix64
        access(all) let totalYield: UFix64
        access(all) let totalYieldWeight: UFix64
        access(all) let depositorCount: UInt64
        access(all) let status: RaffleStatus
        access(all) let winner: Address?
        access(all) let prizeClaimed: Bool

        view init(
            id: UInt64, seller: Address, title: String, description: String,
            targetValue: UFix64, createdAt: UFix64, expiresAt: UFix64,
            totalDeposited: UFix64, totalYield: UFix64, totalYieldWeight: UFix64,
            depositorCount: UInt64, status: RaffleStatus, winner: Address?,
            prizeClaimed: Bool
        ) {
            self.id = id
            self.seller = seller
            self.title = title
            self.description = description
            self.targetValue = targetValue
            self.createdAt = createdAt
            self.expiresAt = expiresAt
            self.totalDeposited = totalDeposited
            self.totalYield = totalYield
            self.totalYieldWeight = totalYieldWeight
            self.depositorCount = depositorCount
            self.status = status
            self.winner = winner
            self.prizeClaimed = prizeClaimed
        }
    }

    access(all) struct DepositView {
        access(all) let depositor: Address
        access(all) let amount: UFix64
        access(all) let depositedAt: UFix64
        access(all) let yieldWeight: UFix64
        access(all) let isWithdrawn: Bool

        view init(
            depositor: Address, amount: UFix64, depositedAt: UFix64,
            yieldWeight: UFix64, isWithdrawn: Bool
        ) {
            self.depositor = depositor
            self.amount = amount
            self.depositedAt = depositedAt
            self.yieldWeight = yieldWeight
            self.isWithdrawn = isWithdrawn
        }
    }

    // ── Resources ────────────────────────────────────────────────────────────

    access(all) resource Deposit {
        access(all) let depositor: Address
        access(all) var amount: UFix64
        access(all) let depositedAt: UFix64
        access(all) var yieldWeight: UFix64
        access(all) var isWithdrawn: Bool

        init(depositor: Address, amount: UFix64, depositedAt: UFix64, yieldWeight: UFix64) {
            self.depositor = depositor
            self.amount = amount
            self.depositedAt = depositedAt
            self.yieldWeight = yieldWeight
            self.isWithdrawn = false
        }

        access(contract) fun addAmount(_ a: UFix64) { self.amount = self.amount + a }
        access(contract) fun addYieldWeight(_ w: UFix64) { self.yieldWeight = self.yieldWeight + w }
        access(contract) fun setYieldWeight(_ w: UFix64) { self.yieldWeight = w }

        /// Mark deposit as withdrawn: zero out principal, keep yield weight for win chance.
        access(contract) fun markWithdrawn() {
            self.amount = 0.0
            self.isWithdrawn = true
        }

        /// Reactivate a withdrawn deposit when the user re-deposits.
        access(contract) fun clearWithdrawn() {
            self.isWithdrawn = false
        }

        access(all) view fun toView(): DepositView {
            return DepositView(
                depositor: self.depositor,
                amount: self.amount,
                depositedAt: self.depositedAt,
                yieldWeight: self.yieldWeight,
                isWithdrawn: self.isWithdrawn
            )
        }
    }

    access(all) resource Raffle {
        access(all) let id: UInt64
        access(all) let seller: Address
        access(all) let title: String
        access(all) let description: String
        access(all) let targetValue: UFix64
        access(all) let createdAt: UFix64
        access(all) let expiresAt: UFix64
        access(all) var totalDeposited: UFix64
        access(all) var totalYield: UFix64
        access(all) var totalYieldWeight: UFix64
        access(all) var depositorCount: UInt64
        access(all) var status: RaffleStatus
        access(all) var winner: Address?
        access(all) var prizeClaimed: Bool
        access(contract) let deposits: @{Address: Deposit}

        init(
            id: UInt64, seller: Address, title: String, description: String,
            targetValue: UFix64, createdAt: UFix64, expiresAt: UFix64
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
            self.prizeClaimed = false
            self.deposits <- {}
        }

        // ── Mutators ────────────────────────────────────────────────────────

        /// Record a deposit: add to totalDeposited, totalYieldWeight, and optionally increment depositorCount.
        access(contract) fun recordDeposit(amount: UFix64, weight: UFix64, isNewDepositor: Bool) {
            self.totalDeposited = self.totalDeposited + amount
            self.totalYieldWeight = self.totalYieldWeight + weight
            if isNewDepositor { self.depositorCount = self.depositorCount + 1 }
        }

        /// Subtract withdrawn principal from totalDeposited.
        /// Does NOT decrement depositorCount — withdrawn depositors retain their win chance.
        access(contract) fun subtractPrincipal(_ amount: UFix64) {
            self.totalDeposited = self.totalDeposited - amount
        }

        access(contract) fun removeYieldWeight(_ weight: UFix64) {
            if weight >= self.totalYieldWeight { self.totalYieldWeight = 0.0 }
            else { self.totalYieldWeight = self.totalYieldWeight - weight }
        }

        access(contract) fun addYield(_ amount: UFix64) {
            self.totalYield = self.totalYield + amount
        }

        access(contract) fun setStatus(_ s: RaffleStatus) { self.status = s }
        access(contract) fun setWinner(_ addr: Address) { self.winner = addr }
        access(contract) fun markPrizeClaimed() { self.prizeClaimed = true }

        // ── Deposit management ──────────────────────────────────────────────

        /// Check if a deposit exists for the given address. O(1) via reference.
        access(contract) view fun hasDeposit(_ addr: Address): Bool {
            if let _ = &self.deposits[addr] as &Deposit? {
                return true
            }
            return false
        }

        access(contract) fun insertDeposit(_ deposit: @Deposit) {
            let addr = deposit.depositor
            self.deposits[addr] <-! deposit
        }

        access(contract) fun removeDepositResource(_ addr: Address): @Deposit {
            return <- self.deposits.remove(key: addr)!
        }

        // ── Winner selection ────────────────────────────────────────────────

        /// Select a winner weighted by yield contribution.
        /// Uses UInt64 truncation of UFix64 weights — safe because minimum weight >= 10.
        access(contract) view fun selectWeightedWinner(randomValue: UInt64): Address {
            let addresses = self.deposits.keys
            let totalUnits = UInt64(self.totalYieldWeight)
            assert(totalUnits > 0, message: "Total yield weight must be positive")
            let targetUnits = randomValue % totalUnits

            var cumulativeUnits: UInt64 = 0
            for addr in addresses {
                if let depRef = &self.deposits[addr] as &Deposit? {
                    cumulativeUnits = cumulativeUnits + UInt64(depRef.yieldWeight)
                    if targetUnits < cumulativeUnits {
                        return addr
                    }
                }
            }
            // Fallback: last depositor (should not reach here with valid weights)
            return addresses[addresses.length - 1]
        }

        // ── View ────────────────────────────────────────────────────────────

        access(all) view fun toView(): RaffleView {
            return RaffleView(
                id: self.id, seller: self.seller, title: self.title,
                description: self.description, targetValue: self.targetValue,
                createdAt: self.createdAt, expiresAt: self.expiresAt,
                totalDeposited: self.totalDeposited, totalYield: self.totalYield,
                totalYieldWeight: self.totalYieldWeight,
                depositorCount: self.depositorCount, status: self.status,
                winner: self.winner, prizeClaimed: self.prizeClaimed
            )
        }

        access(all) view fun getDepositView(_ depositor: Address): DepositView? {
            if let depRef = &self.deposits[depositor] as &Deposit? {
                return depRef.toView()
            }
            return nil
        }

        access(all) view fun getDepositorAddresses(): [Address] {
            return self.deposits.keys
        }

        access(all) view fun getAllDepositViews(): {Address: DepositView} {
            let views: {Address: DepositView} = {}
            for addr in self.deposits.keys {
                if let depRef = &self.deposits[addr] as &Deposit? {
                    views[addr] = depRef.toView()
                }
            }
            return views
        }
    }

    // ── Public Functions ─────────────────────────────────────────────────────

    /// Create a new raffle. Requires authorized account to prevent seller impersonation.
    access(all) fun createRaffle(
        signer: auth(BorrowValue) &Account, title: String, description: String, targetValue: UFix64
    ): UInt64 {
        pre {
            targetValue >= DollarHouseRaffle.minTargetValue: "Target value must be at least $1,000"
            title.length > 0: "Title cannot be empty"
        }

        let seller = signer.address
        let now = getCurrentBlock().timestamp
        let raffleId = self.nextRaffleId
        self.nextRaffleId = self.nextRaffleId + 1

        let raffle <- create Raffle(
            id: raffleId, seller: seller, title: title,
            description: description, targetValue: targetValue,
            createdAt: now, expiresAt: now + self.raffleDuration
        )

        let expiresAt = raffle.expiresAt
        self.raffles[raffleId] <-! raffle

        emit RaffleCreated(raffleId: raffleId, seller: seller, targetValue: targetValue, expiresAt: expiresAt)
        return raffleId
    }

    /// Deposit PYUSD into a raffle. Requires authorized account reference to prevent impersonation.
    /// Yield weight = amount * secondsRemaining — earlier depositors earn higher win probability.
    access(all) fun deposit(raffleId: UInt64, signer: auth(BorrowValue) &Account, payment: @DummyPYUSD.Vault) {
        pre { payment.balance >= DollarHouseRaffle.minDeposit: "Minimum deposit is $10" }

        let depositor = signer.address
        let raffle <- self.raffles.remove(key: raffleId) ?? panic("Raffle not found")
        assert(raffle.status == RaffleStatus.active, message: "Raffle is not active")
        let now = getCurrentBlock().timestamp
        assert(now < raffle.expiresAt, message: "Raffle has expired")
        assert(depositor != raffle.seller, message: "Seller cannot deposit into own raffle")

        let amount = payment.balance
        self.vault.deposit(from: <-payment)

        // Yield weight: larger deposits and earlier deposits get more weight
        let secondsRemaining = raffle.expiresAt - now
        let yieldWeight = amount * secondsRemaining
        let hasExisting = raffle.hasDeposit(depositor)

        if !hasExisting {
            // First deposit from this address
            let dep <- create Deposit(
                depositor: depositor, amount: amount,
                depositedAt: now, yieldWeight: yieldWeight
            )
            raffle.insertDeposit(<- dep)
            raffle.recordDeposit(amount: amount, weight: yieldWeight, isNewDepositor: true)
        } else {
            // Additional deposit or reactivation after withdrawal
            let dep <- raffle.removeDepositResource(depositor)
            if dep.isWithdrawn {
                dep.clearWithdrawn()
            }
            dep.addAmount(amount)
            dep.addYieldWeight(yieldWeight)
            raffle.insertDeposit(<- dep)
            raffle.recordDeposit(amount: amount, weight: yieldWeight, isNewDepositor: false)
        }

        self.raffles[raffleId] <-! raffle
        emit DepositMade(raffleId: raffleId, depositor: depositor, amount: amount)
    }

    /// Withdraw principal from an active raffle. Requires authorized account reference.
    /// The deposit record is preserved with isWithdrawn=true — the depositor retains
    /// win chance proportional to yield already contributed (amount * timeHeld).
    access(all) fun withdraw(raffleId: UInt64, signer: auth(BorrowValue) &Account): @DummyPYUSD.Vault {
        let depositor = signer.address
        let raffle <- self.raffles.remove(key: raffleId) ?? panic("Raffle not found")
        assert(raffle.status == RaffleStatus.active, message: "Raffle is not active")

        let dep <- raffle.removeDepositResource(depositor)
        assert(!dep.isWithdrawn, message: "Already withdrawn")

        let amount = dep.amount
        let estimatedWeight = dep.yieldWeight
        let now = getCurrentBlock().timestamp
        let timeHeld = now - dep.depositedAt
        let actualWeight = amount * timeHeld
        let weightToRemove = estimatedWeight > actualWeight ? estimatedWeight - actualWeight : 0.0

        dep.markWithdrawn()
        dep.setYieldWeight(actualWeight)
        raffle.insertDeposit(<- dep)

        // Subtract principal but do NOT decrement depositorCount —
        // withdrawn depositors retain win chance via their yield weight.
        raffle.subtractPrincipal(amount)
        raffle.removeYieldWeight(weightToRemove)
        self.raffles[raffleId] <-! raffle

        emit WithdrawalMade(raffleId: raffleId, depositor: depositor, amount: amount)
        return <- self.vault.withdraw(amount: amount) as! @DummyPYUSD.Vault
    }

    /// Add yield to a raffle's prize pool. Called by transactions that harvest from SimpleYieldSource.
    /// NOTE: This function is access(all) by design — yield flows from external sources via transactions.
    /// In production, consider restricting to an authorized yield harvester role.
    access(all) fun simulateYield(raffleId: UInt64, yieldVault: @DummyPYUSD.Vault) {
        let raffle <- self.raffles.remove(key: raffleId) ?? panic("Raffle not found")
        assert(raffle.status == RaffleStatus.active, message: "Raffle is not active")

        let amount = yieldVault.balance
        self.vault.deposit(from: <-yieldVault)
        raffle.addYield(amount)
        self.raffles[raffleId] <-! raffle

        emit YieldAdded(raffleId: raffleId, amount: amount)
    }

    /// STEP 1 of settlement: commit randomness request. Can be called by anyone after expiry.
    access(all) fun commitRaffle(raffleId: UInt64) {
        // Validate via reference before moving resources
        let raffleRef = &self.raffles[raffleId] as &Raffle?
            ?? panic("Raffle not found")
        assert(raffleRef.status == RaffleStatus.active, message: "Raffle is not active")
        assert(getCurrentBlock().timestamp >= raffleRef.expiresAt, message: "Raffle has not expired yet")
        assert(raffleRef.getDepositorAddresses().length > 0, message: "No depositors in raffle")

        // Effects: move resource, create randomness request, update status
        let raffle <- self.raffles.remove(key: raffleId)!
        let request <- self.consumer.requestRandomness()
        let commitBlock = request.block
        let old <- self.pendingRequests[raffleId] <- request
        destroy old

        raffle.setStatus(RaffleStatus.committed)
        self.raffles[raffleId] <-! raffle

        emit RaffleCommitted(raffleId: raffleId, commitBlock: commitBlock)
    }

    /// STEP 2 of settlement: reveal the winner using committed randomness.
    /// Must be called in a block after commitRaffle.
    access(all) fun revealWinner(raffleId: UInt64) {
        let raffle <- self.raffles.remove(key: raffleId) ?? panic("Raffle not found")
        assert(raffle.status == RaffleStatus.committed, message: "Raffle must be in committed state")

        let request <- self.pendingRequests.remove(key: raffleId)
            ?? panic("No pending randomness request for this raffle")
        assert(request.canFullfill(), message: "Randomness not yet available. Try in the next block.")

        let randomValue = self.consumer.fulfillRandomRequest(<-request)
        let winnerAddress = raffle.selectWeightedWinner(randomValue: randomValue)
        let isFunded = raffle.totalYield >= raffle.targetValue
        let prizeAmount = isFunded ? raffle.targetValue : raffle.totalYield

        raffle.setWinner(winnerAddress)
        raffle.setStatus(isFunded ? RaffleStatus.completedFunded : RaffleStatus.completedUnfunded)
        self.raffles[raffleId] <-! raffle

        emit WinnerRevealed(raffleId: raffleId, winner: winnerAddress, isFunded: isFunded, prizeAmount: prizeAmount)
    }

    /// Claim deposited principal after raffle completion. Requires authorized account.
    /// Destroys the deposit record — only callable once per depositor.
    access(all) fun claimPrincipal(raffleId: UInt64, signer: auth(BorrowValue) &Account): @DummyPYUSD.Vault {
        let depositor = signer.address

        // Checks via reference before moving any resources
        let raffleRef = &self.raffles[raffleId] as &Raffle?
            ?? panic("Raffle not found")
        assert(
            raffleRef.status == RaffleStatus.completedFunded || raffleRef.status == RaffleStatus.completedUnfunded,
            message: "Raffle is not completed"
        )
        let depView = raffleRef.getDepositView(depositor)
            ?? panic("No deposit found for this address")
        assert(depView.amount > 0.0, message: "No principal to claim (already withdrawn or claimed)")

        // Effects: move resource, remove deposit, return principal
        let raffle <- self.raffles.remove(key: raffleId)!
        let dep <- raffle.removeDepositResource(depositor)
        let amount = dep.amount
        destroy dep

        self.raffles[raffleId] <-! raffle

        emit PrincipalClaimed(raffleId: raffleId, depositor: depositor, amount: amount)
        return <- self.vault.withdraw(amount: amount) as! @DummyPYUSD.Vault
    }

    /// Claim the yield prize. Only callable by the winner, and only once.
    access(all) fun claimPrize(raffleId: UInt64, signer: auth(BorrowValue) &Account): @DummyPYUSD.Vault {
        let winner = signer.address

        // Checks via reference before moving any resources
        let raffleRef = &self.raffles[raffleId] as &Raffle?
            ?? panic("Raffle not found")
        assert(
            raffleRef.status == RaffleStatus.completedFunded || raffleRef.status == RaffleStatus.completedUnfunded,
            message: "Raffle is not completed"
        )
        assert(raffleRef.winner == winner, message: "Only the winner can claim the prize")
        assert(!raffleRef.prizeClaimed, message: "Prize has already been claimed")

        // Effects: move resource, mark prize as claimed, return yield
        let raffle <- self.raffles.remove(key: raffleId)!
        raffle.markPrizeClaimed()
        let prizeAmount = raffle.totalYield
        assert(prizeAmount > 0.0, message: "No yield to claim")

        self.raffles[raffleId] <-! raffle

        emit PrizeClaimed(raffleId: raffleId, winner: winner, amount: prizeAmount)
        return <- self.vault.withdraw(amount: prizeAmount) as! @DummyPYUSD.Vault
    }

    // ── View Functions (Scripts) ─────────────────────────────────────────────

    access(all) view fun getRaffle(raffleId: UInt64): RaffleView? {
        if let raffleRef = &self.raffles[raffleId] as &Raffle? {
            return raffleRef.toView()
        }
        return nil
    }

    access(all) view fun getAllRaffleIds(): [UInt64] {
        return self.raffles.keys
    }

    access(all) view fun getDeposit(raffleId: UInt64, depositor: Address): DepositView? {
        if let raffleRef = &self.raffles[raffleId] as &Raffle? {
            return raffleRef.getDepositView(depositor)
        }
        return nil
    }

    access(all) view fun getDepositors(raffleId: UInt64): [Address] {
        if let raffleRef = &self.raffles[raffleId] as &Raffle? {
            return raffleRef.getDepositorAddresses()
        }
        return []
    }

    access(all) view fun getAllDeposits(raffleId: UInt64): {Address: DepositView} {
        if let raffleRef = &self.raffles[raffleId] as &Raffle? {
            return raffleRef.getAllDepositViews()
        }
        return {}
    }

    access(all) view fun isRaffleExpired(raffleId: UInt64): Bool {
        if let raffleRef = &self.raffles[raffleId] as &Raffle? {
            return getCurrentBlock().timestamp >= raffleRef.expiresAt
        }
        return false
    }

    access(all) view fun isRaffleCommitted(raffleId: UInt64): Bool {
        if let raffleRef = &self.raffles[raffleId] as &Raffle? {
            return raffleRef.status == RaffleStatus.committed
        }
        return false
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    init() {
        self.nextRaffleId = 1
        self.raffles <- {}
        self.vault <- DummyPYUSD.createEmptyVault(vaultType: Type<@DummyPYUSD.Vault>())
        self.consumer <- RandomConsumer.createConsumer()
        self.pendingRequests <- {}
        self.raffleDuration = 2592000.0   // 30 days
        self.minDeposit = 10.0
        self.minTargetValue = 1000.0
    }
}
