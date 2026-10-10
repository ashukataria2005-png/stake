export interface CategoryModule {
  id: string;
  title: string;
  viewAllLink: string;
  description?: string;
  provider?: string;
  showGameTitle?: boolean;
  showProviderName?: boolean;
  orderedGameSlugs: string[];
}
