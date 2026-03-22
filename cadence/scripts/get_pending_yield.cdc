import "SimpleYieldSource"

access(all) fun main(raffleId: UInt64): UFix64 {
    return SimpleYieldSource.getPendingYield(poolId: raffleId)
}
