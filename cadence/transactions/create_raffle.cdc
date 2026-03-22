import "DollarHouseRaffle"

/// Creates a new property raffle. Seller identity is derived from the signer.
///
transaction(title: String, description: String, targetValue: UFix64) {
    prepare(signer: auth(BorrowValue) &Account) {
        let raffleId = DollarHouseRaffle.createRaffle(
            signer: signer,
            title: title,
            description: description,
            targetValue: targetValue
        )
    }
}
