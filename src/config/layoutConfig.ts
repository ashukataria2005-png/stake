export interface CategoryLayoutConfig {
  id: string; // Category ID / slug (e.g. 'stake-originals', 'live-casino', 'slots')
  title: string; // Display title
  enabled: boolean; // Enable / disable rendering
  viewAllLink?: string; // Link to full group page
  // Ordered list of game slugs to show in this row.
  // Games will appear in the EXACT sequence listed below:
  orderedGameSlugs: string[];
}

export const HOME_PAGE_CATEGORIES: CategoryLayoutConfig[] = [
  {
    id: "stake-originals",
    title: "Stake Originals",
    enabled: true,
    viewAllLink: "/casino/group/stake-originals",
    orderedGameSlugs: [
      "plinko",
      "mines",
      "crash",
      "dice",
      "limbo",
      "hilo",
      "keno",
      "wheel",
      "diamonds",
      "roulette",
      "blackjack",
      "baccarat",
      "video-poker",
      "slide",
      "dragon-tower",
      "scarab-spin",
      "blue-samurai",
      "tome-of-life",
    ],
  },
  
  {
    id: "live-casino",
    title: "Live Casino",
    enabled: true,
    viewAllLink: "/casino/group/live-casino",
    orderedGameSlugs: [
      "crazy-time",
      "lightning-roulette",
      "xxxtreme-lightning-roulette",
      "speed-auto-roulette",
      "live-blackjack",
      "monopoly-live",
      "mega-ball",
      "hindi-roulette",
      "teen-patti-live",
      "mac88-lightning-dragon-tiger",
      "mac88-lightning-andar-bahar",
      "mac88-3-cards-judgement",
      "roulette-360",
      "ezugi-one-day-teen-patti",
    ],
  },
  {
    id: "slots",
    title: "Slots",
    enabled: true,
    viewAllLink: "/casino/group/slots",
    orderedGameSlugs: [
      "sweet-bonanza",
      "gates-of-olympus",
      "sugar-rush",
      "wanted-dead-or-a-wild",
      "big-bass-bonanza",
      "tome-of-life",
      "retro-tapes",
    ],
  },
  {
    id: "mac88",
    title: "Mac88 Indian Suite",
    enabled: true,
    viewAllLink: "/casino/group/mac88",
    orderedGameSlugs: [
      "mac88-lightning-dragon-tiger",
      "mac88-lightning-andar-bahar",
      "mac88-dragon-tiger-lion",
      "mac88-3-cards-judgement",
      "mac88-muflis-teen-patti",
      "mac88-amar-akbar-anthony",
      "mac88-worli-matka",
      "mac88-queen-race",
      "mac88-29-baccarat",
      "mac88-turbo-auto-roulette",
      "mac88-dream-wheel",
    ],
  },
  {
    id: "spribe",
    title: "Spribe",
    enabled: true,
    viewAllLink: "/casino/group/spribe",
    orderedGameSlugs: [
      "aviator",
      "plinko",
      "mines",
      "dice",
      "spribe-goal",
      "spribe-hilo",
      "spribe-hotline",
      "spribe-keno",
    ],
  },
  {
    id: "smartsoft",
    title: "SmartSoft",
    enabled: true,
    viewAllLink: "/casino/group/smartsoft",
    orderedGameSlugs: [
      "jetx",
      "balloon",
      "cricketx",
      "plinko-x",
      "helicopterx",
      "smashx",
      "cappadocia",
    ],
  },
];

// Casino Lobby layout defaults to the same configuration unless overridden:
export const CASINO_LOBBY_CATEGORIES: CategoryLayoutConfig[] = HOME_PAGE_CATEGORIES;
