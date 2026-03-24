export type MenuItemDto = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceMinor: number;
  currency: string;
  category: string;
  cardColor: string | null;
  titleColor: string | null;
  isFeatured: boolean;
  isMostPopular: boolean;
  isActive: boolean;
};

export type StatsDto = {
  dailyCups: number;
  vinylSpins: number;
  arcade: number;
  comboRate: number;
};

export type SiteContentDto = {
  id: string;
  mangaSessionLabel: string;
  mangaSessionHeadline: string;
  mangaSessionDescription: string;
  locationLabel: string;
  locationAddress: string;
  hoursLineOne: string;
  hoursLineTwo: string;
  directionsUrl: string;
};

/** Guest order list row from GET /api/guest/:guestId/orders */
export type GuestOrderSummary = {
  id: string;
  status: string;
  /** ISO string from JSON */
  createdAt: string;
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  limitedOfferId: string | null;
  items: Array<{
    id: string;
    menuItemId: string | null;
    menuItemSlug: string;
    menuItemTitle: string;
    unitPriceMinor: number;
    quantity: number;
    lineTotalMinor: number;
  }>;
};

export type OfferDto = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  availabilityStart: Date;
  availabilityEnd: Date | null;
  isActive: boolean;
  discountType: string;
  discountValue: number;
  items: Array<{
    id: string;
    menuItemId: string;
    quantity: number;
    menuItem: {
      id: string;
      slug: string;
      title: string;
      priceMinor: number;
    };
  }>;
};
