import { CategoryModule } from "./types";

// Game Shows: top Evolution game-show titles curated for home page display.
// Full Evolution catalog lives in evolution.ts; this is a focused featured row.
export const GAME_SHOWS_SLUGS: string[] = [
  "crazy-time",
  "monopoly-live",
  "mega-ball",
  "funky-time",
  "crazy-coin-flip",
  "crazy-pachinko",
  "lightning-dice",
  "balloon-race",
  "red-door-roulette",
  "monopoly-big-baller",
  "lightning-storm",
  "marble-race",
  "crazy-balls",
  "korean-powerball",
];

export const GAME_SHOWS_CATEGORY: CategoryModule = {
  id: "game-shows",
  title: "Game Shows",
  viewAllLink: "/casino/group/game-shows",
  description: "Spectacular TV-style live games featuring giant wheels, dice rolls, and bonus multipliers.",
  provider: "Evolution Gaming",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: GAME_SHOWS_SLUGS,
};
