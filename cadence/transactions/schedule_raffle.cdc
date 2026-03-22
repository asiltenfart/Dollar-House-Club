import "DollarHouseRaffle"
import "RaffleScheduler"

/// Manually schedule resolution for an existing raffle.
/// Used if the raffle was created before the scheduler was configured,
/// or as a fallback if auto-scheduling was skipped.
///
transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        let raffleView = DollarHouseRaffle.getRaffle(raffleId: raffleId)
            ?? panic("Raffle not found")
        RaffleScheduler.scheduleCommit(
            raffleId: raffleId,
            expiresAt: raffleView.expiresAt
        )
    }
}
