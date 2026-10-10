import { CategoryModule } from "./types";

export const SMARTSOFT_SLUGS: string[] = [
  "jetx",
  "towerx",
  "rollx",
  "smartsoft-balloon",
  "plinko-x",
  "cricket-x",
  "helicopter-x",
  "smash-x",
  "double-x",
  "cappadocia",
  "smartsoft-lucky-7",
  "smartsoft-roulette",
];

export const SMARTSOFT_CATEGORY: CategoryModule = {
  id: "smartsoft",
  title: "SmartSoft",
  viewAllLink: "/casino/group/smartsoft",
  description: "Pioneering crash, burst, and arcade games with high-speed multipliers.",
  provider: "SmartSoft Gaming",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: SMARTSOFT_SLUGS,
};
