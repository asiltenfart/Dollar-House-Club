import "DollarHouseRaffle"
import "SimpleYieldSource"

/// Harvests accrued yield from SimpleYieldSource and feeds it into the raffle.
/// Anyone can call this to materialize pending yield on-chain.
///
transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        if let yieldVault <- SimpleYieldSource.harvestYield(poolId: raffleId) {
            DollarHouseRaffle.simulateYield(raffleId: raffleId, yieldVault: <-yieldVault)
        }
    }
}
