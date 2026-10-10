import { CategoryModule } from "./types";

export const EVOPLAY_SLUGS: string[] = [
  "thimbles",
  "penalty-shoot-out-street",
  "penalty-shoot-out-super-spin",
  "penalty-shoot-out",
  "hockey-shootout",
  "uncrossable-rush",
  "uncrossable-rush-x-mas",
  "plinko-blast",
  "red-queen",
  "four-aces",
  "more-or-less",
  "french-roulette",
  "european-roulette",
];

export const EVOPLAY_CATEGORY: CategoryModule = {
  id: "evoplay",
  title: "Evoplay Entertainment",
  viewAllLink: "/casino/group/evoplay",
  description: "Award-winning iGaming developer creating cinematic instant games and 3D slots.",
  provider: "Evoplay",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: EVOPLAY_SLUGS,
};
