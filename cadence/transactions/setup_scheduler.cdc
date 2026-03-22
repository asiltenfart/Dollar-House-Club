import "RaffleScheduler"
import "FlowTransactionScheduler"
import "FlowToken"
import "FungibleToken"

/// One-time setup for the RaffleScheduler.
/// Creates the handler resource, saves it to storage, issues capabilities,
/// and configures the contract. Must be run by the same account that deployed RaffleScheduler.
///
/// After this runs, every create_raffle.cdc call will auto-schedule resolution at expiry.
///
transaction {

    prepare(signer: auth(BorrowValue, SaveValue, Capabilities) &Account) {

        // 1. Create and save the Handler resource
        if signer.storage.type(at: RaffleScheduler.HandlerStoragePath) == nil {
            let handler <- RaffleScheduler.createHandler()
            signer.storage.save(<-handler, to: RaffleScheduler.HandlerStoragePath)
        }

        // 2. Issue capability for the handler (scheduler needs Execute entitlement)
        let handlerCap = signer.capabilities.storage.issue<
            auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}
        >(RaffleScheduler.HandlerStoragePath)

        // 3. Issue capability for the FlowToken vault (for paying scheduling fees)
        let feeProviderCap = signer.capabilities.storage.issue<
            auth(FungibleToken.Withdraw) &FlowToken.Vault
        >(/storage/flowTokenVault)

        // 4. Configure the RaffleScheduler contract
        RaffleScheduler.configure(
            admin: signer,
            handlerCap: handlerCap,
            feeProviderCap: feeProviderCap
        )
    }
}
