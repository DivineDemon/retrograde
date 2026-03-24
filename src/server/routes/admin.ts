import { Elysia, t } from "elysia";
import {
  DiscountType,
  MenuCategory,
  OfferDurationMode,
  OrderStatus,
} from "@/generated/prisma/enums";
import {
  adminLoginBody,
  adminMenuActivePatchBody,
  adminMenuFeaturedPatchBody,
  adminMenuItemCreateBody,
  adminMenuItemUpdateBody,
  adminMenuMostPopularPatchBody,
  adminOfferActivePatchBody,
  adminOfferCreateBody,
  adminOfferUpdateBody,
  adminOrderStatusPatchBody,
  adminSiteContentPutBody,
  adminStatsAdjustPatchBody,
  adminStatsPutBody,
} from "@/lib/form-schemas";
import { seedMenuItems } from "@/server/data/bootstrap";
import { env } from "@/server/env";
import { prisma } from "@/server/lib/prisma";
import {
  adminAuthPlugin,
  clearAdminSessionCookieHeader,
  createAdminSessionCookieHeader,
  resolveAdminAuth,
} from "@/server/plugins/admin-auth";

const menuCategoryValues = Object.values(MenuCategory);
const discountTypeValues = Object.values(DiscountType);
const offerDurationModeValues = Object.values(OfferDurationMode);
const orderStatusValues = Object.values(OrderStatus);

const menuItemResponse = t.Object({
  id: t.String(),
  slug: t.String(),
  title: t.String(),
  description: t.String(),
  priceMinor: t.Integer(),
  currency: t.String(),
  category: t.String(),
  cardColor: t.Nullable(t.String()),
  titleColor: t.Nullable(t.String()),
  isFeatured: t.Boolean(),
  isMostPopular: t.Boolean(),
  isActive: t.Boolean(),
});

const offerItemResponse = t.Object({
  id: t.String(),
  menuItemId: t.String(),
  quantity: t.Integer(),
});

const limitedOfferResponse = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  image: t.Nullable(t.String()),
  durationMode: t.String(),
  availabilityStart: t.Date(),
  availabilityEnd: t.Nullable(t.Date()),
  maxRedemptions: t.Nullable(t.Integer()),
  redemptionsUsed: t.Integer(),
  isActive: t.Boolean(),
  discountType: t.String(),
  discountValue: t.Integer(),
  items: t.Array(offerItemResponse),
});

const orderItemResponse = t.Object({
  id: t.String(),
  menuItemId: t.Nullable(t.String()),
  menuItemSlug: t.String(),
  menuItemTitle: t.String(),
  unitPriceMinor: t.Integer(),
  quantity: t.Integer(),
  lineTotalMinor: t.Integer(),
});

const orderResponse = t.Object({
  id: t.String(),
  status: t.String(),
  paymentMode: t.String(),
  subtotalMinor: t.Integer(),
  discountMinor: t.Integer(),
  totalMinor: t.Integer(),
  currency: t.String(),
  customerName: t.String(),
  customerPhone: t.String(),
  streetAddress: t.String(),
  city: t.String(),
  addressNotes: t.Nullable(t.String()),
  guestId: t.Nullable(t.String()),
  limitedOfferId: t.Nullable(t.String()),
  createdAt: t.Date(),
  items: t.Array(orderItemResponse),
});

const siteContentResponse = t.Object({
  id: t.String(),
  mangaSessionLabel: t.String(),
  mangaSessionHeadline: t.String(),
  mangaSessionDescription: t.String(),
  locationLabel: t.String(),
  locationAddress: t.String(),
  hoursLineOne: t.String(),
  hoursLineTwo: t.String(),
  directionsUrl: t.String(),
});

const statsResponse = t.Object({
  id: t.String(),
  dailyCups: t.Integer(),
  vinylSpins: t.Integer(),
  arcade: t.Integer(),
  comboRate: t.Integer(),
});

