import { CategoryModule } from "./types";

export const STAKE_ORIGINALS_SLUGS: string[] = [
  "mines",
  "crash",
  "plinko",
  "limbo",
  "dice",
  "hilo",
  "keno",
  "wheel",
  "diamonds",
  "roulette",
  "blackjack",
  "baccarat",
  "video-poker",
  "slide",
  "dragon-tower",
  "scarab-spin",
  "blue-samurai",
  "tome-of-life",
];

export const STAKE_ORIGINALS_CATEGORY: CategoryModule = {
  id: "stake-originals",
  title: "Stake Originals",
  viewAllLink: "/casino/group/stake-originals",
  description: "Fair, transparent, and exclusive house games crafted specifically for Stake.",
  provider: "Stake Originals",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: STAKE_ORIGINALS_SLUGS,
};
