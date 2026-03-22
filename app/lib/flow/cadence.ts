// ── Cadence transaction and script strings for frontend use ──────────────────
// These are inlined so they work with FCL's mutate/query without file reads.

// Contract address is resolved by FCL via flow.json aliases.
// In Cadence 1.0, we use string imports like "DollarHouseRaffle" and FCL resolves them.

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const MINT_PYUSD = `
import "FungibleToken"
import "DummyPYUSD"

transaction(amount: UFix64) {
    prepare(signer: auth(BorrowValue, SaveValue, Capabilities) &Account) {
        if signer.storage.borrow<&DummyPYUSD.Vault>(from: DummyPYUSD.VaultStoragePath) == nil {
            let vault <- DummyPYUSD.createEmptyVault(vaultType: Type<@DummyPYUSD.Vault>())
            signer.storage.save(<-vault, to: DummyPYUSD.VaultStoragePath)
            let cap = signer.capabilities.storage.issue<&DummyPYUSD.Vault>(DummyPYUSD.VaultStoragePath)
            signer.capabilities.publish(cap, at: DummyPYUSD.VaultPublicPath)
        }
        let mintedVault <- DummyPYUSD.mint(amount: amount)
        let vaultRef = signer.storage.borrow<&DummyPYUSD.Vault>(from: DummyPYUSD.VaultStoragePath)!
        vaultRef.deposit(from: <-mintedVault)
    }
}
`;

export const CREATE_RAFFLE = `
import "DollarHouseRaffle"
import "RaffleScheduler"

transaction(title: String, description: String, targetValue: UFix64) {
    prepare(signer: auth(BorrowValue) &Account) {
        let raffleId = DollarHouseRaffle.createRaffle(
            signer: signer,
            title: title,
            description: description,
            targetValue: targetValue
        )
        // Auto-schedule resolution at expiry if scheduler is configured
        if RaffleScheduler.isConfigured {
            let raffleView = DollarHouseRaffle.getRaffle(raffleId: raffleId)!
            RaffleScheduler.scheduleCommit(
                raffleId: raffleId,
                expiresAt: raffleView.expiresAt
            )
        }
    }
}
`;

export const DEPOSIT_TO_RAFFLE = `
import "FungibleToken"
import "DummyPYUSD"
import "DollarHouseRaffle"
import "SimpleYieldSource"

transaction(raffleId: UInt64, amount: UFix64) {
    prepare(signer: auth(BorrowValue) &Account) {
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &DummyPYUSD.Vault>(
            from: DummyPYUSD.VaultStoragePath
        ) ?? panic("No DummyPYUSD vault found. Get demo funds first.")
        let payment <- vaultRef.withdraw(amount: amount) as! @DummyPYUSD.Vault
        DollarHouseRaffle.deposit(
            raffleId: raffleId,
            signer: signer,
            payment: <-payment
        )
        SimpleYieldSource.notifyDeposit(poolId: raffleId, additionalAmount: amount)
    }
}
`;

export const WITHDRAW_FROM_RAFFLE = `
import "FungibleToken"
import "DummyPYUSD"
import "DollarHouseRaffle"
import "SimpleYieldSource"

transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        if let yieldVault <- SimpleYieldSource.harvestYield(poolId: raffleId) {
            DollarHouseRaffle.simulateYield(raffleId: raffleId, yieldVault: <-yieldVault)
        }
        let returned <- DollarHouseRaffle.withdraw(raffleId: raffleId, signer: signer)
        let withdrawnAmount = returned.balance
        let vaultRef = signer.storage.borrow<&DummyPYUSD.Vault>(
            from: DummyPYUSD.VaultStoragePath
        ) ?? panic("No DummyPYUSD vault found")
        vaultRef.deposit(from: <-returned)
        SimpleYieldSource.notifyWithdrawal(poolId: raffleId, withdrawnAmount: withdrawnAmount)
    }
}
`;

export const COMMIT_RAFFLE = `
import "DollarHouseRaffle"
import "SimpleYieldSource"

transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        if let yieldVault <- SimpleYieldSource.harvestYield(poolId: raffleId) {
            DollarHouseRaffle.simulateYield(raffleId: raffleId, yieldVault: <-yieldVault)
        }
        DollarHouseRaffle.commitRaffle(raffleId: raffleId)
    }
}
`;

