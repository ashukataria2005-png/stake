import { CategoryModule } from "./types";

export const HP100_SLUGS: string[] = [
  "hp100-astronaut",
  "hp100-tappy-bird",
  "hp100-chicken-tour",
  "hp100-starx",
  "hp100-chicken-vs-train",
  "hp100-airjet",
  "hp100-astronaut-rivals",
  "hp100-turbo-roulette",
  "hp100-blackjack",
  "hp100-dice",
  "hp100-blast",
  "hp100-penalty",
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
