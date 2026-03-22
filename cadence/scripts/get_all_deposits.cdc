import "DollarHouseRaffle"

/// Returns all deposit views for a raffle.
///
access(all) fun main(raffleId: UInt64): {Address: DollarHouseRaffle.DepositView} {
    return DollarHouseRaffle.getAllDeposits(raffleId: raffleId)
}
