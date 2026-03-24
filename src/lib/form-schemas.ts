import type { Static } from "@sinclair/typebox";
import { t } from "elysia";

/** Shared customer + delivery address fields (guest PUT address + order checkout). */
const customerAddressPropertySchemas = {
  customerName: t.String({ minLength: 1 }),
  customerPhone: t.String({ minLength: 1 }),
  streetAddress: t.String({ minLength: 1 }),
  city: t.String({ minLength: 1 }),
  addressNotes: t.Optional(t.String()),
} as const;

export const customerAddressBody = t.Object({
  ...customerAddressPropertySchemas,
});

/**
 * Checkout modal: address fields + UI payment mode (mapped to API enums on submit).
 */
export const checkoutPaymentFormBody = t.Object({
  ...customerAddressPropertySchemas,
  paymentMode: t.Union([
    t.Literal("card-on-delivery"),
    t.Literal("cash-on-delivery"),
  ]),
});

/** Same shape as `customerAddressBody` — used for `PUT /guest/:guestId/address`. */
export const guestAddressBody = customerAddressBody;

const orderLineItemSchema = t.Object({
  menuItemId: t.String(),
  quantity: t.Integer({ minimum: 1 }),
});

export const createOrderBody = t.Object({
  items: t.Array(orderLineItemSchema, { minItems: 1 }),
  paymentMode: t.String(),
  guestId: t.Optional(t.String()),
  limitedOfferId: t.Optional(t.String()),
  ...customerAddressPropertySchemas,
});

export const adminLoginBody = t.Object({
  username: t.String({ minLength: 1 }),
  password: t.String({ minLength: 1 }),
});

const menuItemWritePropertySchemas = {
  slug: t.String({ minLength: 1 }),
  title: t.String({ minLength: 1 }),
  description: t.String({ minLength: 1 }),
  priceMinor: t.Integer({ minimum: 0 }),
  category: t.String(),
  cardColor: t.Optional(t.String()),
  titleColor: t.Optional(t.String()),
  isFeatured: t.Optional(t.Boolean()),
  isMostPopular: t.Optional(t.Boolean()),
  isActive: t.Optional(t.Boolean()),
} as const;

export const adminMenuItemCreateBody = t.Object({
  ...menuItemWritePropertySchemas,
});

export const adminMenuItemUpdateBody = t.Object({
  ...menuItemWritePropertySchemas,
});

export const adminMenuFeaturedPatchBody = t.Object({
  isFeatured: t.Boolean(),
});

export const adminMenuMostPopularPatchBody = t.Object({
  menuItemIds: t.Array(t.String(), { maxItems: 3 }),
});

export const adminMenuActivePatchBody = t.Object({
  isActive: t.Boolean(),
});

export const adminStatsPutBody = t.Object({
  dailyCups: t.Integer({ minimum: 0 }),
  vinylSpins: t.Integer({ minimum: 0 }),
  arcade: t.Integer({ minimum: 0 }),
  comboRate: t.Integer({ minimum: 0 }),
});

export const adminStatsAdjustPatchBody = t.Object({
  dailyCupsDelta: t.Integer(),
  vinylSpinsDelta: t.Integer(),
  arcadeDelta: t.Integer(),
  comboRateDelta: t.Integer(),
});

export const adminSiteContentPutBody = t.Object({
  mangaSessionLabel: t.String({ minLength: 1 }),
  mangaSessionHeadline: t.String({ minLength: 1 }),
  mangaSessionDescription: t.String({ minLength: 1 }),
  locationLabel: t.String({ minLength: 1 }),
  locationAddress: t.String({ minLength: 1 }),
  hoursLineOne: t.String({ minLength: 1 }),
  hoursLineTwo: t.String({ minLength: 1 }),
  directionsUrl: t.String({ minLength: 1 }),
});

const offerLineItemSchema = t.Object({
  menuItemId: t.String(),
  quantity: t.Integer({ minimum: 1 }),
});

const limitedOfferWritePropertySchemas = {
  name: t.String({ minLength: 1 }),
  description: t.String({ minLength: 1 }),
  image: t.Optional(t.String()),
  durationMode: t.String(),
  availabilityStart: t.String({ format: "date-time" }),
  availabilityEnd: t.Optional(t.String({ format: "date-time" })),
  maxRedemptions: t.Optional(t.Integer({ minimum: 1 })),
  discountType: t.String(),
  discountValue: t.Integer({ minimum: 0 }),
  items: t.Array(offerLineItemSchema, { minItems: 1 }),
} as const;

export const adminOfferCreateBody = t.Object({
  ...limitedOfferWritePropertySchemas,
  isActive: t.Boolean({ default: false }),
});

export const adminOfferUpdateBody = t.Object({
  ...limitedOfferWritePropertySchemas,
  isActive: t.Boolean(),
});

export const adminOfferActivePatchBody = t.Object({
  isActive: t.Boolean(),
});

export const adminOrderStatusPatchBody = t.Object({
  status: t.String(),
});

/**
 * Admin dashboard limited-offer form before mapping to API:
 * - `items` is comma-separated `menuItemId:qty`
 * - datetimes are `datetime-local` input values (not strict ISO date-time).
 */
export const adminOfferFormDraftBody = t.Object({
  name: t.String({ minLength: 1 }),
  description: t.String({ minLength: 1 }),
  image: t.Optional(t.String()),
  durationMode: t.String(),
  availabilityStart: t.String({ minLength: 1 }),
  availabilityEnd: t.Optional(t.String()),
  maxRedemptions: t.Optional(t.String()),
  isActive: t.Boolean(),
  discountType: t.String(),
  discountValue: t.Integer({ minimum: 0 }),
  items: t.String({ minLength: 1 }),
});

export type CustomerAddressBody = Static<typeof customerAddressBody>;
export type CheckoutPaymentFormBody = Static<typeof checkoutPaymentFormBody>;
export type GuestAddressBody = Static<typeof guestAddressBody>;
export type CreateOrderBody = Static<typeof createOrderBody>;
export type AdminLoginBody = Static<typeof adminLoginBody>;
export type AdminMenuItemCreateBody = Static<typeof adminMenuItemCreateBody>;
export type AdminMenuItemUpdateBody = Static<typeof adminMenuItemUpdateBody>;
export type AdminMenuFeaturedPatchBody = Static<
  typeof adminMenuFeaturedPatchBody
>;
export type AdminMenuMostPopularPatchBody = Static<
  typeof adminMenuMostPopularPatchBody
>;
export type AdminMenuActivePatchBody = Static<typeof adminMenuActivePatchBody>;
export type AdminStatsPutBody = Static<typeof adminStatsPutBody>;
export type AdminStatsAdjustPatchBody = Static<
  typeof adminStatsAdjustPatchBody
>;
export type AdminSiteContentPutBody = Static<typeof adminSiteContentPutBody>;
export type AdminOfferCreateBody = Static<typeof adminOfferCreateBody>;
export type AdminOfferUpdateBody = Static<typeof adminOfferUpdateBody>;
export type AdminOfferActivePatchBody = Static<
  typeof adminOfferActivePatchBody
>;
export type AdminOrderStatusPatchBody = Static<
  typeof adminOrderStatusPatchBody
>;
export type AdminOfferFormDraft = Static<typeof adminOfferFormDraftBody>;
