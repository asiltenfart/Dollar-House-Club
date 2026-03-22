import "FlowTransactionScheduler"
import "FlowToken"
import "FungibleToken"
import "DollarHouseRaffle"
import "SimpleYieldSource"
import "DummyPYUSD"

/// RaffleScheduler — automates raffle resolution using Flow's native scheduled transactions.
///
/// When a raffle is created, scheduleCommit() queues two automated transactions:
///   1. At expiry: harvests yield → commitRaffle() → schedules reveal
///   2. ~10 seconds later: revealWinner() selects the weighted winner
///
/// This eliminates the need for backend services or keeper bots.
/// The contract deployer's account pays scheduling fees from its FlowToken vault.
///
/// Setup flow:
///   1. Deploy contract (flow project deploy)
///   2. Run setup_scheduler.cdc to create handler, issue capabilities, and configure
///   3. From then on, every create_raffle.cdc call auto-schedules resolution
///
access(all) contract RaffleScheduler {

    // ── Storage Paths ────────────────────────────────────────────────────────

    access(all) let HandlerStoragePath: StoragePath
    access(all) let HandlerPublicPath: PublicPath

    // ── Events ───────────────────────────────────────────────────────────────

    access(all) event CommitScheduled(raffleId: UInt64, executeAt: UFix64)
    access(all) event RevealScheduled(raffleId: UInt64, executeAt: UFix64)
    access(all) event CommitExecuted(raffleId: UInt64)
    access(all) event RevealExecuted(raffleId: UInt64)
    access(all) event Configured()

    // ── Constants ────────────────────────────────────────────────────────────

    /// Delay between commit and reveal in seconds. Must span > 1 block.
    access(all) let revealDelay: UFix64

    /// Execution effort budget for each scheduled transaction.
    access(all) let executionEffort: UInt64

    /// Default FLOW fee per scheduled transaction.
    access(all) let defaultFeeAmount: UFix64

    // ── Phase Constants ──────────────────────────────────────────────────────

    /// Phase identifiers for ScheduledAction (UInt8 for safe AnyStruct serialization).
    access(all) let PHASE_COMMIT: UInt8
    access(all) let PHASE_REVEAL: UInt8

    // ── State ────────────────────────────────────────────────────────────────

    /// Address of the deployer, stored during init() because self.account
    /// is only available in init() in Cadence 1.0.
    access(self) let deployerAddress: Address

    /// Capability to the handler resource for passing to the scheduler.
    access(self) var handlerCap: Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>?

    /// Capability to the deployer's FlowToken vault for paying scheduling fees.
    access(self) var feeProviderCap: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>?

    /// Whether configure() has been called.
    access(all) var isConfigured: Bool

    /// Guard against double-scheduling the same raffle.
    /// Can be cleared via clearSchedule() for recovery if a scheduled tx fails.
    access(self) var scheduledCommits: {UInt64: Bool}

    // ── Scheduled Action ─────────────────────────────────────────────────────

    /// Data payload for scheduled transactions. Identifies raffle and phase.
    /// Uses UInt8 for phase (not enum) to ensure clean AnyStruct serialization.
    access(all) struct ScheduledAction {
        access(all) let raffleId: UInt64
        access(all) let phase: UInt8

        view init(raffleId: UInt64, phase: UInt8) {
            self.raffleId = raffleId
            self.phase = phase
        }
    }

    // ── Handler Resource ─────────────────────────────────────────────────────

    /// Transaction handler invoked by the Flow protocol at the scheduled time.
    /// Delegates all logic to contract-level functions.
    access(all) resource Handler: FlowTransactionScheduler.TransactionHandler {

        /// Called by the Flow scheduler at the target timestamp.
        access(FlowTransactionScheduler.Execute)
        fun executeTransaction(id: UInt64, data: AnyStruct?) {
            let rawAction = data ?? panic("RaffleScheduler: no action data in scheduled transaction")
            let action = rawAction as? RaffleScheduler.ScheduledAction
                ?? panic("RaffleScheduler: invalid action data type")

            if action.phase == RaffleScheduler.PHASE_COMMIT {
                RaffleScheduler.executeCommit(raffleId: action.raffleId)
            } else if action.phase == RaffleScheduler.PHASE_REVEAL {
                RaffleScheduler.executeReveal(raffleId: action.raffleId)
            }
        }

        /// Required by TransactionHandler — returns supported view types.
        access(all) view fun getViews(): [Type] {
            return [Type<StoragePath>(), Type<PublicPath>()]
        }

        /// Required by TransactionHandler — resolves view data.
        access(all) fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<StoragePath>():
                    return RaffleScheduler.HandlerStoragePath
                case Type<PublicPath>():
                    return RaffleScheduler.HandlerPublicPath
                default:
                    return nil
            }
        }
    }

    // ── Factory ──────────────────────────────────────────────────────────────

    /// Create a new Handler resource. Called by setup_scheduler.cdc.
    access(all) fun createHandler(): @Handler {
        return <- create Handler()
    }

    // ── Configuration ────────────────────────────────────────────────────────

    /// Configure the scheduler. Only the contract deployer can call this.
    /// Can be called again to update capabilities (e.g., rotate fee vault).
    access(all) fun configure(
        admin: auth(BorrowValue) &Account,
        handlerCap: Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>,
        feeProviderCap: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>
    ) {
        pre {
            admin.address == self.deployerAddress: "Only the contract deployer can configure"
        }

        self.handlerCap = handlerCap
        self.feeProviderCap = feeProviderCap
        self.isConfigured = true

        emit Configured()
    }

    // ── Public Scheduling ────────────────────────────────────────────────────

    /// Schedule the commit transaction at raffle expiry.
    /// Called from create_raffle.cdc after raffle creation.
    /// The deployer pays FLOW fees for scheduling.
    access(all) fun scheduleCommit(raffleId: UInt64, expiresAt: UFix64) {
        pre {
            self.isConfigured: "Scheduler not configured. Run setup_scheduler.cdc first."
            self.scheduledCommits[raffleId] == nil: "Raffle already scheduled"
        }

        // Validate the raffle exists and is active
        let raffleView = DollarHouseRaffle.getRaffle(raffleId: raffleId)
            ?? panic("Raffle does not exist")
        assert(
            raffleView.status.rawValue == DollarHouseRaffle.RaffleStatus.active.rawValue,
            message: "Raffle is not active"
        )

        self.scheduledCommits[raffleId] = true
        self.internalSchedule(
            raffleId: raffleId,
            phase: self.PHASE_COMMIT,
            executeAt: expiresAt
        )

        emit CommitScheduled(raffleId: raffleId, executeAt: expiresAt)
    }

    /// Clear the schedule flag for a raffle. Used for recovery if a scheduled tx fails
    /// and the raffle needs to be re-scheduled. Only the deployer can call this.
    access(all) fun clearSchedule(admin: auth(BorrowValue) &Account, raffleId: UInt64) {
        pre {
            admin.address == self.deployerAddress: "Only the contract deployer can clear schedules"
        }
        self.scheduledCommits.remove(key: raffleId)
    }

    /// Check if a raffle has been scheduled for automated resolution.
    access(all) view fun isScheduled(raffleId: UInt64): Bool {
        return self.scheduledCommits[raffleId] ?? false
    }

    // ── Internal Execution (called by Handler) ───────────────────────────────

    /// Phase 1: Harvest yield → commit raffle → schedule reveal.
    access(contract) fun executeCommit(raffleId: UInt64) {
        // 1. Harvest and apply any pending yield before committing
        if let yieldVault <- SimpleYieldSource.harvestYield(poolId: raffleId) {
            DollarHouseRaffle.simulateYield(raffleId: raffleId, yieldVault: <-yieldVault)
        }

        // 2. Commit raffle — requests VRF randomness
        DollarHouseRaffle.commitRaffle(raffleId: raffleId)

        emit CommitExecuted(raffleId: raffleId)

        // 3. Schedule reveal after a delay to ensure randomness is available
        let revealTime = getCurrentBlock().timestamp + self.revealDelay
        self.internalSchedule(
            raffleId: raffleId,
            phase: self.PHASE_REVEAL,
            executeAt: revealTime
        )

        emit RevealScheduled(raffleId: raffleId, executeAt: revealTime)
    }

    /// Phase 2: Reveal the winner using committed randomness.
    access(contract) fun executeReveal(raffleId: UInt64) {
        DollarHouseRaffle.revealWinner(raffleId: raffleId)

        emit RevealExecuted(raffleId: raffleId)
    }

    // ── Core Scheduling Logic ────────────────────────────────────────────────

    /// Withdraw FLOW fees and call FlowTransactionScheduler.schedule().
    /// The returned ScheduledTransaction resource is destroyed — the scheduling
    /// is registered in FlowTransactionScheduler's internal state and persists
    /// independently of the resource. Cancellation uses Manager.cancel(), not
    /// resource destruction.
    access(self) fun internalSchedule(raffleId: UInt64, phase: UInt8, executeAt: UFix64) {
        let handlerCap = self.handlerCap
            ?? panic("Handler capability not set")
        let feeProvider = self.feeProviderCap
            ?? panic("Fee provider capability not set")
        let feeVaultRef = feeProvider.borrow()
            ?? panic("Cannot borrow fee provider — check FlowToken vault at /storage/flowTokenVault")

        let actionData = ScheduledAction(raffleId: raffleId, phase: phase)

        // Withdraw FLOW for the scheduling fee
        let fees <- feeVaultRef.withdraw(amount: self.defaultFeeAmount) as! @FlowToken.Vault

        // Schedule the transaction via FlowTransactionScheduler
        let scheduledTx <- FlowTransactionScheduler.schedule(
            handlerCap: handlerCap,
            data: actionData,
            timestamp: executeAt,
            priority: FlowTransactionScheduler.Priority.Medium,
            executionEffort: self.executionEffort,
            fees: <-fees
        )
        // The ScheduledTransaction resource is a receipt — destroying it does NOT
        // cancel the scheduling. The execution is registered in the scheduler's
        // internal state. This prevents unbounded storage growth.
        destroy scheduledTx
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    init() {
        self.HandlerStoragePath = /storage/RaffleSchedulerHandler
        self.HandlerPublicPath = /public/RaffleSchedulerHandler

        self.revealDelay = 10.0        // 10 seconds between commit and reveal
        self.executionEffort = 2000    // Conservative execution budget
        self.defaultFeeAmount = 0.01   // FLOW fee per scheduled tx

        self.PHASE_COMMIT = 0
        self.PHASE_REVEAL = 1

        // Store deployer address — self.account is only available in init()
        self.deployerAddress = self.account.address

        self.handlerCap = nil
        self.feeProviderCap = nil
        self.isConfigured = false
        self.scheduledCommits = {}
    }
}
