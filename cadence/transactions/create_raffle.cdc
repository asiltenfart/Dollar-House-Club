import "DollarHouseRaffle"
import "RaffleScheduler"

/// Creates a new property raffle and schedules automated resolution at expiry.
/// Seller identity is derived from the signer.
/// The RaffleScheduler automatically commits and reveals the winner after the 30-day window.
///
transaction(title: String, description: String, targetValue: UFix64) {
    prepare(signer: auth(BorrowValue) &Account) {
        let raffleId = DollarHouseRaffle.createRaffle(
            signer: signer,
            title: title,
            description: description,
            targetValue: targetValue
        )

        // Schedule automated resolution at expiry (commit + reveal)
        if RaffleScheduler.isConfigured {
            let raffleView = DollarHouseRaffle.getRaffle(raffleId: raffleId)!
            RaffleScheduler.scheduleCommit(
                raffleId: raffleId,
                expiresAt: raffleView.expiresAt
            )
        }
    }
}
