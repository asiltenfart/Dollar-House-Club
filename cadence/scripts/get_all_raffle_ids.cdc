import "DollarHouseRaffle"

/// Returns all raffle IDs.
///
access(all) fun main(): [UInt64] {
    return DollarHouseRaffle.getAllRaffleIds()
}
