import { CategoryModule } from "./types";

export const EZUGI_SLUGS: string[] = [
  "ezugi-andar-bahar",
  "ezugi-dragon-tiger",
  "ezugi-auto-roulette",
  "ezugi-teen-patti-live",
  "ezugi-lucky-7",
  "ezugi-bet-on-teen-patti",
  "ezugi-one-day-teen-patti",
  "ezugi-cricket-war",
  "ezugi-namaste-roulette",
  "ezugi-speed-baccarat",
  "ezugi-unlimited-blackjack",
  "ezugi-roulette-360",
  "ezugi-ultimate-sic-bo",
];

export const EZUGI_CATEGORY: CategoryModule = {
  id: "ezugi",
  title: "Ezugi Live",
  viewAllLink: "/casino/group/ezugi",
  description: "Authentic live card and table gaming with professional dealers from global broadcast studios.",
  provider: "Ezugi",
  showGameTitle: false,
  showProviderName: false,
  orderedGameSlugs: EZUGI_SLUGS,
};
