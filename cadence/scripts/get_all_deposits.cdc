import "DollarHouseRaffle"

/// Returns all deposits for a raffle.
///
access(all) fun main(raffleId: UInt64): {Address: DollarHouseRaffle.DepositInfo} {
    return DollarHouseRaffle.getAllDeposits(raffleId: raffleId)
}
