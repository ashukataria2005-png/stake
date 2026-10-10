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
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: STAKE_ORIGINALS_SLUGS,
  },
  {
    id: "slots",
    title: "Slots",
    enabled: true,
    viewAllLink: "/casino/group/slots",
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: SLOTS_SLUGS,
  },
  {
    id: "live-casino",
    title: "Live Casino",
    enabled: true,
    viewAllLink: "/casino/group/live-casino",
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: LIVE_CASINO_SLUGS,
  },
  {
    id: "game-shows",
    title: "Game Shows",
    enabled: true,
    viewAllLink: "/casino/group/game-shows",
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: GAME_SHOWS_SLUGS,
  },

  // ── DISABLED (provider catalogs — flip enabled: true to show) ──
  {
    id: "evolution",
    title: "Evolution Gaming",
    enabled: false,
    viewAllLink: "/casino/group/evolution",
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: EVOLUTION_SLUGS,
  },
  {
    id: "ezugi",
    title: "Ezugi Live",
    enabled: false,
    viewAllLink: "/casino/group/ezugi",
    showGameTitle: false,
    showProviderName: false,
    orderedGameSlugs: EZUGI_SLUGS,
  },
  {
    id: "mac88",
    title: "Mac88 Indian Suite",
    enabled: false,
    viewAllLink: "/casino/group/mac88",
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: MAC88_SLUGS,
  },
  {
    id: "spribe",
    title: "Spribe Arcade",
    enabled: false,
    viewAllLink: "/casino/group/spribe",
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: SPRIBE_SLUGS,
  },
  {
    id: "smartsoft",
    title: "SmartSoft",
    enabled: false,
    viewAllLink: "/casino/group/smartsoft",
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: SMARTSOFT_SLUGS,
  },
  {
    id: "inout",
    title: "InOut Games",
    enabled: false,
    viewAllLink: "/casino/group/inout",
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: INOUT_SLUGS,
  },
  {
    id: "100hp",
    title: "100hp Gaming",
    enabled: false,
    viewAllLink: "/casino/group/100hp",
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: HP100_SLUGS,
  },
  {
    id: "jili",
    title: "Jili Games",
    enabled: false,
    viewAllLink: "/casino/group/jili",
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: JILI_SLUGS,
  },
  {
    id: "evoplay",
    title: "Evoplay Entertainment",
    enabled: false,
    viewAllLink: "/casino/group/evoplay",
    showGameTitle: true,
    showProviderName: true,
    orderedGameSlugs: EVOPLAY_SLUGS,
  },
];
