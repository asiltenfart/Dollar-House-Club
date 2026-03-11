import "DollarHouseRaffle"

/// Returns raffle data for a given raffle ID.
///
access(all) fun main(raffleId: UInt64): DollarHouseRaffle.RaffleData? {
    return DollarHouseRaffle.getRaffle(raffleId: raffleId)
}
