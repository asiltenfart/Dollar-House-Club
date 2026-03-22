import type { Raffle, UserProfile, Deposit, SkillQuestion } from "@/types";

// ============ MOCK USERS ============

export const MOCK_USERS: UserProfile[] = [
  {
    address: "0xf1234567890abcde",
    displayName: "Alex Rivera",
    avatarUrl: null,
    email: "alex@example.com",
    rafflesEntered: 12,
    rafflesWon: 1,
    rafflesListed: 2,
    rafflesCompleted: 1,
    joinedAt: "2025-06-01T00:00:00Z",
  },
  {
    address: "0xa9876543210fedcb",
    displayName: "Morgan Chen",
    avatarUrl: null,
    email: "morgan@example.com",
    rafflesEntered: 8,
    rafflesWon: 0,
    rafflesListed: 1,
    rafflesCompleted: 0,
    joinedAt: "2025-08-15T00:00:00Z",
  },
  {
    address: "0xb2468013579abcde",
    displayName: "Jordan Kim",
    avatarUrl: null,
    email: "jordan@example.com",
    rafflesEntered: 25,
    rafflesWon: 2,
    rafflesListed: 0,
    rafflesCompleted: 0,
    joinedAt: "2025-03-20T00:00:00Z",
  },
  {
    address: "0xc135790246810fed",
    displayName: "Taylor Osei",
    avatarUrl: null,
    email: "taylor@example.com",
    rafflesEntered: 3,
    rafflesWon: 1,
    rafflesListed: 3,
    rafflesCompleted: 2,
    joinedAt: "2025-01-10T00:00:00Z",
  },
];

// ============ PROPERTY IMAGES (Unsplash) ============

const HOUSE_IMAGES = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&q=80",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&q=80",
];

// ============ MOCK RAFFLES ============

