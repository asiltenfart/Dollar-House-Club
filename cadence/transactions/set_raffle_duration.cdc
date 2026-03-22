import "DollarHouseRaffle"

/// Set the raffle duration for newly created raffles.
/// Only the contract deployer can call this.
/// duration is in seconds (e.g., 60.0 for 1 minute, 2592000.0 for 30 days).
///
transaction(duration: UFix64) {
    prepare(signer: auth(BorrowValue) &Account) {
        DollarHouseRaffle.setRaffleDuration(admin: signer, duration: duration)
    }
}
