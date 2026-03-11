import "DummyPYUSD"
import "DollarHouseRaffle"

/// Simulates yield for a raffle by minting PYUSD and adding it as yield.
/// For demo/testing only.
///
transaction(raffleId: UInt64, yieldAmount: UFix64) {
    prepare(signer: auth(BorrowValue) &Account) {
        // Mint yield tokens
        let yieldVault <- DummyPYUSD.mint(amount: yieldAmount)

        // Add yield to raffle
        DollarHouseRaffle.simulateYield(raffleId: raffleId, yieldVault: <-yieldVault)
    }
}