export const MOCK_RAFFLES: Raffle[] = [
  {
    id: "raffle-001",
    seller: MOCK_USERS[3],
    property: {
      title: "3BR Craftsman Bungalow in East Nashville",
      description:
        "A beautifully restored 1920s craftsman bungalow nestled in the heart of East Nashville. Features original hardwood floors, exposed brick fireplace, updated kitchen with quartz countertops, and a private backyard oasis with mature trees. Walking distance to Five Points and the vibrant restaurant scene on Gallatin Ave.",
      propertyType: "house",
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1640,
      location: {
        street: "412 Fatherland St",
        city: "Nashville",
        stateProvince: "Tennessee",
        country: "United States",
        postalCode: "37206",
        lat: 36.1781,
        lng: -86.7481,
      },
      yearBuilt: 1924,
      images: [HOUSE_IMAGES[0], HOUSE_IMAGES[1], HOUSE_IMAGES[2], HOUSE_IMAGES[3]],
      proofOfOwnership: "https://example.com/docs/deed-001.pdf",
    },
    targetValueUSD: 420000,
    totalDeposited: 285000,
    totalYieldEarned: 12400,
    totalYieldWeight: 285000 * 2592000,
    depositorCount: 1234,
    createdAt: "2026-02-04T00:00:00Z",
    expiresAt: "2026-04-22T00:00:00Z",
    status: "active",
    phase: "in_progress",
    winner: null,
    isOverfunded: false,
    transferConfirmed: false,
  },
  {
    id: "raffle-002",
    seller: MOCK_USERS[1],
    property: {
      title: "Oceanfront Studio Condo — Miami Beach",
      description:
        "Stunning direct-ocean studio condo on the 18th floor of a luxury high-rise in South Beach. Features panoramic Atlantic views, full resort amenities including rooftop pool, gym, and concierge. Ideal for investors or as a primary residence. HOA covers water, trash, and building insurance.",
      propertyType: "condo",
      bedrooms: 0,
      bathrooms: 1,
      squareFootage: 540,
      location: {
        street: "1901 Collins Ave #1802",
        city: "Miami Beach",
        stateProvince: "Florida",
        country: "United States",
        postalCode: "33139",
        lat: 25.7892,
        lng: -80.1286,
      },
      yearBuilt: 2018,
      images: [HOUSE_IMAGES[4], HOUSE_IMAGES[5], HOUSE_IMAGES[6]],
      proofOfOwnership: "https://example.com/docs/deed-002.pdf",
    },
    targetValueUSD: 680000,
    totalDeposited: 520000,
    totalYieldEarned: 28900,
    totalYieldWeight: 520000 * 2592000,
    depositorCount: 3891,
    createdAt: "2026-02-10T00:00:00Z",
    expiresAt: "2026-04-28T00:00:00Z",
    status: "active",
    phase: "in_progress",
    winner: null,
    isOverfunded: false,
    transferConfirmed: false,
  },
  {
    id: "raffle-003",
    seller: MOCK_USERS[0],
    property: {
      title: "4BR Colonial on Half-Acre — Lexington, MA",
      description:
        "Classic New England colonial with exceptional curb appeal on a quiet tree-lined street in Lexington. Features a chef's kitchen with Sub-Zero appliances, formal dining room, four spacious bedrooms, and a finished basement. Top-rated Lexington school district. Two-car garage. Close to Minuteman Bikeway.",
      propertyType: "house",
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2980,
      location: {
        street: "8 Hancock Ave",
        city: "Lexington",
        stateProvince: "Massachusetts",
        country: "United States",
        postalCode: "02421",
        lat: 42.4487,
        lng: -71.2295,
      },
      yearBuilt: 1987,
      images: [HOUSE_IMAGES[7], HOUSE_IMAGES[0], HOUSE_IMAGES[2]],
      proofOfOwnership: "https://example.com/docs/deed-003.pdf",
    },
    targetValueUSD: 1100000,
    totalDeposited: 1250000,
    totalYieldEarned: 58200,
    totalYieldWeight: 1250000 * 2592000,
    depositorCount: 7204,
    createdAt: "2026-01-15T00:00:00Z",
    expiresAt: "2026-05-15T00:00:00Z",
    status: "active",
    phase: "in_progress",
    winner: null,
    isOverfunded: true,
    transferConfirmed: false,
  },
  {
    id: "raffle-004",
    seller: MOCK_USERS[3],
    property: {
      title: "Modern Townhouse — Capitol Hill, Denver",
      description:
        "Newly built 2022 townhouse in the heart of Capitol Hill. Open-concept living with 10-foot ceilings, floor-to-ceiling windows, and a private rooftop deck with panoramic city views. Chef's kitchen, two en-suite bedrooms, and a finished attached garage. Steps from Cheesman Park and the best of Denver dining.",
      propertyType: "townhouse",
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 1380,
      location: {
        street: "1240 Pennsylvania St",
        city: "Denver",
        stateProvince: "Colorado",
        country: "United States",
        postalCode: "80203",
        lat: 39.7351,
        lng: -104.9796,
      },
      yearBuilt: 2022,
      images: [HOUSE_IMAGES[3], HOUSE_IMAGES[5], HOUSE_IMAGES[7]],
      proofOfOwnership: "https://example.com/docs/deed-004.pdf",
    },
    targetValueUSD: 575000,
    totalDeposited: 390000,
    totalYieldEarned: 17600,
    totalYieldWeight: 390000 * 2592000,
    depositorCount: 2103,
    createdAt: "2026-02-20T00:00:00Z",
    expiresAt: "2026-04-30T00:00:00Z",
    status: "active",
    phase: "in_progress",
    winner: null,
    isOverfunded: false,
    transferConfirmed: false,
  },
  {
    id: "raffle-005",
    seller: MOCK_USERS[1],
    property: {
      title: "Historic Shotgun House — Marigny, New Orleans",
      description:
        "Charming 1890s shotgun cottage in the heart of the Marigny neighborhood. Meticulously restored while preserving original architectural details: heart pine floors, decorative ceiling medallions, and period doors. Updated plumbing and electrical. Front porch perfect for jazz nights. Airbnb-ready.",
      propertyType: "house",
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 880,
      location: {
        street: "2418 St Claude Ave",
        city: "New Orleans",
        stateProvince: "Louisiana",
        country: "United States",
        postalCode: "70117",
        lat: 29.9611,
        lng: -90.0485,
      },
      yearBuilt: 1892,
      images: [HOUSE_IMAGES[6], HOUSE_IMAGES[1], HOUSE_IMAGES[4]],
      proofOfOwnership: "https://example.com/docs/deed-005.pdf",
    },
    targetValueUSD: 280000,
    totalDeposited: 280000,
    totalYieldEarned: 280000,
    totalYieldWeight: 280000 * 2592000,
    depositorCount: 4521,
    createdAt: "2025-12-01T00:00:00Z",
    expiresAt: "2026-05-31T00:00:00Z",
    status: "completed_funded",
    phase: "completed",
    winner: MOCK_USERS[2],
    isOverfunded: false,
    transferConfirmed: true,
  },
  {
    id: "raffle-006",
    seller: MOCK_USERS[0],
    property: {
      title: "Lakeview Cabin — Lake Tahoe Area",
      description:
        "Rustic-modern cabin with direct Tahoe views from the main deck. Vaulted ceilings with exposed beams, stone fireplace, updated kitchen, and three bedrooms that sleep eight. ski-in/ski-out access to Northstar at Tahoe resort. STR permit in place with proven rental income history.",
      propertyType: "house",
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1680,
      location: {
        street: "14 Snowflake Dr",
        city: "Truckee",
        stateProvince: "California",
        country: "United States",
        postalCode: "96161",
        lat: 39.3279,
        lng: -120.1833,
      },
      yearBuilt: 1978,
      images: [HOUSE_IMAGES[2], HOUSE_IMAGES[0], HOUSE_IMAGES[7]],
      proofOfOwnership: "https://example.com/docs/deed-006.pdf",
    },
    targetValueUSD: 890000,
    totalDeposited: 340000,
    totalYieldEarned: 14200,
    totalYieldWeight: 340000 * 2592000,
    depositorCount: 1876,
    createdAt: "2025-11-15T00:00:00Z",
    expiresAt: "2026-06-15T00:00:00Z",
    status: "completed_unfunded",
    phase: "completed",
    winner: MOCK_USERS[1],
    isOverfunded: false,
    transferConfirmed: false,
  },
];

