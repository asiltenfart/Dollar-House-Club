import "DollarHouseRaffle"

/// Returns the total principal currently allocated (not withdrawn) across all raffles for a user.
access(all) fun main(user: Address): UFix64 {
    let allIds = DollarHouseRaffle.getAllRaffleIds()
    var total: UFix64 = 0.0
    for id in allIds {
        if let dep = DollarHouseRaffle.getDeposit(raffleId: id, depositor: user) {
            if !dep.isWithdrawn {
                total = total + dep.amount
            }
        }
    }
    return total
}
