"use client";

import React, { useState } from "react";
import { useCreateRaffle } from "@/lib/flow/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import Button from "./Button";

export default function DevCreateRaffle() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { createRaffle } = useCreateRaffle();
  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsCreating(true);
    try {
      await createRaffle("Dev Test Property", "A dummy property raffle created for testing.", 1000);
      showToast("Dummy raffle created!", "success");
    } catch (e) {
      showToast("Failed to create dummy raffle.", "error");
      console.error("Dev raffle error:", e);
    }
    setIsCreating(false);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleCreate}
      isLoading={isCreating}
      disabled={isCreating}
      style={{ borderColor: "#6B7280", color: "#6B7280", fontSize: "12px" }}
    >
      {isCreating ? "" : "🛠 Dev Raffle"}
    </Button>
  );
}
