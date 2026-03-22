import "DollarHouseRaffle"

/// Returns deposit view for a depositor in a raffle.
///
access(all) fun main(raffleId: UInt64, depositor: Address): DollarHouseRaffle.DepositView? {
    return DollarHouseRaffle.getDeposit(raffleId: raffleId, depositor: depositor)
}
