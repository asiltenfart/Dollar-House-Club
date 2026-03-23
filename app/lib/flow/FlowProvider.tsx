"use client";

import React, { useState, useEffect, type ReactNode } from "react";

// All config is defined statically — no heavy imports at module level.
// @onflow/kit is loaded lazily on the client to avoid SSR stalls.

const flowJSON = {
  contracts: {
    DummyPYUSD: {
      source: "./cadence/contracts/DummyPYUSD.cdc",
      aliases: { emulator: "f8d6e0586b0a20c7", testnet: "152be59c81feab79" },
    },
    DollarHouseRaffle: {
      source: "./cadence/contracts/DollarHouseRaffle.cdc",
      aliases: { emulator: "f8d6e0586b0a20c7", testnet: "152be59c81feab79" },
    },
    SimpleYieldSource: {
      source: "./cadence/contracts/SimpleYieldSource.cdc",
      aliases: { emulator: "f8d6e0586b0a20c7", testnet: "152be59c81feab79" },
    },
    Xorshift128plus: {
      source: "./cadence/contracts/Xorshift128plus.cdc",
      aliases: { emulator: "f8d6e0586b0a20c7", testnet: "152be59c81feab79" },
    },
    RandomConsumer: {
      source: "./cadence/contracts/RandomConsumer.cdc",
      aliases: { emulator: "f8d6e0586b0a20c7", testnet: "152be59c81feab79" },
    },
    RaffleScheduler: {
      source: "./cadence/contracts/RaffleScheduler.cdc",
      aliases: { emulator: "f8d6e0586b0a20c7", testnet: "152be59c81feab79" },
    },
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
    FlowTransactionScheduler: {
      source: "mainnet://e467b9dd11fa00df.FlowTransactionScheduler",
      aliases: {
        emulator: "f8d6e0586b0a20c7",
        mainnet: "e467b9dd11fa00df",
        testnet: "8c5303eaa26202d6",
      },
    },
    FlowToken: {
      source: "mainnet://1654653399040a61.FlowToken",
      aliases: {
        emulator: "0ae53cb6e3f42a79",
        mainnet: "1654653399040a61",
        testnet: "7e60df042a9c0868",
      },
    },
  },
  networks: {
    emulator: "127.0.0.1:3569",
    mainnet: "access.mainnet.nodes.onflow.org:9000",
    testnet: "access.devnet.nodes.onflow.org:9000",
  },
  accounts: {},
  deployments: {},
};

const flowConfig = {
  appDetailTitle: "Dollar House Club",
  appDetailIcon: "https://dollarhouseclub.com/favicon.ico",
  flowNetwork: (process.env.NEXT_PUBLIC_FLOW_NETWORK || "testnet") as "emulator" | "testnet" | "mainnet",
  accessNodeUrl:
    process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "https://rest-testnet.onflow.org",
  discoveryWallet:
    process.env.NEXT_PUBLIC_FLOW_DISCOVERY_WALLET ||
    "https://fcl-discovery.onflow.org/testnet/authn",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlowProviderComponent = React.ComponentType<any>;

export default function FlowProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const [Kit, setKit] = useState<FlowProviderComponent | null>(null);

  useEffect(() => {
    import("@onflow/kit").then((mod) => {
      setKit(() => mod.FlowProvider);
    });
  }, []);

  // During SSR or before kit loads, render children without the provider.
  // This prevents @onflow/fcl from initializing during SSR (~30s timeout).
  if (!Kit) {
    return <>{children}</>;
  }

  return (
    <Kit config={flowConfig} flowJson={flowJSON}>
      {children}
    </Kit>
  );
}
