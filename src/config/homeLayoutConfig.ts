import {
  STAKE_ORIGINALS_SLUGS,
  LIVE_CASINO_SLUGS,
  SLOTS_SLUGS,
  GAME_SHOWS_SLUGS,
  // Provider catalogs (disabled on home page — enable below to add rows):
  EVOLUTION_SLUGS,
  EZUGI_SLUGS,
  MAC88_SLUGS,
  SPRIBE_SLUGS,
  SMARTSOFT_SLUGS,
  INOUT_SLUGS,
  HP100_SLUGS,
  JILI_SLUGS,
  EVOPLAY_SLUGS,
} from "@/data/categories";

export interface CategoryLayoutItem {
  id: string;
  title: string;
  enabled: boolean;
  viewAllLink: string;
  showGameTitle?: boolean; // Default: true. Set to false to hide game titles below cards
  showProviderName?: boolean; // Default: true. Set to false to hide provider labels below cards
  orderedGameSlugs: string[];
}

// ============================================================
// HOME PAGE CATEGORIES — Single source of truth
// ============================================================
// • Only entries with enabled: true are rendered.
// • Reorder items in this array to reorder sections on the page.
// • Add a new item (enabled: true) to render it on the Home page.
// • Control card sequence via orderedGameSlugs.
// ============================================================
export const HOME_PAGE_CATEGORIES: CategoryLayoutItem[] = [
  // ── ACTIVE (4 visible sections) ────────────────────────────
  {
    id: "stake-originals",
    title: "Stake Originals",
    enabled: true,
    viewAllLink: "/casino/group/stake-originals",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: STAKE_ORIGINALS_SLUGS,
  },
  {
    id: "live-casino",
    title: "Live Casino",
    enabled: true,
    viewAllLink: "/casino/group/live-casino",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: LIVE_CASINO_SLUGS,
  },

  {
    id: "inout",
    title: "InOut Games",
    enabled: true,
    viewAllLink: "/casino/group/inout",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: INOUT_SLUGS,
  },
  {
    id: "evolution",
    title: "Evolution Gaming",
    enabled: true,
    viewAllLink: "/casino/group/evolution",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: EVOLUTION_SLUGS,
  },
  {
    id: "spribe",
    title: "Spribe Arcade",
    enabled: true,
    viewAllLink: "/casino/group/spribe",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: SPRIBE_SLUGS,
  },
  {
    id: "ezugi",
    title: "Ezugi Live",
    enabled: true,
    viewAllLink: "/casino/group/ezugi",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: EZUGI_SLUGS,
  },
  {
    id: "game-shows",
    title: "Game Shows",
    enabled: true,
    viewAllLink: "/casino/group/game-shows",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: GAME_SHOWS_SLUGS,
  },
  {
    id: "slots",
    title: "Slots",
    enabled: true,
    viewAllLink: "/casino/group/slots",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: SLOTS_SLUGS,
  },


  // ── DISABLED (provider catalogs — flip enabled: true to show) ──



  {
    id: "mac88",
    title: "Mac88 Indian Suite",
    enabled: true,
    viewAllLink: "/casino/group/mac88",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: MAC88_SLUGS,
  },

  {
    id: "smartsoft",
    title: "SmartSoft",
    enabled: true,
    viewAllLink: "/casino/group/smartsoft",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: SMARTSOFT_SLUGS,
  },

  {
    id: "100hp",
    title: "100hp Gaming",
    enabled: true,
    viewAllLink: "/casino/group/100hp",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: HP100_SLUGS,
  },
  {
    id: "jili",
    title: "Jili Games",
    enabled: true,
    viewAllLink: "/casino/group/jili",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: JILI_SLUGS,
  },
  {
    id: "evoplay",
    title: "Evoplay Entertainment",
    enabled: true,
    viewAllLink: "/casino/group/evoplay",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: EVOPLAY_SLUGS,
  },
];
