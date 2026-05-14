export type VibeTag =
  | "cozy"
  | "glam"
  | "traditional"
  | "playful"
  | "boho"
  | "luxe";

export type VenueCategory =
  | "cafe"
  | "rooftop"
  | "banquet"
  | "resort"
  | "farmhouse"
  | "lounge"
  | "restaurant";

export interface Venue {
  id: string;
  name: string;
  city: string;
  area: string;
  category: VenueCategory;
  vibeTags: VibeTag[];
  indoor: boolean;
  outdoor: boolean;
  minGroup: number;
  maxGroup: number;
  priceRangeINR: [number, number];
  weatherSafe: boolean;
  image: string;
  rating: number;
  popularityScore: number;
  lat: number;
  lng: number;
  description: string;
}

export interface Theme {
  id: string;
  name: string;
  dressCode: string;
  decorPalette: string;
  decorItems: string[];
  musicVibe: string;
  foodStyle: string;
  photoBoothIdeas: string[];
  invitationAesthetic: string;
  heroImage: string;
  vibeTags: VibeTag[];
  indoorPreferred?: boolean;
  outdoorPreferred?: boolean;
}

export type GameEnergy = "low" | "medium" | "high";
export type GameAgeGroup = "all" | "30s" | "40s" | "50plus";

export interface Game {
  id: string;
  name: string;
  howToPlay: string;
  minPlayers: number;
  maxPlayers: number;
  energy: GameEnergy;
  indoor: boolean;
  outdoor: boolean;
  minutesNeeded: number;
  ageGroup: GameAgeGroup;
  vibeTags: VibeTag[];
}

export interface Festival {
  id: string;
  name: string;
  month: number;
  day?: number;
  regionNote?: string;
}

export type AiModelTierPref = "cheap" | "balanced" | "premium";

export interface UserPreferencesAi {
  useWebLLM?: boolean;
  useOllama?: boolean;
  useTransformers?: boolean;
  useExternal?: boolean;
  useDirectOpenAI?: boolean;
  useDirectAnthropic?: boolean;
  useDirectGoogle?: boolean;
  modelTier?: AiModelTierPref;
  usePremiumModel?: boolean;
}

export interface UserPreferences {
  name: string;
  gatheringTypes: string[];
  city: string;
  budgetMin: number;
  budgetMax: number;
  groupSize: number;
  vibes: VibeTag[];
  indoorVsOutdoor: "indoor" | "outdoor" | "either";
  luxuryVsCasual: number;
  maxTravelKm: number;
  onboardingComplete: boolean;
  lat?: number;
  lng?: number;
  ai?: UserPreferencesAi;
}

export interface GatheringIdea {
  id: string;
  title: string;
  subtitle: string;
  themeId: string;
  heroImage: string;
  estimatedBudgetINR: number;
  vibeTags: VibeTag[];
  promptSeed: string;
}

export type PlannerIntent =
  | "plan"
  | "venue"
  | "budget"
  | "theme"
  | "invitation"
  | "games"
  | "general";

export interface PlannerEntities {
  groupSize?: number;
  budget?: number;
  city?: string;
  vibes: VibeTag[];
  indoorOutdoor?: "indoor" | "outdoor" | "either";
  seasonHint?: string;
  keywords: string[];
}

export interface BudgetLine {
  key: string;
  label: string;
  amountINR: number;
  percent: number;
}

export interface BudgetResult {
  totalINR: number;
  groupSize: number;
  perHeadINR: number;
  lines: BudgetLine[];
  mode: "balanced" | "cheaper" | "premium";
}

export interface InvitationBundle {
  whatsappText: string;
  reminderText: string;
  rsvpPrompt: string;
  templateId: string;
}

export type PlanCardType =
  | "theme"
  | "venues"
  | "budget"
  | "games"
  | "invitation"
  | "timeline";

export interface PlanCardPayload {
  theme?: Theme;
  venues?: Venue[];
  budget?: BudgetResult;
  games?: Game[];
  invitation?: InvitationBundle;
  timeline?: string[];
}

export interface PlanRichCard {
  id: string;
  type: PlanCardType;
  title: string;
  payload: PlanCardPayload;
}

export interface PlanMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards?: PlanRichCard[];
  createdAt: number;
}

export interface PlanWorkspaceSlot {
  key: "theme" | "venue" | "budget" | "games" | "invitation" | "timeline";
  label: string;
  filled: boolean;
  summary?: string;
}

export interface SavedPlan {
  id: string;
  title: string;
  city: string;
  createdAt: number;
  updatedAt: number;
  messages: PlanMessage[];
  workspace: {
    themeId?: string;
    venueIds: string[];
    budget?: BudgetResult;
    gameIds?: string[];
    invitation?: InvitationBundle;
    timeline?: string[];
  };
  pinnedCardIds: string[];
}

export interface RecurringMember {
  id: string;
  name: string;
  avatarEmoji: string;
}

export interface MemoryState {
  savedVenueIds: string[];
  savedThemeIds: string[];
  recurringMembers: RecurringMember[];
}

export interface PlanResponse {
  message: string;
  cards: PlanRichCard[];
  /** Non-fatal issues and soft degradations for the UI (never thrown). */
  notes?: string[];
  /** Short rationale lines keyed by venue id (optional enrichment). */
  rationales?: Record<string, string>;
}

export interface WeatherDay {
  label: string;
  condition: string;
  tempC: number;
  precipChance: number;
}

export interface WeatherForecast {
  city: string;
  days: WeatherDay[];
  tip: string;
}

export interface SeasonalContext {
  season: string;
  headline: string;
  subcopy: string;
  heroImage: string;
  accent: string;
}
