import { CategoryModule } from "./types";

export const SPRIBE_SLUGS: string[] = [
  "spribe-aviator",
  "spribe-mines",
  "spribe-goal",
  "spribe-plinko",
  "spribe-dice",
  "spribe-hilo",
  "spribe-hotline",
  "spribe-keno",
  "spribe-balloon",
  "spribe-mini-roulette",
  "spribe-gates-of-egypt",
  "spribe-trader",
  "spribe-juicy-bombs",
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
