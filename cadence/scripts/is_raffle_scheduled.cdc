import "RaffleScheduler"

access(all) fun main(raffleId: UInt64): Bool {
    return RaffleScheduler.isScheduled(raffleId: raffleId)
}
