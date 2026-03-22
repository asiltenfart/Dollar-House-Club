"use client";

import { FlowProvider as FlowKitProvider } from "@onflow/kit";

// Inline flow.json contract addresses for FCL resolution.
// This avoids importing from outside the Next.js app directory.
const flowJSON = {
  contracts: {
    DummyPYUSD: { source: "./cadence/contracts/DummyPYUSD.cdc" },
    DollarHouseRaffle: { source: "./cadence/contracts/DollarHouseRaffle.cdc" },
    Xorshift128plus: { source: "./cadence/contracts/Xorshift128plus.cdc" },
    RandomConsumer: { source: "./cadence/contracts/RandomConsumer.cdc" },
  },
  dependencies: {
    Burner: {
      source: "mainnet://f233dcee88fe0abe.Burner",
      aliases: {
        emulator: "f8d6e0586b0a20c7",
        mainnet: "f233dcee88fe0abe",
        testnet: "9a0766d93b6608b7",
      },
    },
    FungibleToken: {
      source: "mainnet://f233dcee88fe0abe.FungibleToken",
      aliases: {
        emulator: "ee82856bf20e2aa6",
        mainnet: "f233dcee88fe0abe",
        testnet: "9a0766d93b6608b7",
      },
    },
    FungibleTokenMetadataViews: {
      source: "mainnet://f233dcee88fe0abe.FungibleTokenMetadataViews",
      aliases: {
        emulator: "ee82856bf20e2aa6",
        mainnet: "f233dcee88fe0abe",
        testnet: "9a0766d93b6608b7",
      },
    },
    MetadataViews: {
      source: "mainnet://1d7e57aa55817448.MetadataViews",
      aliases: {
        emulator: "f8d6e0586b0a20c7",
        mainnet: "1d7e57aa55817448",
        testnet: "631e88ae7f1d7c20",
      },
    },
    RandomBeaconHistory: {
      source: "mainnet://e467b9dd11fa00df.RandomBeaconHistory",
      aliases: {
        emulator: "f8d6e0586b0a20c7",
        mainnet: "e467b9dd11fa00df",
        testnet: "8c5303eaa26202d6",
      },
    },
    ViewResolver: {
      source: "mainnet://1d7e57aa55817448.ViewResolver",
      aliases: {
        emulator: "f8d6e0586b0a20c7",
        mainnet: "1d7e57aa55817448",
        testnet: "631e88ae7f1d7c20",
      },
    },
  },
  networks: {
    emulator: "127.0.0.1:3569",
    mainnet: "access.mainnet.nodes.onflow.org:9000",
    testnet: "access.devnet.nodes.onflow.org:9000",
  },
  accounts: {
    "emulator-account": {
      address: "f8d6e0586b0a20c7",
      key: "a30efdca0c2198cc4d4e013f62072fc3013f9f44c4e1a2ebad09f642588168ad",
    },
  },
  deployments: {
    emulator: {
      "emulator-account": [
        "Xorshift128plus",
        "RandomConsumer",
        "DummyPYUSD",
        "DollarHouseRaffle",
      ],
    },
  },
};

const flowConfig = {
  appDetailTitle: "Dollar House Club",
  appDetailIcon: "https://dollarhouseclub.com/favicon.ico",
  flowNetwork: (process.env.NEXT_PUBLIC_FLOW_NETWORK || "emulator") as "emulator" | "testnet" | "mainnet",
  accessNodeUrl:
    process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "http://localhost:8888",
  discoveryWallet:
    process.env.NEXT_PUBLIC_FLOW_DISCOVERY_WALLET ||
    "https://fcl-discovery.onflow.org/testnet/authn",
};

export default function FlowProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FlowKitProvider config={flowConfig} flowJson={flowJSON}>
      {children}
    </FlowKitProvider>
  );
}
