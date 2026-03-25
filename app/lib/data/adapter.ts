import type { Raffle, RaffleStatus, UserProfile, PropertyListing } from "@/types";

// ── Types matching what FCL returns from Cadence structs ─────────────────────

export interface ChainPropertyMetadata {
  yearBuilt: string;
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  street: string;
  city: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  propertyValue: string;
  imageURLs: string[];
}

export interface ChainRaffleData {
  id: string;
  seller: string;
  title: string;
  description: string;
  metadata: ChainPropertyMetadata;
  targetValue: string;
  createdAt: string;
  expiresAt: string;
  totalDeposited: string;
  totalYield: string;
  totalYieldWeight: string;
  depositorCount: string;
  status: { rawValue: string };
  winner: string | null;
  prizeClaimed: boolean;
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

function makePropertyListing(title: string, description: string, meta: ChainPropertyMetadata): PropertyListing {
  return {
    title: title || "Untitled Property",
    description: description || "",
    propertyType: "house",
    bedrooms: parseInt(meta.bedrooms, 10) || 0,
    bathrooms: parseInt(meta.bathrooms, 10) || 0,
    squareFootage: parseInt(meta.squareFootage, 10) || 0,
    location: {
      street: meta.street || "",
      city: meta.city || "",
      stateProvince: meta.stateProvince || "",
      country: meta.country || "",
      postalCode: meta.postalCode || "",
      lat: null,
      lng: null,
    },
    yearBuilt: parseInt(meta.yearBuilt, 10) || 0,
    images: meta.imageURLs || [],
    propertyValue: parseFloat(meta.propertyValue) || 0,
  };
}

export function chainRaffleToFrontend(data: ChainRaffleData): Raffle {
  const targetValue = parseFloat(data.targetValue);
  const totalDeposited = parseFloat(data.totalDeposited);
  const totalYield = parseFloat(data.totalYield);
  const totalYieldWeight = parseFloat(data.totalYieldWeight ?? "0");
  const createdAtUnix = parseFloat(data.createdAt);
  const expiresAtUnix = parseFloat(data.expiresAt);

  return {
    id: data.id,
    seller: makeSellerProfile(data.seller),
    property: makePropertyListing(data.title, data.description, data.metadata),
    targetValueUSD: targetValue,
    totalDeposited,
    totalYieldEarned: totalYield,
    totalYieldWeight,
    depositorCount: parseInt(data.depositorCount, 10),
    createdAt: new Date(createdAtUnix * 1000).toISOString(),
    expiresAt: new Date(expiresAtUnix * 1000).toISOString(),
    status: chainStatusToFrontend(data.status.rawValue),
    phase: data.status.rawValue === "0" ? "in_progress" : "completed",
    winner: data.winner ? makeWinnerProfile(data.winner) : null,
    isOverfunded: totalYield > targetValue,
    transferConfirmed: false,
    prizeClaimed: data.prizeClaimed ?? false,
  };
}
