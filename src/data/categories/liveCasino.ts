import { CategoryModule } from "./types";

export const LIVE_CASINO_SLUGS: string[] = [
  "crazy-time",
  "lightning-roulette",
  "xxxtreme-lightning-roulette",
  "speed-auto-roulette",
  "live-blackjack",
  "monopoly-live",
  "mega-ball",
  "hindi-roulette",
  "teen-patti-live",
  "mac88-lightning-dragon-tiger",
  "mac88-lightning-andar-bahar",
  "mac88-3-cards-judgement",
  "roulette-360",
  "ezugi-one-day-teen-patti",
];

export const LIVE_CASINO_CATEGORY: CategoryModule = {
  id: "live-casino",
  title: "Live Casino",
  viewAllLink: "/casino/group/live-casino",
  description: "Immersive live-streamed table classics and game shows with charismatic hosts.",
  provider: "Mixed Live Suites",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: LIVE_CASINO_SLUGS,
};
