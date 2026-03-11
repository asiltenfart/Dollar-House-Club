import "DollarHouseRaffle"

/// Creates a new property raffle.
///
transaction(title: String, description: String, targetValue: UFix64) {
    prepare(signer: auth(BorrowValue) &Account) {
        let raffleId = DollarHouseRaffle.createRaffle(
            seller: signer.address,
            title: title,
            description: description,
            targetValue: targetValue
        )
    }
}
