import "DollarHouseRaffle"

/// Returns all raffle IDs where the given address has (or had) a deposit.
access(all) fun main(user: Address): [UInt64] {
    let allIds = DollarHouseRaffle.getAllRaffleIds()
    var result: [UInt64] = []
    for id in allIds {
        if DollarHouseRaffle.getDeposit(raffleId: id, depositor: user) != nil {
            result.append(id)
        }
    }
    return result
}
