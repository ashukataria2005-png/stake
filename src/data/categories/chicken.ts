import { CategoryModule } from "./types";

export const CHICKEN_SLUGS: string[] = [
  "chicken",
  "chicken-road",
  "chicken-road-2",
  "chicken-road-gold",
  "chicken-road-2-bonus",
  "uncrossable-rush",
  "hp100-chicken-tour",
  "hp100-chicken-vs-train",
  "turbo-chicken-route",
  "chicken-banana",
  "chicken-shoot",
  "chicken-coin",
  "spribe-pilot-chicken",
  "turbo-chicken-goal",
  "uncrossable-rush-x-mas",
];

export const CHICKEN_CATEGORY: CategoryModule = {
  id: "chicken-games",
  title: "Chicken Games",
  viewAllLink: "/casino/group/chicken-games",
  description: "Crossing, obstacle rush, and bone-trap games featuring chickens, roads, and multiplier hops.",
  provider: "Arcade & Crash Providers",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: CHICKEN_SLUGS,
};
