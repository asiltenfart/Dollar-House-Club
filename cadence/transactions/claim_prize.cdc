import "DummyPYUSD"
import "DollarHouseRaffle"

/// Winner claims the yield prize after raffle completion.
/// Winner identity is derived from the signer — prevents impersonation.
///
transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        let prize <- DollarHouseRaffle.claimPrize(
            raffleId: raffleId,
            signer: signer
        )

        let vaultRef = signer.storage.borrow<&DummyPYUSD.Vault>(
            from: DummyPYUSD.VaultStoragePath
        ) ?? panic("No DummyPYUSD vault found")

        vaultRef.deposit(from: <-prize)
    }
}
