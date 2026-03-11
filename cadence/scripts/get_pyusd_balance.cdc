import "FungibleToken"
import "DummyPYUSD"

/// Returns the PYUSD balance for a given address.
///
access(all) fun main(address: Address): UFix64 {
    let account = getAccount(address)
    let vaultRef = account.capabilities.borrow<&DummyPYUSD.Vault>(DummyPYUSD.VaultPublicPath)
    if let vault = vaultRef {
        return vault.balance
    }
    return 0.0
}
