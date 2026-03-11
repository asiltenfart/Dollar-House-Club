import "DollarHouseRaffle"

/// Returns whether a raffle has expired.
///
access(all) fun main(raffleId: UInt64): Bool {
    return DollarHouseRaffle.isRaffleExpired(raffleId: raffleId)
}
