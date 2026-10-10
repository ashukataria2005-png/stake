import { CategoryModule } from "./types";

// Live Casino: curated cross-provider featured table & live games.
// Pure Evolution games live in evolution.ts; pure Ezugi games live in ezugi.ts.
// This row showcases the best of Mac88 Indian live suite + top cross-provider picks.
export const LIVE_CASINO_SLUGS: string[] = [
  "immersive-roulette",
  "ezugi-lucky-7",
  "mac88-roulette",
  "mac88-lightning-dragon-tiger",
  "mac88-lightning-andar-bahar",
  "mac88-3-cards-judgement",
  "mac88-muflis-teen-patti",
  "mac88-queen-race",
  "mac88-race-to-17",
  "mac88-teen-patti-open",
  "mac88-teen-patti-t20",
  "mac88-amar-akbar-anthony",
  "mac88-casino-war",
];

export const LIVE_CASINO_CATEGORY: CategoryModule = {
  id: "live-casino",
  title: "Live Casino",
  viewAllLink: "/casino/group/live-casino",
  description: "Immersive live-streamed table classics featuring Indian games and premium live suites.",
  provider: "Mac88 & Mixed Live Suites",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: LIVE_CASINO_SLUGS,
};
