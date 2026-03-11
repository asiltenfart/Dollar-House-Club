import "FungibleToken"
import "DummyPYUSD"

/// Mints demo PYUSD tokens and deposits them into the signer's vault.
/// Sets up the vault if it doesn't exist.
///
transaction(amount: UFix64) {
    prepare(signer: auth(BorrowValue, SaveValue, Capabilities) &Account) {
        // Setup vault if needed
        if signer.storage.borrow<&DummyPYUSD.Vault>(from: DummyPYUSD.VaultStoragePath) == nil {
            let vault <- DummyPYUSD.createEmptyVault(vaultType: Type<@DummyPYUSD.Vault>())
            signer.storage.save(<-vault, to: DummyPYUSD.VaultStoragePath)
            let cap = signer.capabilities.storage.issue<&DummyPYUSD.Vault>(DummyPYUSD.VaultStoragePath)
            signer.capabilities.publish(cap, at: DummyPYUSD.VaultPublicPath)
        }

        // Mint tokens (open mint — anyone can call)
        let mintedVault <- DummyPYUSD.mint(amount: amount)

        // Deposit into signer's vault
        let vaultRef = signer.storage.borrow<&DummyPYUSD.Vault>(from: DummyPYUSD.VaultStoragePath)!
        vaultRef.deposit(from: <-mintedVault)
    }
}
