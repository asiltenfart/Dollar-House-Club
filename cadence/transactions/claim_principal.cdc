import "DummyPYUSD"
import "DollarHouseRaffle"

/// Claim principal after a raffle is completed.
///
transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        let returned <- DollarHouseRaffle.claimPrincipal(
            raffleId: raffleId,
            depositor: signer.address
        )

        let vaultRef = signer.storage.borrow<&DummyPYUSD.Vault>(
            from: DummyPYUSD.VaultStoragePath
        ) ?? panic("No DummyPYUSD vault found")

        vaultRef.deposit(from: <-returned)
    }
}
