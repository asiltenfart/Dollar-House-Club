import { Magic } from "magic-sdk";
import { FlowExtension } from "@magic-ext/flow";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let magicInstance: any = null;

export function getMagic() {
  if (magicInstance) return magicInstance as InstanceType<typeof Magic>;

  const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
  if (!key) throw new Error("Missing NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY");

  magicInstance = new Magic(key, {
    extensions: [
      new FlowExtension({
        rpcUrl: process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "https://rest-testnet.onflow.org",
        network: "testnet",
      }),
    ],
  });

  return magicInstance as InstanceType<typeof Magic>;
}

/**
 * Access the Magic instance with Flow extension typed.
 * Use this when you need `.flow.getAccount()` or `.flow.authorization`.
 */
export function getMagicFlow() {
  const magic = getMagic();
  return magic as InstanceType<typeof Magic> & {
    flow: FlowExtension;
  };
}
