import "DollarHouseRaffle"

/// Creates a new raffle with full metadata WITHOUT auto-scheduling resolution.
/// Used for manual testing of the commit → reveal → claim flow.
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

        DollarHouseRaffle.createRaffle(
            signer: signer,
            title: title,
            description: description,
            metadata: metadata,
            targetValue: targetValue
        )
    }
}
