/**
 * Dedicated Central Registry for Non-Game Assets
 * (Promotions, Category Hero Banners, Tournament Graphics, VIP Posters)
 *
 * Users can easily replace image URLs here without modifying any UI/JSX code.
 */

export interface HeroCardAsset {
  title: string;
  image: string;
  defaultPlayers: string;
  href: string;
}

export const BANNER_ASSETS: {
  casinoHero: HeroCardAsset;
  sportsHero: HeroCardAsset;
  messiPromo: string;
  monsterLabPromo: string;
  race100k: string;
  [key: string]: unknown;
} = {
  // Top Hero Cards (Matching Stake Mobile View / Screenshot 6)
  casinoHero: {
    title: "CASINO",
    // Users can paste direct CDN/image URLs here. If empty or invalid, high-fidelity 3D graphics will be rendered.
    image: "https://mediumrare.imgix.net/home-header-one-piece-authenticated-mobile-casino-en.png?q=90&auto=compress%2Cformat&w=402&h=432&fit=min",
    defaultPlayers: "",
    href: "/casino/home",
  },
  sportsHero: {
    title: "SPORTS",
    // Users can paste direct CDN/image URLs here. If empty or invalid, high-fidelity 3D graphics will be rendered.
    image: "https://mediumrare.imgix.net/home-header-one-piece-authenticated-mobile-sports-en.png?q=90&auto=compress%2Cformat&w=402&h=432&fit=min",
    defaultPlayers: "",
    href: "/sports",
  },

  // Official Promotional & Sponsorship Banners
  messiPromo: "https://mediumrare.imgix.net/promotions/messi-stake-ambassador.webp",
  monsterLabPromo: "https://mediumrare.imgix.net/promotions/pragmatic-drops-and-wins.webp",

  // Daily Races & Tournament Banners
  race100k: "https://mediumrare.imgix.net/promotions/stake-daily-race-100k.webp",
};

/**
 * Helper to safely retrieve banner asset or provide a fallback
 */
export function getBannerAsset(key: string, fallbackUrl: string = ""): string {
  const asset = BANNER_ASSETS[key];
  if (typeof asset === "string" && asset.trim().length > 0) {
    return asset;
  }
  if (
    asset &&
    typeof asset === "object" &&
    "image" in asset &&
    typeof (asset as { image: unknown }).image === "string" &&
    ((asset as { image: string }).image || "").trim().length > 0
  ) {
    return (asset as { image: string }).image;
  }
  return fallbackUrl;
}
