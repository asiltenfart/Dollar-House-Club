import * as fcl from "@onflow/fcl";

const NETWORK = process.env.NEXT_PUBLIC_FLOW_NETWORK || "testnet";
const ACCESS_NODE =
  process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "https://rest-testnet.onflow.org";
const DISCOVERY_WALLET =
  process.env.NEXT_PUBLIC_FLOW_DISCOVERY_WALLET ||
  "https://fcl-discovery.onflow.org/testnet/authn";

fcl.config({
  "app.detail.title": "Dollar House Club",
  "app.detail.icon": "https://dollarhouseclub.com/favicon.ico",
  "flow.network": NETWORK,
  "accessNode.api": ACCESS_NODE,
  "discovery.wallet": DISCOVERY_WALLET,
});

export { fcl };
