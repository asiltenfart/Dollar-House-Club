import "FungibleToken"
import "DummyPYUSD"

/// Sets up a DummyPYUSD vault in the signer's account if one doesn't exist.
///
transaction {
    prepare(signer: auth(BorrowValue, SaveValue, Capabilities) &Account) {
        // Check if vault already exists
        if signer.storage.borrow<&DummyPYUSD.Vault>(from: DummyPYUSD.VaultStoragePath) != nil {
            return
        }

        // Create and save empty vault
        let vault <- DummyPYUSD.createEmptyVault(vaultType: Type<@DummyPYUSD.Vault>())
        signer.storage.save(<-vault, to: DummyPYUSD.VaultStoragePath)

        // Create public capability
        let cap = signer.capabilities.storage.issue<&DummyPYUSD.Vault>(DummyPYUSD.VaultStoragePath)
        signer.capabilities.publish(cap, at: DummyPYUSD.VaultPublicPath)
    }
}
