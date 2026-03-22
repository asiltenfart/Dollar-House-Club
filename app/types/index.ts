// ============ CORE ENTITIES ============

export type RaffleStatus = "active" | "completed_funded" | "completed_unfunded";

export type RafflePhase = "in_progress" | "resolving" | "completed";

export interface Raffle {
  id: string;
  seller: UserProfile;
  property: PropertyListing;
  targetValueUSD: number;
  totalDeposited: number;
  totalYieldEarned: number;
  totalYieldWeight: number;
  depositorCount: number;
  createdAt: string;
  expiresAt: string;
  status: RaffleStatus;
  phase: RafflePhase;
  winner: UserProfile | null;
  isOverfunded: boolean;
  transferConfirmed: boolean;
}

export interface PropertyListing {
  title: string;
  description: string;
  propertyType: "house" | "apartment" | "condo" | "townhouse" | "land" | "other";
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  location: PropertyLocation;
  yearBuilt: number;
  images: string[];
  proofOfOwnership: string;
}

export interface PropertyLocation {
  street: string;
  city: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
}

export interface UserProfile {
  address: string;
  displayName: string;
  avatarUrl: string | null;
  email: string;
  rafflesEntered: number;
  rafflesWon: number;
  rafflesListed: number;
  rafflesCompleted: number;
  joinedAt: string;
}

export interface Deposit {
  id: string;
  raffleId: string;
  user: UserProfile;
  principalAmount: number;
  yieldGenerated: number;
  winChance: number;
  depositedAt: string;
  isWithdrawn: boolean;
}

// ============ UI STATE ============

export type ButtonState = "default" | "hover" | "active" | "disabled" | "loading";

export type ModalState = "closed" | "skill_question" | "auth" | "deposit_confirm" | "withdraw_confirm";

export interface DepositCardState {
  amount: string;
  buttonState: ButtonState;
  modal: ModalState;
  hasPassedSkillQuestion: boolean;
  userDeposit: Deposit | null;
}

export interface ExploreFilters {
  status: "all" | "active" | "completed";
  sortBy: "newest" | "ending_soon" | "most_funded" | "highest_value";
  search: string;
  page: number;
  perPage: 12;
}

export interface CreateRaffleFormData {
  property: Partial<PropertyListing>;
  targetValueUSD: number | null;
  images: File[];
  proofOfOwnership: File | null;
  agreedToTerms: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// ============ SKILL QUESTION ============

export interface SkillQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  category: "math" | "geography" | "general";
}

// ============ AUTH ============

export interface AuthUser {
  profile: UserProfile;
  isAuthenticated: boolean;
}

// ============ TOAST ============

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}
