import "DollarHouseRaffle"
import "RaffleScheduler"

/// Creates a new property raffle with full metadata and schedules automated resolution at expiry.
/// Seller identity is derived from the signer.
/// The RaffleScheduler automatically commits and reveals the winner after the 30-day window.
///
transaction(
    title: String,
    description: String,
    targetValue: UFix64,
    yearBuilt: UInt16,
    bedrooms: UInt8,
    bathrooms: UInt8,
    squareFootage: UInt32,
    street: String,
    city: String,
    stateProvince: String,
    country: String,
    postalCode: String,
    propertyValue: UFix64,
    imageURLs: [String]
) {
    prepare(signer: auth(BorrowValue) &Account) {
        let metadata = DollarHouseRaffle.PropertyMetadata(
            yearBuilt: yearBuilt,
            bedrooms: bedrooms,
            bathrooms: bathrooms,
            squareFootage: squareFootage,
            street: street,
            city: city,
            stateProvince: stateProvince,
            country: country,
            postalCode: postalCode,
            propertyValue: propertyValue,
            imageURLs: imageURLs
        )

        let raffleId = DollarHouseRaffle.createRaffle(
            signer: signer,
            title: title,
            description: description,
            metadata: metadata,
            targetValue: targetValue
        )

        // Schedule automated resolution at expiry (commit + reveal)
        if RaffleScheduler.isConfigured {
            let raffleView = DollarHouseRaffle.getRaffle(raffleId: raffleId)!
            RaffleScheduler.scheduleCommit(
                raffleId: raffleId,
                expiresAt: raffleView.expiresAt
            )
        }
    }
}
