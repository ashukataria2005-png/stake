import { CategoryModule } from "./types";

export const INOUT_SLUGS: string[] = [
  "chicken-road-2",
  "megablock",
  "chicken-road",
  "aviafly",
  "penalty-unlimited",
  "tower-dash",
  "chicken-road-gold",
  "chicken-road-2-bonus",
  "aviafly-2",
  "twist-inout",
  "wheel-out",
  "cricket-road",
  "dragon-pots",
];

export const INOUT_CATEGORY: CategoryModule = {
  id: "inout",
  title: "InOut Games",
  viewAllLink: "/casino/group/inout",
  description: "Innovative fast-paced betting and interactive crash game experiences.",
  provider: "InOut",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: INOUT_SLUGS,
};
