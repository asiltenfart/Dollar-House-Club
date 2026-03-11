import "FungibleToken"
import "MetadataViews"
import "FungibleTokenMetadataViews"

/// DummyPYUSD is a demo stablecoin with an open mint function so anyone can get test funds.
/// It implements the FungibleToken standard on Flow Cadence 1.0.
///
access(all) contract DummyPYUSD: FungibleToken {

    access(all) event TokensMinted(amount: UFix64, type: String)

    access(all) var totalSupply: UFix64

    access(all) let VaultStoragePath: StoragePath
    access(all) let VaultPublicPath: PublicPath
    access(all) let ReceiverPublicPath: PublicPath

    // ── Metadata Views ──────────────────────────────────────────────────────

    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return [
            Type<FungibleTokenMetadataViews.FTView>(),
            Type<FungibleTokenMetadataViews.FTDisplay>(),
            Type<FungibleTokenMetadataViews.FTVaultData>(),
            Type<FungibleTokenMetadataViews.TotalSupply>()
        ]
    }

    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        switch viewType {
            case Type<FungibleTokenMetadataViews.FTView>():
                return FungibleTokenMetadataViews.FTView(
                    ftDisplay: self.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTDisplay>()) as! FungibleTokenMetadataViews.FTDisplay?,
                    ftVaultData: self.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
                )
            case Type<FungibleTokenMetadataViews.FTDisplay>():
                let media = MetadataViews.Media(
                    file: MetadataViews.HTTPFile(url: "https://dollarhouseclub.com/pyusd-icon.svg"),
                    mediaType: "image/svg+xml"
                )
                return FungibleTokenMetadataViews.FTDisplay(
                    name: "Demo PYUSD",
                    symbol: "PYUSD",
                    description: "A demo stablecoin for Dollar House Club testing. Not real money.",
                    externalURL: MetadataViews.ExternalURL("https://dollarhouseclub.com"),
                    logos: MetadataViews.Medias([media]),
                    socials: {}
                )
            case Type<FungibleTokenMetadataViews.FTVaultData>():
                return FungibleTokenMetadataViews.FTVaultData(
                    storagePath: self.VaultStoragePath,
                    receiverPath: self.VaultPublicPath,
                    metadataPath: self.VaultPublicPath,
                    receiverLinkedType: Type<&DummyPYUSD.Vault>(),
                    metadataLinkedType: Type<&DummyPYUSD.Vault>(),
                    createEmptyVaultFunction: (fun(): @{FungibleToken.Vault} {
                        return <-DummyPYUSD.createEmptyVault(vaultType: Type<@DummyPYUSD.Vault>())
                    })
                )
            case Type<FungibleTokenMetadataViews.TotalSupply>():
                return FungibleTokenMetadataViews.TotalSupply(totalSupply: DummyPYUSD.totalSupply)
        }
        return nil
    }

    // ── Vault ────────────────────────────────────────────────────────────────

    access(all) resource Vault: FungibleToken.Vault {

        access(all) var balance: UFix64

        init(balance: UFix64) {
            self.balance = balance
        }

        access(contract) fun burnCallback() {
            if self.balance > 0.0 {
                DummyPYUSD.totalSupply = DummyPYUSD.totalSupply - self.balance
            }
            self.balance = 0.0
        }

        access(all) view fun getViews(): [Type] {
            return DummyPYUSD.getContractViews(resourceType: nil)
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            return DummyPYUSD.resolveContractView(resourceType: nil, viewType: view)
        }

        access(all) view fun getSupportedVaultTypes(): {Type: Bool} {
            let supportedTypes: {Type: Bool} = {}
            supportedTypes[self.getType()] = true
            return supportedTypes
        }

        access(all) view fun isSupportedVaultType(type: Type): Bool {
            return self.getSupportedVaultTypes()[type] ?? false
        }

        access(all) view fun isAvailableToWithdraw(amount: UFix64): Bool {
            return amount <= self.balance
        }

        access(FungibleToken.Withdraw) fun withdraw(amount: UFix64): @DummyPYUSD.Vault {
            self.balance = self.balance - amount
            return <-create Vault(balance: amount)
        }

        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            let vault <- from as! @DummyPYUSD.Vault
            self.balance = self.balance + vault.balance
            vault.balance = 0.0
            destroy vault
        }

        access(all) fun createEmptyVault(): @DummyPYUSD.Vault {
            return <-create Vault(balance: 0.0)
        }
    }

    // ── Public Functions ─────────────────────────────────────────────────────

    access(all) fun createEmptyVault(vaultType: Type): @DummyPYUSD.Vault {
        return <-create Vault(balance: 0.0)
    }

    /// Open mint: anyone can call this to get demo funds.
    /// Mints `amount` tokens and returns them as a Vault.
    access(all) fun mint(amount: UFix64): @DummyPYUSD.Vault {
        pre {
            amount > 0.0: "DummyPYUSD.mint: Amount must be greater than 0"
            amount <= 10000.0: "DummyPYUSD.mint: Maximum mint is 10,000 per call"
        }
        self.totalSupply = self.totalSupply + amount
        let vault <- create Vault(balance: amount)
        emit TokensMinted(amount: amount, type: vault.getType().identifier)
        return <-vault
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    init() {
        self.totalSupply = 0.0
        self.VaultStoragePath = /storage/dummyPYUSDVault
        self.VaultPublicPath = /public/dummyPYUSDVault
        self.ReceiverPublicPath = /public/dummyPYUSDReceiver

        // Save an empty vault for the deploying account
        let vault <- create Vault(balance: 0.0)
        self.account.storage.save(<-vault, to: self.VaultStoragePath)

        let cap = self.account.capabilities.storage.issue<&DummyPYUSD.Vault>(self.VaultStoragePath)
        self.account.capabilities.publish(cap, at: self.VaultPublicPath)
    }
}
