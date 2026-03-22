import "DummyPYUSD"

/// SimpleYieldSource — a modular yield generator for testing.
///
/// Tracks principal amounts per pool (keyed by UInt64) and calculates
/// yield at a fixed APY rate based on block timestamps. When harvested,
/// mints DummyPYUSD as yield and returns it to the caller.
///
/// This contract is completely independent of DollarHouseRaffle.
/// Transactions wire them together — swap this contract for a real
/// lending protocol (Aave, Compound, etc.) without touching the raffle.
///
access(all) contract SimpleYieldSource {

    // ── Events ───────────────────────────────────────────────────────────────

    access(all) event PoolUpdated(poolId: UInt64, totalPrincipal: UFix64)
    access(all) event YieldHarvested(poolId: UInt64, amount: UFix64)

    // ── State ────────────────────────────────────────────────────────────────

    /// Annual yield rate: 5.0 = 500% APY
    access(all) let annualRate: UFix64

    /// Seconds in a year (365 days)
    access(all) let secondsPerYear: UFix64

    /// Pool tracking: poolId -> PoolInfo
    access(self) let pools: {UInt64: PoolInfo}

    // ── Data Structures ──────────────────────────────────────────────────────

    access(all) struct PoolInfo {
        /// Total principal currently in this pool
        access(all) var totalPrincipal: UFix64

        /// Last time yield was harvested (block timestamp)
        access(all) var lastHarvestTime: UFix64

        init(totalPrincipal: UFix64, lastHarvestTime: UFix64) {
            self.totalPrincipal = totalPrincipal
            self.lastHarvestTime = lastHarvestTime
        }

        access(contract) fun setPrincipal(_ amount: UFix64) {
            self.totalPrincipal = amount
        }

        access(contract) fun setLastHarvestTime(_ time: UFix64) {
            self.lastHarvestTime = time
        }
    }

    // ── Public Functions ─────────────────────────────────────────────────────

    /// Notify the yield source that a pool's total principal has changed.
    /// Should be called after every deposit or withdrawal.
    /// Automatically harvests pending yield before updating principal
    /// so yield is calculated on the correct amount.
    access(all) fun notifyDeposit(poolId: UInt64, additionalAmount: UFix64) {
        let now = getCurrentBlock().timestamp

        if let pool = self.pools[poolId] {
            // Pool exists — update principal
            let p = pool
            p.setPrincipal(p.totalPrincipal + additionalAmount)
            self.pools[poolId] = p
        } else {
            // New pool — initialize
            self.pools[poolId] = PoolInfo(
                totalPrincipal: additionalAmount,
                lastHarvestTime: now
            )
        }

        emit PoolUpdated(poolId: poolId, totalPrincipal: self.pools[poolId]!.totalPrincipal)
    }

    /// Notify the yield source that principal was withdrawn from a pool.
    access(all) fun notifyWithdrawal(poolId: UInt64, withdrawnAmount: UFix64) {
        let pool = self.pools[poolId] ?? panic("Pool not found")
        let p = pool

        if withdrawnAmount >= p.totalPrincipal {
            p.setPrincipal(0.0)
        } else {
            p.setPrincipal(p.totalPrincipal - withdrawnAmount)
        }
        self.pools[poolId] = p

        emit PoolUpdated(poolId: poolId, totalPrincipal: p.totalPrincipal)
    }

    /// Harvest accrued yield for a pool. Mints DummyPYUSD based on
    /// elapsed time and returns it as a vault. Returns nil if no yield.
    access(all) fun harvestYield(poolId: UInt64): @DummyPYUSD.Vault? {
        let pool = self.pools[poolId] ?? panic("Pool not found")

        let now = getCurrentBlock().timestamp
        let elapsed = now - pool.lastHarvestTime

        if elapsed <= 0.0 || pool.totalPrincipal <= 0.0 {
            return nil
        }

        let yieldAmount = pool.totalPrincipal * self.annualRate * elapsed / self.secondsPerYear

        if yieldAmount <= 0.0 {
            return nil
        }

        // Mint PYUSD as yield (DummyPYUSD caps at 10k per mint — chunk if needed)
        let resultVault <- DummyPYUSD.createEmptyVault(vaultType: Type<@DummyPYUSD.Vault>())
        var remaining = yieldAmount
        while remaining > 0.0 {
            let chunk = remaining > 10000.0 ? 10000.0 : remaining
            let minted <- DummyPYUSD.mint(amount: chunk)
            resultVault.deposit(from: <-minted)
            remaining = remaining - chunk
        }

        // Update harvest timestamp
        let p = pool
        p.setLastHarvestTime(now)
        self.pools[poolId] = p

        emit YieldHarvested(poolId: poolId, amount: yieldAmount)

        return <-resultVault
    }

    // ── View Functions ───────────────────────────────────────────────────────

    /// Get the pending (unharvested) yield for a pool.
    /// Frontend can call this to display real-time yield without a transaction.
    access(all) view fun getPendingYield(poolId: UInt64): UFix64 {
        if let pool = self.pools[poolId] {
            if pool.totalPrincipal <= 0.0 {
                return 0.0
            }
            let now = getCurrentBlock().timestamp
            let elapsed = now - pool.lastHarvestTime
            if elapsed <= 0.0 {
                return 0.0
            }
            return pool.totalPrincipal * self.annualRate * elapsed / self.secondsPerYear
        }
        return 0.0
    }

    /// Get pool info for a given pool ID.
    access(all) view fun getPool(poolId: UInt64): PoolInfo? {
        return self.pools[poolId]
    }

    /// Get the annual yield rate.
    access(all) view fun getAnnualRate(): UFix64 {
        return self.annualRate
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    init() {
        self.pools = {}
        self.annualRate = 5.0        // 500% APY
        self.secondsPerYear = 31536000.0
    }
}
