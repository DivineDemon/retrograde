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
