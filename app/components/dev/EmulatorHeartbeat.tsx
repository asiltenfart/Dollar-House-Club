"use client";

import { useEffect } from "react";

/**
 * Emulator Heartbeat — forces a new block every 5 seconds on localhost.
 *
 * The Flow emulator only advances block timestamps when blocks are created.
 * Without this, time-dependent features (yield accrual, raffle expiry) won't
 * work during UI testing because no new blocks are mined between user actions.
 *
 * Only active when the app is running against localhost (emulator).
 */
export default function EmulatorHeartbeat() {
  useEffect(() => {
    // Only run on emulator (localhost)
    const accessNode = process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "http://localhost:8888";
    if (!accessNode.includes("localhost") && !accessNode.includes("127.0.0.1")) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        await fetch("http://localhost:8080/emulator/newBlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ block_time: 0 }),
        });
      } catch {
        // Emulator not running — silently ignore
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
