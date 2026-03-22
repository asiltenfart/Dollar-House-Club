import "FungibleToken"
import "DummyPYUSD"
import "DollarHouseRaffle"
import "SimpleYieldSource"

/// Withdraws principal from a raffle, harvests pending yield, and notifies yield source.
/// Depositor identity is derived from the signer — prevents impersonation.
///
transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        // Harvest any pending yield before withdrawal
        if let yieldVault <- SimpleYieldSource.harvestYield(poolId: raffleId) {
            DollarHouseRaffle.simulateYield(raffleId: raffleId, yieldVault: <-yieldVault)
        }

        // Withdraw from raffle — signer proves identity
        let returned <- DollarHouseRaffle.withdraw(raffleId: raffleId, signer: signer)
        let withdrawnAmount = returned.balance

        // Deposit back into signer's vault
        let vaultRef = signer.storage.borrow<&DummyPYUSD.Vault>(
            from: DummyPYUSD.VaultStoragePath
        ) ?? panic("No DummyPYUSD vault found")

        vaultRef.deposit(from: <-returned)

        // Notify yield source of withdrawn principal
        SimpleYieldSource.notifyWithdrawal(poolId: raffleId, withdrawnAmount: withdrawnAmount)
    }
}
