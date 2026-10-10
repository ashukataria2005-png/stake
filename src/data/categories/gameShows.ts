import { CategoryModule } from "./types";

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
  "stock-market",
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
