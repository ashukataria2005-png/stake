import { CategoryModule } from "./types";

export const HP100_SLUGS: string[] = [
  "astronaut",
  "airjet",
  "chicken-tour",
  "starx",
  "chicken-vs-train",
  "tappy-bird",
  "astronaut-rivals",
  "hp100-turbo-roulette",
  "hp100-arcade-blackjack",
  "hp100-turbo-dice",
  "hp100-multiplier-blast",
];

export const HP100_CATEGORY: CategoryModule = {
  id: "100hp",
  title: "100hp Gaming",
  viewAllLink: "/casino/group/100hp",
  description: "High-horsepower arcade releases, dynamic crash games, and rapid-round action.",
  provider: "100hp Gaming",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: HP100_SLUGS,
};