const defaultSiteContent = {
  mangaSessionLabel: "MANGA NIGHT SESSIONS / FRI + SAT",
  mangaSessionHeadline: "DRAW. DRINK.\nREPEAT.",
  mangaSessionDescription:
    "Live ink artists, city-pop DJs, and all-night espresso labs. Bring your sketchbook and claim your booth.",
  locationLabel: "RETROGRADE HQ",
  locationAddress: "5 L, Block L Gulberg 2, Lahore, 54660, Pakistan",
  hoursLineOne: "08:00AM-12:00AM",
  hoursLineTwo: "DAILY, NO EXCEPTIONS",
  directionsUrl:
    "https://www.google.com/maps/place/Retrograde+Coffee+-+Gulberg/@31.5200515,74.3463278,17z/data=!3m1!4b1!4m6!3m5!1s0x3919055116e42c0d:0xfed728ebcf47be89!8m2!3d31.520047!4d74.3489027!16s%2Fg%2F11n3kztsrs?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D",
};

const toMenuItemInput = (body: Record<string, unknown>) => ({
  slug: body.slug as string,
  title: body.title as string,
  description: body.description as string,
  priceMinor: body.priceMinor as number,
  currency: "JPY" as const,
  category: body.category as MenuCategory,
  cardColor: (body.cardColor as string | undefined) ?? null,
  titleColor: (body.titleColor as string | undefined) ?? null,
  isFeatured: (body.isFeatured as boolean | undefined) ?? false,
  isMostPopular: (body.isMostPopular as boolean | undefined) ?? false,
  isActive: (body.isActive as boolean | undefined) ?? true,
});

const toMenuItemResponse = (item: {
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
}) => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  description: item.description,
  priceMinor: item.priceMinor,
  currency: item.currency,
  category: item.category,
  cardColor: item.cardColor,
  titleColor: item.titleColor,
  isFeatured: item.isFeatured,
  isMostPopular: item.isMostPopular,
  isActive: item.isActive,
});

const toOfferResponse = (offer: {
  id: string;
  name: string;
  description: string;
  image: string | null;
  durationMode: OfferDurationMode;
  availabilityStart: Date;
  availabilityEnd: Date | null;
  maxRedemptions: number | null;
  redemptionsUsed: number;
  isActive: boolean;
  discountType: DiscountType;
  discountValue: number;
  items: Array<{ id: string; menuItemId: string; quantity: number }>;
}) => ({
  id: offer.id,
  name: offer.name,
  description: offer.description,
  image: offer.image,
  durationMode: offer.durationMode,
  availabilityStart: offer.availabilityStart,
  availabilityEnd: offer.availabilityEnd,
  maxRedemptions: offer.maxRedemptions,
  redemptionsUsed: offer.redemptionsUsed,
  isActive: offer.isActive,
  discountType: offer.discountType,
  discountValue: offer.discountValue,
  items: offer.items.map((item) => ({
    id: item.id,
    menuItemId: item.menuItemId,
    quantity: item.quantity,
  })),
});

const toOrderResponse = (order: {
  id: string;
  status: OrderStatus;
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
  createdAt: Date;
  items: Array<{
    id: string;
    menuItemId: string | null;
    menuItemSlug: string;
    menuItemTitle: string;
    unitPriceMinor: number;
    quantity: number;
    lineTotalMinor: number;
  }>;
}) => ({
  id: order.id,
  status: order.status,
  paymentMode: order.paymentMode,
  subtotalMinor: order.subtotalMinor,
  discountMinor: order.discountMinor,
  totalMinor: order.totalMinor,
  currency: order.currency,
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  streetAddress: order.streetAddress,
  city: order.city,
  addressNotes: order.addressNotes,
  guestId: order.guestId,
  limitedOfferId: order.limitedOfferId,
  createdAt: order.createdAt,
  items: order.items.map((item) => ({
    id: item.id,
    menuItemId: item.menuItemId,
    menuItemSlug: item.menuItemSlug,
    menuItemTitle: item.menuItemTitle,
    unitPriceMinor: item.unitPriceMinor,
    quantity: item.quantity,
    lineTotalMinor: item.lineTotalMinor,
  })),
});

