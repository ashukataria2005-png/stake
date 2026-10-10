import { CategoryModule } from "./types";

export const EVOLUTION_SLUGS: string[] = [
  "crazy-time",
  "lightning-roulette",
  "xxxtreme-lightning-roulette",
  "live-blackjack",
  "monopoly-live",
  "mega-ball",
  "funky-time",
  "crazy-coin-flip",
  "crazy-pachinko",
  "lightning-dice",
  "lightning-baccarat",
  "super-sic-bo",
  "balloon-race",
  "red-door-roulette",
  "bac-bo",
  "football-studio",
  "stock-market",
];

export const EVOLUTION_CATEGORY: CategoryModule = {
  id: "evolution",
  title: "Evolution Gaming",
  viewAllLink: "/casino/group/evolution",
  description: "World-leading live casino dealer games, game shows, and high-definition studios.",
  provider: "Evolution",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: EVOLUTION_SLUGS,
};
