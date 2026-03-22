import "FungibleToken"
import "DummyPYUSD"

/// Sets up a DummyPYUSD vault (if needed) and mints tokens into it.
/// Used by tests to give accounts starting balances.
///
transaction(amount: UFix64) {
    prepare(signer: auth(BorrowValue, SaveValue, Capabilities) &Account) {
        // Create vault if it doesn't exist
        if signer.storage.borrow<&DummyPYUSD.Vault>(from: DummyPYUSD.VaultStoragePath) == nil {
            let vault <- DummyPYUSD.createEmptyVault(vaultType: Type<@DummyPYUSD.Vault>())
            signer.storage.save(<-vault, to: DummyPYUSD.VaultStoragePath)
            let cap = signer.capabilities.storage.issue<&DummyPYUSD.Vault>(DummyPYUSD.VaultStoragePath)
            signer.capabilities.publish(cap, at: DummyPYUSD.VaultPublicPath)
        }

        // Mint and deposit
        let minted <- DummyPYUSD.mint(amount: amount)
        let vaultRef = signer.storage.borrow<&DummyPYUSD.Vault>(from: DummyPYUSD.VaultStoragePath)!
        vaultRef.deposit(from: <-minted)
    }
}
