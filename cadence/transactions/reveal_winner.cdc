import "DollarHouseRaffle"

/// STEP 2 of raffle settlement: Reveal the winner using committed randomness.
/// Must be called in a block AFTER commitRaffle().
/// This completes the commit-reveal pattern for secure onchain randomness.
///
transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        DollarHouseRaffle.revealWinner(raffleId: raffleId)
    }
}
