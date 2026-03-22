import "FungibleToken"
import "DummyPYUSD"
import "DollarHouseRaffle"
import "SimpleYieldSource"

/// Deposits PYUSD into a raffle and notifies the yield source.
/// Depositor identity is derived from the signer — prevents impersonation.
///
transaction(raffleId: UInt64, amount: UFix64) {
    prepare(signer: auth(BorrowValue) &Account) {
        // Withdraw from signer's PYUSD vault
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &DummyPYUSD.Vault>(
            from: DummyPYUSD.VaultStoragePath
        ) ?? panic("No DummyPYUSD vault found. Set up your vault first.")

        let payment <- vaultRef.withdraw(amount: amount) as! @DummyPYUSD.Vault

        // Deposit into raffle — signer proves identity
        DollarHouseRaffle.deposit(raffleId: raffleId, signer: signer, payment: <-payment)

        // Notify yield source of new principal
        SimpleYieldSource.notifyDeposit(poolId: raffleId, additionalAmount: amount)
    }
}
