import type {
  AdminMenuItemCreateBody,
  AdminOfferFormDraft,
  AdminSiteContentPutBody,
} from "@/lib/form-schemas";

export type MenuItem = {
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

export type OfferItem = {
  id: string;
  menuItemId: string;
  quantity: number;
};

export type Offer = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  durationMode: "TIME" | "CAPACITY";
  availabilityStart: string;
  availabilityEnd: string | null;
  maxRedemptions: number | null;
  redemptionsUsed: number;
  isActive: boolean;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  items: OfferItem[];
};

export type OrderItem = {
  id: string;
  menuItemId: string | null;
  menuItemSlug: string;
  menuItemTitle: string;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
};

export type Order = {
  id: string;
  status: string;
  paymentMode: string;
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  streetAddress: string;
  city: string;
  addressNotes: string | null;
  guestId: string | null;
  limitedOfferId: string | null;
  createdAt: string;
  items: OrderItem[];
};

export type Stats = {
  id: string;
  dailyCups: number;
  vinylSpins: number;
  arcade: number;
  comboRate: number;
};

export type SiteContent = {
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

export const MENU_CATEGORIES = [
  "SIGNATURE",
  "COLD_BREW",
  "DESSERT",
  "ESPRESSO",
  "FILTER",
  "NON_COFFEE",
  "BAKERY",
  "SAVORY",
  "BREAKFAST",
] as const;

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
] as const;

export const emptyMenuValues = (): AdminMenuItemCreateBody => ({
  slug: "",
  title: "",
  description: "",
  priceMinor: 0,
  category: "SIGNATURE",
  cardColor: "",
  titleColor: "",
  isFeatured: false,
  isMostPopular: false,
  isActive: true,
});

export const emptyOfferDraftValues = (): AdminOfferFormDraft => ({
  name: "",
  description: "",
  image: "",
  durationMode: "TIME",
  availabilityStart: "",
  availabilityEnd: "",
  maxRedemptions: "",
  isActive: false,
  discountType: "PERCENTAGE",
  discountValue: 0,
  items: "",
});

export const emptySiteContentValues = (): AdminSiteContentPutBody => ({
  mangaSessionLabel: "",
  mangaSessionHeadline: "",
  mangaSessionDescription: "",
  locationLabel: "",
  locationAddress: "",
  hoursLineOne: "",
  hoursLineTwo: "",
  directionsUrl: "",
});

export const parseError = async (response: Response, fallback: string) => {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return payload?.error ?? fallback;
};
