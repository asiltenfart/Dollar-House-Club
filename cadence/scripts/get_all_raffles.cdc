import "DollarHouseRaffle"

/// Returns all raffle view data in a single query.
///
access(all) fun main(): [DollarHouseRaffle.RaffleView] {
    let ids = DollarHouseRaffle.getAllRaffleIds()
    let results: [DollarHouseRaffle.RaffleView] = []
    for id in ids {
        if let raffle = DollarHouseRaffle.getRaffle(raffleId: id) {
            results.append(raffle)
        }
    }
    return results
}
