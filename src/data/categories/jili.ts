import { CategoryModule } from "./types";

export const JILI_SLUGS: string[] = [
  "jili-mines",
  "gorush",
  "jili-hilo",
  "jili-andar-bahar",
  "jili-tower",
  "jili-limbo",
  "big-small",
  "keno-extra-bet",
  "jili-baccarat",
  "jili-blackjack",
  "jili-roulette",
  "jili-dragon-tiger",
  "super-ace",
  "golden-empire",
  "fortune-gems",
];

export const JILI_CATEGORY: CategoryModule = {
  id: "jili",
  title: "Jili Games",
  viewAllLink: "/casino/group/jili",
  description: "Exciting Asian-style arcade titles, table classics, and vibrant slot adventures.",
  provider: "Jili Games",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: JILI_SLUGS,
};
