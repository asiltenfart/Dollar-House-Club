# Dollar House Club

A lossless property raffle platform on Flow. Users deposit PayPal Dollars (PYUSD) into a raffle pool. The deposited principal earns yield via Flow lending protocols. That yield is used to "buy" raffle tickets proportionally. If enough yield accumulates to meet the property's target value, a random depositor wins the house and the seller gets paid from the yield. If the yield doesn't reach the target, a random depositor wins whatever yield was generated. Either way, everyone gets their principal back — nobody loses money.

## Live on Flow Testnet

All smart contracts are deployed to **Flow Testnet** at account [`0x152be59c81feab79`](https://testnet.flowscan.io/account/0x152be59c81feab79).

### Deployed Contracts

| Contract | Description |
|---|---|
| **DollarHouseRaffle** | Core raffle logic — create, deposit, withdraw, commit-reveal winner selection, claim |
| **DummyPYUSD** | Demo stablecoin (open mint) for testing deposits |
| **SimpleYieldSource** | Simulated yield generator for raffle prize pools |
| **RandomConsumer** | Secure commit-reveal randomness via Flow's RandomBeaconHistory |
| **Xorshift128plus** | On-chain PRNG utility |
| **RaffleScheduler** | Automated raffle resolution using Flow's scheduled transactions |

### Verifiable On-Chain Transactions

All raffle operations — deposits, withdrawals, winner selection, and prize claims — are executed as on-chain transactions on Flow Testnet. You can verify any transaction on [Flowscan Testnet](https://testnet.flowscan.io).

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Blockchain:** Flow (Cadence 1.0)
- **Wallet:** Magic Link (@magic-ext/flow) + FCL Discovery
- **Flow SDK:** @onflow/fcl, @onflow/kit

## Getting Started

### Prerequisites

- Node.js 18+
- Flow CLI (`brew install flow-cli`) — only needed for contract deployment

### Run the App

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app is configured to connect to **Flow Testnet** by default. Environment variables in `.env.local`:

```
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=https://fcl-discovery.onflow.org/testnet/authn
```

### Local Development (Emulator)

To run against the local Flow emulator instead, update `.env.local`:

```
NEXT_PUBLIC_FLOW_NETWORK=emulator
NEXT_PUBLIC_FLOW_ACCESS_NODE=http://localhost:8888
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=http://localhost:8701/fcl/authn
```

Then start the emulator and deploy contracts:

```bash
flow emulator
flow project deploy --network emulator
```

## Project Structure

```
cadence/
  contracts/       # Cadence smart contracts
  transactions/    # Transaction scripts
  tests/           # Contract test suite
app/
  app/             # Next.js App Router pages
  components/      # React components
  lib/flow/        # FCL config, hooks, Cadence strings
flow.json          # Flow project config (networks, accounts, deployments)
```
