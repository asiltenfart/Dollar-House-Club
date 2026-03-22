import "DollarHouseRaffle"

/// Returns all raffle data in a single query.
///
access(all) fun main(): [DollarHouseRaffle.RaffleData] {
    let ids = DollarHouseRaffle.getAllRaffleIds()
    let results: [DollarHouseRaffle.RaffleData] = []
    for id in ids {
        if let raffle = DollarHouseRaffle.getRaffle(raffleId: id) {
            results.append(raffle)
        }
    }
    return results
}
