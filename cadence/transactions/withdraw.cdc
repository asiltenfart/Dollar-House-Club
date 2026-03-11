import "FungibleToken"
import "DummyPYUSD"
import "DollarHouseRaffle"

/// Withdraws principal from a raffle and deposits it back into the signer's vault.
///
transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
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
    }
}
