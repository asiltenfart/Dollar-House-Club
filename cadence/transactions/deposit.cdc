import "FungibleToken"
import "DummyPYUSD"
import "DollarHouseRaffle"

/// Deposits PYUSD into a raffle.
///
transaction(raffleId: UInt64, amount: UFix64) {
    prepare(signer: auth(BorrowValue) &Account) {
        // Withdraw from signer's PYUSD vault
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &DummyPYUSD.Vault>(
            from: DummyPYUSD.VaultStoragePath
        ) ?? panic("No DummyPYUSD vault found. Set up your vault first.")

        let payment <- vaultRef.withdraw(amount: amount) as! @DummyPYUSD.Vault

        // Deposit into raffle
        DollarHouseRaffle.deposit(
            raffleId: raffleId,
            depositor: signer.address,
            payment: <-payment
        )
    }
}
