import "DummyPYUSD"
import "DollarHouseRaffle"

/// Claim principal after a raffle is completed.
/// Depositor identity is derived from the signer — prevents impersonation.
///
transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        let returned <- DollarHouseRaffle.claimPrincipal(
            raffleId: raffleId,
            signer: signer
        )

        let vaultRef = signer.storage.borrow<&DummyPYUSD.Vault>(
            from: DummyPYUSD.VaultStoragePath
        ) ?? panic("No DummyPYUSD vault found")

        vaultRef.deposit(from: <-returned)
    }
}