export const REVEAL_WINNER = `
import "DollarHouseRaffle"

transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        DollarHouseRaffle.revealWinner(raffleId: raffleId)
    }
}
`;

export const SIMULATE_YIELD = `
import "DummyPYUSD"
import "DollarHouseRaffle"

transaction(raffleId: UInt64, yieldAmount: UFix64) {
    prepare(signer: auth(BorrowValue) &Account) {
        let yieldVault <- DummyPYUSD.mint(amount: yieldAmount)
        DollarHouseRaffle.simulateYield(raffleId: raffleId, yieldVault: <-yieldVault)
    }
}
`;

export const CLAIM_PRINCIPAL = `
import "DummyPYUSD"
import "DollarHouseRaffle"

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
`;

export const CLAIM_PRIZE = `
import "DummyPYUSD"
import "DollarHouseRaffle"

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
`;

// ═══════════════════════════════════════════════════════════════════════════════
// SCRIPTS
// ═══════════════════════════════════════════════════════════════════════════════

export const GET_PYUSD_BALANCE = `
import "FungibleToken"
import "DummyPYUSD"

access(all) fun main(address: Address): UFix64 {
    let account = getAccount(address)
    let vaultRef = account.capabilities.borrow<&DummyPYUSD.Vault>(DummyPYUSD.VaultPublicPath)
    if let vault = vaultRef {
        return vault.balance
    }
    return 0.0
}
`;

export const GET_RAFFLE = `
import "DollarHouseRaffle"

access(all) fun main(raffleId: UInt64): DollarHouseRaffle.RaffleView? {
    return DollarHouseRaffle.getRaffle(raffleId: raffleId)
}
`;

export const GET_ALL_RAFFLE_IDS = `
import "DollarHouseRaffle"

access(all) fun main(): [UInt64] {
    return DollarHouseRaffle.getAllRaffleIds()
}
`;

export const GET_ALL_RAFFLES = `
import "DollarHouseRaffle"

access(all) fun main(): [DollarHouseRaffle.RaffleView] {
    let ids = DollarHouseRaffle.getAllRaffleIds()
    let results: [DollarHouseRaffle.RaffleView] = []
    for id in ids {
        if let raffle = DollarHouseRaffle.getRaffle(raffleId: id) {
            results.append(raffle)
        }
    }
    return results
}
`;

export const GET_DEPOSIT = `
import "DollarHouseRaffle"

access(all) fun main(raffleId: UInt64, depositor: Address): DollarHouseRaffle.DepositView? {
    return DollarHouseRaffle.getDeposit(raffleId: raffleId, depositor: depositor)
}
`;

export const GET_ALL_DEPOSITS = `
import "DollarHouseRaffle"

access(all) fun main(raffleId: UInt64): {Address: DollarHouseRaffle.DepositView} {
    return DollarHouseRaffle.getAllDeposits(raffleId: raffleId)
}
`;

export const HARVEST_YIELD = `
import "DollarHouseRaffle"
import "SimpleYieldSource"

transaction(raffleId: UInt64) {
    prepare(signer: auth(BorrowValue) &Account) {
        if let yieldVault <- SimpleYieldSource.harvestYield(poolId: raffleId) {
            DollarHouseRaffle.simulateYield(raffleId: raffleId, yieldVault: <-yieldVault)
        }
    }
}
`;

export const GET_PENDING_YIELD = `
import "SimpleYieldSource"

access(all) fun main(raffleId: UInt64): UFix64 {
    return SimpleYieldSource.getPendingYield(poolId: raffleId)
}
`;

export const IS_RAFFLE_EXPIRED = `
import "DollarHouseRaffle"

access(all) fun main(raffleId: UInt64): Bool {
    return DollarHouseRaffle.isRaffleExpired(raffleId: raffleId)
}
`;

export const IS_RAFFLE_COMMITTED = `
import "DollarHouseRaffle"

access(all) fun main(raffleId: UInt64): Bool {
    return DollarHouseRaffle.isRaffleCommitted(raffleId: raffleId)
}
`;
