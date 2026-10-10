import { CategoryModule } from "./types";

export const EZUGI_SLUGS: string[] = [
  "ezugi-andar-bahar",
  "ezugi-teen-patti",
  "ezugi-lucky-7",
  "ezugi-bet-on-teen-patti",
  "ezugi-one-day-teen-patti",
  "ezugi-dragon-tiger",
  "ezugi-cricket-war",
  "ezugi-namaste-roulette",
  "ezugi-speed-baccarat",
  "ezugi-unlimited-blackjack",
  "ezugi-roulette-360",
  "ezugi-auto-roulette",
  "ezugi-ultimate-sic-bo",
];

export const EZUGI_CATEGORY: CategoryModule = {
  id: "ezugi",
  title: "Ezugi Live",
  viewAllLink: "/casino/group/ezugi",
  description: "Authentic live card and table gaming with professional dealers from global broadcast studios.",
  provider: "Ezugi",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: EZUGI_SLUGS,
};
