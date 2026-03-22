import "DollarHouseRaffle"

/// Returns raffle view data for a given raffle ID.
///
access(all) fun main(raffleId: UInt64): DollarHouseRaffle.RaffleView? {
    return DollarHouseRaffle.getRaffle(raffleId: raffleId)
}
