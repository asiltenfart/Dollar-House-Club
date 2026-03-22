import "FungibleToken"
import "DummyPYUSD"
import "DollarHouseRaffle"
import "SimpleYieldSource"

/// Withdraws principal from a raffle, harvests pending yield, and notifies yield source.
///
transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        // Harvest any pending yield before withdrawal
        if let yieldVault <- SimpleYieldSource.harvestYield(poolId: raffleId) {
            DollarHouseRaffle.simulateYield(raffleId: raffleId, yieldVault: <-yieldVault)
        }

        // Get the deposit amount before withdrawing (for notifying yield source)
        let depositInfo = DollarHouseRaffle.getDeposit(raffleId: raffleId, depositor: signer.address)
            ?? panic("No deposit found")
        let depositAmount = depositInfo.amount

        // Withdraw from raffle
        let returned <- DollarHouseRaffle.withdraw(
            raffleId: raffleId,
            depositor: signer.address
        )

        // Deposit back into signer's vault
        let vaultRef = signer.storage.borrow<&DummyPYUSD.Vault>(
            from: DummyPYUSD.VaultStoragePath
        ) ?? panic("No DummyPYUSD vault found")

        vaultRef.deposit(from: <-returned)

        // Notify yield source of withdrawn principal
        SimpleYieldSource.notifyWithdrawal(poolId: raffleId, withdrawnAmount: depositAmount)
    }
}
