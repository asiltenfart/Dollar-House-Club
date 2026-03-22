import type { Raffle, RaffleStatus, UserProfile, PropertyListing } from "@/types";

// Placeholder images for on-chain raffles (no images stored on-chain)
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
];

// ── Types matching what FCL returns from Cadence structs ─────────────────────

export interface ChainRaffleData {
  id: string;
  seller: string;
  title: string;
  description: string;
  targetValue: string;
  createdAt: string;
  expiresAt: string;
  totalDeposited: string;
  totalYield: string;
  depositorCount: string;
  status: { rawValue: string };
  winner: string | null;
}

// ── Conversion ──────────────────────────────────────────────────────────────

function chainStatusToFrontend(rawValue: string): RaffleStatus {
  switch (rawValue) {
    case "0": return "active";
    case "1": return "active"; // committed = still active from UI perspective
    case "2": return "completed_funded";
    case "3": return "completed_unfunded";
    default: return "active";
  }
}

function makeSellerProfile(address: string): UserProfile {
  return {
    address,
    displayName: address.slice(0, 10),
    avatarUrl: null,
    email: "",
    rafflesEntered: 0,
    rafflesWon: 0,
    rafflesListed: 1,
    rafflesCompleted: 0,
    joinedAt: new Date().toISOString(),
  };
}

function makeWinnerProfile(address: string): UserProfile {
  return {
    address,
    displayName: address.slice(0, 10),
    avatarUrl: null,
    email: "",
    rafflesEntered: 1,
    rafflesWon: 1,
    rafflesListed: 0,
    rafflesCompleted: 0,
    joinedAt: new Date().toISOString(),
  };
}

function makePropertyListing(title: string, description: string, targetValue: number): PropertyListing {
  return {
    title,
    description,
    propertyType: "house",
    bedrooms: 0,
    bathrooms: 0,
    squareFootage: 0,
    location: {
      street: "",
      city: "On-Chain",
      stateProvince: "Flow",
      country: "Blockchain",
      postalCode: "",
      lat: null,
      lng: null,
    },
    yearBuilt: 0,
    images: PLACEHOLDER_IMAGES,
    proofOfOwnership: "",
  };
}

export function chainRaffleToFrontend(data: ChainRaffleData): Raffle {
  const targetValue = parseFloat(data.targetValue);
  const totalDeposited = parseFloat(data.totalDeposited);
  const totalYield = parseFloat(data.totalYield);
  const createdAtUnix = parseFloat(data.createdAt);
  const expiresAtUnix = parseFloat(data.expiresAt);

  return {
    id: data.id,
    seller: makeSellerProfile(data.seller),
    property: makePropertyListing(data.title, data.description, targetValue),
    targetValueUSD: targetValue,
    totalDeposited,
    totalYieldEarned: totalYield,
    depositorCount: parseInt(data.depositorCount, 10),
    createdAt: new Date(createdAtUnix * 1000).toISOString(),
    expiresAt: new Date(expiresAtUnix * 1000).toISOString(),
    status: chainStatusToFrontend(data.status.rawValue),
    phase: data.status.rawValue === "0" ? "in_progress" : "completed",
    winner: data.winner ? makeWinnerProfile(data.winner) : null,
    isOverfunded: totalYield > targetValue,
    transferConfirmed: false,
  };
}
