import { CategoryModule } from "./types";

export const SLOTS_SLUGS: string[] = [
  "sweet-bonanza-1000",
  "gates-of-olympus-1000",
  "sugar-rush-1000",
  "wanted-dead-or-a-wild",
  "chaos-crew-2",
  "rip-city",
  "dork-unit",
  "starlight-princess-1000",
  "san-quentin",
  "tombstone-rip",
  "mental",
  "zeus-vs-hades",
];

export const SLOTS_CATEGORY: CategoryModule = {
  id: "slots",
  title: "Slots",
  viewAllLink: "/casino/group/slots",
  description: "Top-rated video slots with massive multipliers, tumbling reels, and bonus buys.",
  provider: "Pragmatic Play / Hacksaw",
  showGameTitle: true,
  showProviderName: true,
  orderedGameSlugs: SLOTS_SLUGS,
};
