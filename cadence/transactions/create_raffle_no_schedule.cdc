import "DollarHouseRaffle"

/// Creates a new raffle WITHOUT auto-scheduling resolution.
/// Used for manual testing of the commit → reveal → claim flow.
///
transaction(title: String, description: String, targetValue: UFix64) {
    prepare(signer: auth(BorrowValue) &Account) {
        DollarHouseRaffle.createRaffle(
            signer: signer,
            title: title,
            description: description,
            targetValue: targetValue
        )
    }
}
