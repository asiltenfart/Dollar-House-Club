import "DollarHouseRaffle"

/// Returns whether a raffle has been committed (waiting for reveal).
///
access(all) fun main(raffleId: UInt64): Bool {
    return DollarHouseRaffle.isRaffleCommitted(raffleId: raffleId)
}
