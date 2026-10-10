import { CategoryModule } from "./types";

export const SPRIBE_SLUGS: string[] = [
  "aviator",
  "spribe-plinko",
  "spribe-mines",
  "spribe-dice",
  "spribe-goal",
  "spribe-hilo",
  "spribe-hotline",
  "spribe-keno",
  "spribe-balloon",
  "spribe-mini-roulette",
  "spribe-scratch",
  "spribe-fortune-wheel",
  "spribe-blackjack",
  "spribe-russian-poker",
];

export const SPRIBE_CATEGORY: CategoryModule = {
  id: "spribe",
  title: "Spribe Arcade",
  viewAllLink: "/casino/group/spribe",
  description: "Next-generation turbo and crash games with social multiplayer mechanics.",
  provider: "Spribe",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: SPRIBE_SLUGS,
};