const parseDateInput = (value: string): Date | null => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const isOfferCurrentlyValid = (offer: {
  durationMode: OfferDurationMode;
  availabilityStart: Date;
  availabilityEnd: Date | null;
  maxRedemptions: number | null;
  redemptionsUsed: number;
}): boolean => {
  const now = new Date();
  if (offer.durationMode === OfferDurationMode.TIME) {
    if (offer.availabilityStart > now) {
      return false;
    }
    return !offer.availabilityEnd || offer.availabilityEnd > now;
  }
  if (offer.maxRedemptions === null) {
    return false;
  }
  return offer.redemptionsUsed < offer.maxRedemptions;
};

const allowedOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.OUT_FOR_DELIVERY]: [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .post(
    "/auth/login",
    ({ body, set, status }) => {
      if (
        body.username !== env.adminUsername ||
        body.password !== env.adminPassword
      ) {
        return status(401, { error: "Invalid admin credentials" });
      }

      set.headers["set-cookie"] = createAdminSessionCookieHeader();
      return { authenticated: true };
    },
    {
      body: adminLoginBody,
      response: {
        200: t.Object({ authenticated: t.Boolean() }),
        401: t.Object({ error: t.String() }),
      },
    },
  )
  .post(
    "/auth/logout",
    ({ set }) => {
      set.headers["set-cookie"] = clearAdminSessionCookieHeader();
      return { authenticated: false };
    },
    {
      response: t.Object({ authenticated: t.Boolean() }),
    },
  )
  .get(
    "/auth/me",
    ({ headers, status }) => {
      const authResult = resolveAdminAuth(headers);
      if (!authResult.ok) {
        return status(401, {
          authenticated: false,
          error: authResult.reason ?? "Unauthorized",
        });
      }

      return { authenticated: true };
    },
    {
      response: {
        200: t.Object({ authenticated: t.Boolean() }),
        401: t.Object({ authenticated: t.Boolean(), error: t.String() }),
      },
    },
  )
  .use(adminAuthPlugin)
  .get(
    "/menu",
    async ({ query }) => {
      const includeInactive = query.includeInactive === "true";
      return prisma.menuItem.findMany({
        where: includeInactive ? undefined : { isActive: true },
        orderBy: [{ category: "asc" }, { title: "asc" }],
      });
    },
    {
      query: t.Object({
        includeInactive: t.Optional(t.String()),
      }),
      response: t.Array(menuItemResponse),
    },
  )
  .post(
    "/menu",
    async ({ body, status }) => {
      const payload = toMenuItemInput(body as Record<string, unknown>);
      if (!menuCategoryValues.includes(payload.category)) {
        return status(400, { error: "Invalid menu category" });
      }

      const existingBySlug = await prisma.menuItem.findUnique({
        where: { slug: payload.slug },
      });
      if (existingBySlug) {
        return status(409, { error: "Menu item slug already exists" });
      }

      if (payload.isFeatured) {
        await prisma.menuItem.updateMany({
          where: { isFeatured: true },
          data: { isFeatured: false },
        });
      }

      if (payload.isMostPopular) {
        const mostPopularCount = await prisma.menuItem.count({
          where: { isMostPopular: true },
        });
        if (mostPopularCount >= 3) {
          return status(400, { error: "No more than 3 most popular items" });
        }
      }

      const created = await prisma.menuItem.create({ data: payload });
      return status(201, toMenuItemResponse(created));
    },
    {
      body: adminMenuItemCreateBody,
      response: {
        201: menuItemResponse,
        400: t.Object({ error: t.String() }),
        409: t.Object({ error: t.String() }),
      },
    },
  )
  .put(
    "/menu/:id",
    async ({ params, body, status }) => {
      const existing = await prisma.menuItem.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return status(404, { error: "Menu item not found" });
      }

      const payload = toMenuItemInput(body as Record<string, unknown>);
      if (!menuCategoryValues.includes(payload.category)) {
        return status(400, { error: "Invalid menu category" });
      }

      const existingBySlug = await prisma.menuItem.findUnique({
        where: { slug: payload.slug },
      });
      if (existingBySlug && existingBySlug.id !== params.id) {
        return status(409, { error: "Menu item slug already exists" });
      }

      if (payload.isFeatured) {
        await prisma.menuItem.updateMany({
          where: { isFeatured: true, id: { not: params.id } },
          data: { isFeatured: false },
        });
      }

      if (payload.isMostPopular) {
        const mostPopularCount = await prisma.menuItem.count({
          where: { isMostPopular: true, id: { not: params.id } },
        });
        if (mostPopularCount >= 3) {
          return status(400, { error: "No more than 3 most popular items" });
        }
      }

      const updated = await prisma.menuItem.update({
        where: { id: params.id },
        data: payload,
      });
      return toMenuItemResponse(updated);
    },
    {
      params: t.Object({ id: t.String() }),
      body: adminMenuItemUpdateBody,
      response: {
        200: menuItemResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        409: t.Object({ error: t.String() }),
      },
    },
  )
  .delete(
    "/menu/:id",
    async ({ params, status }) => {
      const existing = await prisma.menuItem.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return status(404, { error: "Menu item not found" });
      }

      await prisma.menuItem.delete({ where: { id: params.id } });
      return { deleted: true };
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({ deleted: t.Boolean() }),
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .patch(
    "/menu/:id/featured",
    async ({ params, body, status }) => {
      const target = await prisma.menuItem.findUnique({
        where: { id: params.id },
      });
      if (!target) {
        return status(404, { error: "Menu item not found" });
      }

      if (!body.isFeatured) {
        const updated = await prisma.menuItem.update({
          where: { id: params.id },
          data: { isFeatured: false },
        });
        return updated;
      }

      await prisma.menuItem.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      });
      const updated = await prisma.menuItem.update({
        where: { id: params.id },
        data: { isFeatured: true },
      });

      return updated;
    },
    {
      params: t.Object({ id: t.String() }),
      body: adminMenuFeaturedPatchBody,
      response: {
        200: menuItemResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .patch(
    "/menu/most-popular",
    async ({ body, status }) => {
      const requestedIds = body.menuItemIds as string[];
      const uniqueIds = [...new Set(requestedIds)];
      if (uniqueIds.length > 3) {
        return status(400, { error: "No more than 3 menu items allowed" });
      }

      const foundCount = await prisma.menuItem.count({
        where: { id: { in: uniqueIds } },
      });
      if (foundCount !== uniqueIds.length) {
        return status(404, { error: "One or more menu items not found" });
      }

      await prisma.menuItem.updateMany({
        where: { isMostPopular: true },
        data: { isMostPopular: false },
      });
      if (uniqueIds.length > 0) {
        await prisma.menuItem.updateMany({
          where: { id: { in: uniqueIds } },
          data: { isMostPopular: true },
        });
      }

      const updated = await prisma.menuItem.findMany({
        where: { isMostPopular: true },
        orderBy: { title: "asc" },
      });
      return { items: updated };
    },
    {
      body: adminMenuMostPopularPatchBody,
      response: {
        200: t.Object({ items: t.Array(menuItemResponse) }),
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .patch(
    "/menu/:id/active",
    async ({ params, body, status }) => {
      const existing = await prisma.menuItem.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return status(404, { error: "Menu item not found" });
      }

      return prisma.menuItem.update({
        where: { id: params.id },
        data: { isActive: body.isActive },
      });
    },
    {
      params: t.Object({ id: t.String() }),
      body: adminMenuActivePatchBody,
      response: {
        200: menuItemResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .put(
    "/stats",
    async ({ body }) => {
      const stats = await prisma.stats.upsert({
        where: { id: "singleton" },
        update: {
          dailyCups: body.dailyCups,
          vinylSpins: body.vinylSpins,
          arcade: body.arcade,
          comboRate: body.comboRate,
        },
        create: {
          id: "singleton",
          dailyCups: body.dailyCups,
          vinylSpins: body.vinylSpins,
          arcade: body.arcade,
          comboRate: body.comboRate,
        },
      });
      return stats;
    },
    {
      body: adminStatsPutBody,
      response: t.Object({
        id: t.String(),
        dailyCups: t.Integer(),
        vinylSpins: t.Integer(),
        arcade: t.Integer(),
        comboRate: t.Integer(),
      }),
    },
  )
  .patch(
    "/stats/adjust",
    async ({ body }) => {
      const stats = await prisma.stats.upsert({
        where: { id: "singleton" },
        update: {
          dailyCups: { increment: body.dailyCupsDelta },
          vinylSpins: { increment: body.vinylSpinsDelta },
          arcade: { increment: body.arcadeDelta },
          comboRate: { increment: body.comboRateDelta },
        },
        create: {
          id: "singleton",
          dailyCups: body.dailyCupsDelta,
          vinylSpins: body.vinylSpinsDelta,
          arcade: body.arcadeDelta,
          comboRate: body.comboRateDelta,
        },
      });
      return stats;
    },
    {
      body: adminStatsAdjustPatchBody,
      response: statsResponse,
    },
  )
  .get(
    "/site-content",
    async () =>
      prisma.siteContent.upsert({
        where: { id: "singleton" },
        update: {},
        create: {
          id: "singleton",
          ...defaultSiteContent,
        },
      }),
    {
      response: siteContentResponse,
    },
  )
  .put(
    "/site-content",
    async ({ body }) =>
      prisma.siteContent.upsert({
        where: { id: "singleton" },
        update: body,
        create: {
          id: "singleton",
          ...body,
        },
      }),
    {
      body: adminSiteContentPutBody,
      response: siteContentResponse,
    },
  )
  .get(
    "/offers",
    async () => {
      const offers = await prisma.limitedOffer.findMany({
        include: { items: true },
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      });
      return offers.map(toOfferResponse);
    },
    {
      response: t.Array(limitedOfferResponse),
    },
  )
  .post(
    "/offers",
    async ({ body, status }) => {
      if (!discountTypeValues.includes(body.discountType as DiscountType)) {
        return status(400, { error: "Invalid discount type" });
      }
      if (
        !offerDurationModeValues.includes(
          body.durationMode as OfferDurationMode,
        )
      ) {
        return status(400, { error: "Invalid offer duration mode" });
      }

      const availabilityStart = parseDateInput(body.availabilityStart);
      const availabilityEnd = body.availabilityEnd
        ? parseDateInput(body.availabilityEnd)
        : null;
      if (!availabilityStart || (body.availabilityEnd && !availabilityEnd)) {
        return status(400, { error: "Invalid offer date format" });
      }
      if (availabilityEnd && availabilityStart >= availabilityEnd) {
        return status(400, {
          error: "availabilityEnd must be later than availabilityStart",
        });
      }

      const offerItems = body.items as Array<{
        menuItemId: string;
        quantity: number;
      }>;
      const uniqueItemIds = [
        ...new Set(offerItems.map((item) => item.menuItemId)),
      ];
      const availableCount = await prisma.menuItem.count({
        where: { id: { in: uniqueItemIds } },
      });
      if (availableCount !== uniqueItemIds.length) {
        return status(404, { error: "One or more offer menu items not found" });
      }

      const durationMode = body.durationMode as OfferDurationMode;
      const maxRedemptions =
        durationMode === OfferDurationMode.CAPACITY
          ? (body.maxRedemptions ?? null)
          : null;

      if (durationMode === OfferDurationMode.CAPACITY && !maxRedemptions) {
        return status(400, {
          error: "maxRedemptions is required for CAPACITY mode",
        });
      }

      if (body.isActive) {
        const isValid = isOfferCurrentlyValid({
          durationMode,
          availabilityStart,
          availabilityEnd,
          maxRedemptions,
          redemptionsUsed: 0,
        });
        if (!isValid) {
          return status(400, { error: "Cannot activate an invalid offer" });
        }
        await prisma.limitedOffer.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      const created = await prisma.limitedOffer.create({
        data: {
          name: body.name,
          description: body.description,
          image: body.image,
          durationMode,
          availabilityStart,
          availabilityEnd,
          maxRedemptions,
          redemptionsUsed: 0,
          isActive: body.isActive,
          discountType: body.discountType as DiscountType,
          discountValue: body.discountValue,
          items: {
            create: offerItems.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      return status(201, toOfferResponse(created));
    },
    {
      body: adminOfferCreateBody,
      response: {
        201: limitedOfferResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .put(
    "/offers/:id",
    async ({ params, body, status }) => {
      const existing = await prisma.limitedOffer.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return status(404, { error: "Limited offer not found" });
      }
      if (!discountTypeValues.includes(body.discountType as DiscountType)) {
        return status(400, { error: "Invalid discount type" });
      }
      if (
        !offerDurationModeValues.includes(
          body.durationMode as OfferDurationMode,
        )
      ) {
        return status(400, { error: "Invalid offer duration mode" });
      }

      const availabilityStart = parseDateInput(body.availabilityStart);
      const availabilityEnd = body.availabilityEnd
        ? parseDateInput(body.availabilityEnd)
        : null;
      if (!availabilityStart || (body.availabilityEnd && !availabilityEnd)) {
        return status(400, { error: "Invalid offer date format" });
      }
      if (availabilityEnd && availabilityStart >= availabilityEnd) {
        return status(400, {
          error: "availabilityEnd must be later than availabilityStart",
        });
      }

      const offerItems = body.items as Array<{
        menuItemId: string;
        quantity: number;
      }>;
      const uniqueItemIds = [
        ...new Set(offerItems.map((item) => item.menuItemId)),
      ];
      const availableCount = await prisma.menuItem.count({
        where: { id: { in: uniqueItemIds } },
      });
      if (availableCount !== uniqueItemIds.length) {
        return status(404, { error: "One or more offer menu items not found" });
      }

      const durationMode = body.durationMode as OfferDurationMode;
      const maxRedemptions =
        durationMode === OfferDurationMode.CAPACITY
          ? (body.maxRedemptions ?? null)
          : null;

      if (durationMode === OfferDurationMode.CAPACITY && !maxRedemptions) {
        return status(400, {
          error: "maxRedemptions is required for CAPACITY mode",
        });
      }

      if (body.isActive) {
        const isValid = isOfferCurrentlyValid({
          durationMode,
          availabilityStart,
          availabilityEnd,
          maxRedemptions,
          redemptionsUsed: existing.redemptionsUsed,
        });
        if (!isValid) {
          return status(400, { error: "Cannot activate an invalid offer" });
        }
        await prisma.limitedOffer.updateMany({
          where: { isActive: true, id: { not: params.id } },
          data: { isActive: false },
        });
      }

      await prisma.limitedOfferItem.deleteMany({
        where: { limitedOfferId: params.id },
      });

      const updated = await prisma.limitedOffer.update({
        where: { id: params.id },
        data: {
          name: body.name,
          description: body.description,
          image: body.image,
          durationMode,
          availabilityStart,
          availabilityEnd,
          maxRedemptions,
          isActive: body.isActive,
          discountType: body.discountType as DiscountType,
          discountValue: body.discountValue,
          items: {
            create: offerItems.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      return toOfferResponse(updated);
    },
    {
      params: t.Object({ id: t.String() }),
      body: adminOfferUpdateBody,
      response: {
        200: limitedOfferResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .patch(
    "/offers/:id/active",
    async ({ params, body, status }) => {
      const existing = await prisma.limitedOffer.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return status(404, { error: "Limited offer not found" });
      }

      if (body.isActive) {
        const isValid = isOfferCurrentlyValid(existing);
        if (!isValid) {
          return status(400, { error: "Cannot activate an invalid offer" });
        }
        await prisma.limitedOffer.updateMany({
          where: { isActive: true, id: { not: params.id } },
          data: { isActive: false },
        });
      }

      const updated = await prisma.limitedOffer.update({
        where: { id: params.id },
        data: { isActive: body.isActive },
        include: { items: true },
      });
      return toOfferResponse(updated);
    },
    {
      params: t.Object({ id: t.String() }),
      body: adminOfferActivePatchBody,
      response: {
        200: limitedOfferResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .delete(
    "/offers/:id",
    async ({ params, status }) => {
      const existing = await prisma.limitedOffer.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return status(404, { error: "Limited offer not found" });
      }
      await prisma.limitedOffer.delete({ where: { id: params.id } });
      return { deleted: true };
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({ deleted: t.Boolean() }),
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .get(
    "/orders",
    async ({ query }) => {
      const where = query.status
        ? { status: query.status as OrderStatus }
        : undefined;
      const orders = await prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
      return orders.map(toOrderResponse);
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
      }),
      response: t.Array(orderResponse),
    },
  )
  .patch(
    "/orders/:id/status",
    async ({ params, body, status }) => {
      if (!orderStatusValues.includes(body.status as OrderStatus)) {
        return status(400, { error: "Invalid order status" });
      }

      const existing = await prisma.order.findUnique({
        where: { id: params.id },
        include: { items: true },
      });
      if (!existing) {
        return status(404, { error: "Order not found" });
      }

      const nextStatus = body.status as OrderStatus;
      const allowed = allowedOrderTransitions[existing.status];
      if (!allowed.includes(nextStatus)) {
        return status(400, {
          error: `Cannot transition order from ${existing.status} to ${nextStatus}`,
        });
      }

      const updated = await prisma.order.update({
        where: { id: params.id },
        data: { status: nextStatus },
        include: { items: true },
      });

      return toOrderResponse(updated);
    },
    {
      params: t.Object({ id: t.String() }),
      body: adminOrderStatusPatchBody,
      response: {
        200: orderResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .post(
    "/orders/:id/cancel",
    async ({ params, status }) => {
      const existing = await prisma.order.findUnique({
        where: { id: params.id },
        include: { items: true },
      });
      if (!existing) {
        return status(404, { error: "Order not found" });
      }
      if (
        existing.status === OrderStatus.COMPLETED ||
        existing.status === OrderStatus.CANCELLED
      ) {
        return status(400, { error: "Order cannot be cancelled" });
      }

      const updated = await prisma.order.update({
        where: { id: params.id },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true },
      });

      return toOrderResponse(updated);
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: orderResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .delete(
    "/orders/:id",
    async ({ params, status }) => {
      const existing = await prisma.order.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return status(404, { error: "Order not found" });
      }
      await prisma.order.delete({ where: { id: params.id } });
      return { deleted: true };
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({ deleted: t.Boolean() }),
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .post("/menu/sync-from-constants", async () => {
    const categoryMap: Record<string, MenuCategory> = {
      "NON-COFFEE": MenuCategory.NON_COFFEE,
      "COLD BREW": MenuCategory.COLD_BREW,
    };

    const normalized = seedMenuItems.map((item) => ({
      slug: item.slug,
      title: item.title,
      description: item.description,
      priceMinor: item.priceMinor,
      currency: "JPY" as const,
      category:
        categoryMap[item.category] ??
        (item.category.replaceAll(" ", "_") as MenuCategory),
      cardColor: item.cardColor,
      titleColor: item.titleColor,
    }));

    const result = await prisma.$transaction(
      normalized.map((item) =>
        prisma.menuItem.upsert({
          where: { slug: item.slug },
          update: item,
          create: item,
        }),
      ),
    );

    return { synced: result.length };
  });
