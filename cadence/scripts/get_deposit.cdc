import "DollarHouseRaffle"

/// Returns deposit info for a depositor in a raffle.
///
access(all) fun main(raffleId: UInt64, depositor: Address): DollarHouseRaffle.DepositInfo? {
    return DollarHouseRaffle.getDeposit(raffleId: raffleId, depositor: depositor)
}