// ============ MOCK DEPOSITS ============

export function getMockDepositsForRaffle(raffleId: string, currentUser?: UserProfile | null): Deposit[] {
  const deposits: Deposit[] = [
    {
      id: `dep-${raffleId}-1`,
      raffleId,
      user: MOCK_USERS[2],
      principalAmount: 5000,
      yieldGenerated: 420,
      winChance: 3.4,
      depositedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      isWithdrawn: false,
    },
    {
      id: `dep-${raffleId}-2`,
      raffleId,
      user: MOCK_USERS[0],
      principalAmount: 1000,
      yieldGenerated: 84,
      winChance: 0.7,
      depositedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      isWithdrawn: false,
    },
  ];

  // Include the current user as a depositor so the UI can show their position
  if (currentUser && !deposits.some((d) => d.user.address === currentUser.address)) {
    deposits.push({
      id: `dep-${raffleId}-current`,
      raffleId,
      user: currentUser,
      principalAmount: 250,
      yieldGenerated: 18,
      winChance: 1.2,
      depositedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      isWithdrawn: false,
    });
  }

  return deposits;
}

// ============ SKILL QUESTIONS ============

export const SKILL_QUESTIONS: SkillQuestion[] = [
  { id: "q1", question: "What is 15% of 200?", correctAnswer: "30", category: "math" },
  { id: "q2", question: "What is 8 × 7?", correctAnswer: "56", category: "math" },
  { id: "q3", question: "What is the square root of 144?", correctAnswer: "12", category: "math" },
  { id: "q4", question: "What is 25% of 400?", correctAnswer: "100", category: "math" },
  { id: "q5", question: "What is 12 + 19?", correctAnswer: "31", category: "math" },
  { id: "q6", question: "What is the capital of France?", correctAnswer: "paris", category: "geography" },
  { id: "q7", question: "How many states are in the United States?", correctAnswer: "50", category: "general" },
  { id: "q8", question: "What is 3 × 3 × 3?", correctAnswer: "27", category: "math" },
  { id: "q9", question: "What is 100 divided by 4?", correctAnswer: "25", category: "math" },
  { id: "q10", question: "What is 18% of 50?", correctAnswer: "9", category: "math" },
];

export function getRandomQuestion(excludeIds: string[] = []): SkillQuestion {
  const available = SKILL_QUESTIONS.filter((q) => !excludeIds.includes(q.id));
  const pool = available.length > 0 ? available : SKILL_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ============ DATA ACCESS FUNCTIONS ============

export function getRaffle(id: string): Raffle | undefined {
  return MOCK_RAFFLES.find((r) => r.id === id);
}

export function getActiveRaffles(): Raffle[] {
  return MOCK_RAFFLES.filter((r) => r.status === "active");
}

export function getCompletedRaffles(): Raffle[] {
  return MOCK_RAFFLES.filter((r) => r.status !== "active");
}

export function getFeaturedRaffles(): Raffle[] {
  return MOCK_RAFFLES.filter((r) => r.status === "active").slice(0, 3);
}

export function getUserProfile(address: string): UserProfile | undefined {
  return MOCK_USERS.find((u) => u.address === address);
}

export function getRafflesByUser(address: string): Raffle[] {
  return MOCK_RAFFLES.filter(
    (r) => r.seller.address === address || r.winner?.address === address
  );
}

export function getPlatformStats() {
  const totalDeposited = MOCK_RAFFLES.reduce((sum, r) => sum + r.totalDeposited, 0);
  const completed = MOCK_RAFFLES.filter((r) => r.phase === "completed").length;
  const winners = MOCK_RAFFLES.filter((r) => r.winner !== null).length;
  return { totalDeposited, completed, winners };
}
