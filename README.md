# Dollar House Club

## Prerequisites

- **Flow CLI** (`~/.local/bin/flow`) — [Install guide](https://developers.flow.com/tools/flow-cli/install)
- **Node.js** (v18+)

## Running on Emulator (Local Dev)

From the project root:

```bash
# 1. Start the Flow emulator
flow emulator start

# 2. Deploy contracts (new terminal)
flow project deploy --network=emulator --update

# 3. Start the dev wallet (same terminal, or new one)
flow dev-wallet

# 4. Start the Next.js app (new terminal)
cd app && npm run dev
```

Services:
| Service       | URL                    |
|---------------|------------------------|
| Next.js app   | http://localhost:3000   |
| Emulator REST | http://localhost:8888   |
| Dev Wallet    | http://localhost:8701   |

The app reads `.env.local` which is pre-configured for emulator mode.

## Running on Testnet

Set these env vars in `app/.env.local`:

```env
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=https://fcl-discovery.onflow.org/testnet/authn
```

Then start just the Next.js app:

```bash
cd app && npm run dev
```

No emulator or dev wallet needed — the app connects to the public testnet.
