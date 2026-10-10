import { CategoryModule } from "./types";

export const MAC88_SLUGS: string[] = [
  "mac88-lightning-dragon-tiger",
  "mac88-lightning-andar-bahar",
  "mac88-dragon-tiger-lion",
  "mac88-dragon-tiger-1-day",
  "mac88-dragon-tiger-2",
  "mac88-lightning-dragon-tiger-2",
  "mac88-29-baccarat",
  "mac88-lightning-baccarat",
  "mac88-sicbo-lightning-sicbo",
  "mac88-roulette",
  "mac88-turbo-auto-roulette",
  "mac88-speed-auto-roulette",
  "mac88-high-low",
  "mac88-dream-wheel",
];

export const MAC88_CATEGORY: CategoryModule = {
  id: "mac88",
  title: "Mac88 Indian Suite",
  viewAllLink: "/casino/group/mac88",
  description: "Specialized traditional card and live casino suite crafted for Indian gaming enthusiasts.",
  provider: "Mac88",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: MAC88_SLUGS,
};
