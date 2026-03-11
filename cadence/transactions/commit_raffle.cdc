import "DollarHouseRaffle"

/// STEP 1 of raffle settlement: Commit the randomness request.
/// Can be called by anyone after the raffle has expired.
/// This is the first of two transactions required for secure onchain randomness.
///
transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        DollarHouseRaffle.commitRaffle(raffleId: raffleId)
    }
}
