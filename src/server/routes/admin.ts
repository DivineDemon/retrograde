import { Elysia, t } from "elysia";
import { DiscountType, MenuCategory } from "@/generated/prisma/enums";
import { seedMenuItems } from "@/server/data/bootstrap";
import { prisma } from "@/server/lib/prisma";
import { adminAuthPlugin } from "@/server/plugins/admin-auth";

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

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(adminAuthPlugin)
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
      body: t.Object({ isFeatured: t.Boolean() }),
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
      body: t.Object({
        menuItemIds: t.Array(t.String(), { maxItems: 3 }),
      }),
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
      body: t.Object({ isActive: t.Boolean() }),
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
      body: t.Object({
        dailyCups: t.Integer({ minimum: 0 }),
        vinylSpins: t.Integer({ minimum: 0 }),
        arcade: t.Integer({ minimum: 0 }),
        comboRate: t.Integer({ minimum: 0 }),
      }),
      response: t.Object({
        id: t.String(),
        dailyCups: t.Integer(),
        vinylSpins: t.Integer(),
        arcade: t.Integer(),
        comboRate: t.Integer(),
      }),
    },
  )
  .put(
    "/offers/active",
    async ({ body, status }) => {
      if ("mode" in body && body.mode === "useExisting") {
        const existing = await prisma.limitedOffer.findUnique({
          where: { id: body.offerId },
        });
        if (!existing) {
          return status(404, { error: "Limited offer not found" });
        }

        await prisma.limitedOffer.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
        const activated = await prisma.limitedOffer.update({
          where: { id: body.offerId },
          data: { isActive: true },
          include: { items: true },
        });
        return {
          id: activated.id,
          name: activated.name,
          description: activated.description,
          image: activated.image,
          availabilityStart: activated.availabilityStart,
          availabilityEnd: activated.availabilityEnd,
          isActive: activated.isActive,
          discountType: activated.discountType,
          discountValue: activated.discountValue,
          items: activated.items.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
        };
      }

      if (
        body.discountType !== DiscountType.PERCENTAGE &&
        body.discountType !== DiscountType.FIXED_AMOUNT
      ) {
        return status(400, { error: "Invalid discount type" });
      }

      const offerItems = body.items as Array<{
        menuItemId: string;
        quantity: number;
      }>;
      const menuItemIds = offerItems.map((item) => item.menuItemId);
      const availableCount = await prisma.menuItem.count({
        where: { id: { in: menuItemIds } },
      });
      if (availableCount !== menuItemIds.length) {
        return status(404, { error: "One or more offer menu items not found" });
      }

      await prisma.limitedOffer.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      const created = await prisma.limitedOffer.create({
        data: {
          name: body.name,
          description: body.description,
          image: body.image,
          availabilityStart: new Date(body.availabilityStart),
          availabilityEnd: body.availabilityEnd
            ? new Date(body.availabilityEnd)
            : null,
          discountType: body.discountType as DiscountType,
          discountValue: body.discountValue,
          isActive: true,
          items: {
            create: offerItems.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      return {
        id: created.id,
        name: created.name,
        description: created.description,
        image: created.image,
        availabilityStart: created.availabilityStart,
        availabilityEnd: created.availabilityEnd,
        isActive: created.isActive,
        discountType: created.discountType,
        discountValue: created.discountValue,
        items: created.items.map(
          (item: { id: string; menuItemId: string; quantity: number }) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          }),
        ),
      };
    },
    {
      body: t.Union([
        t.Object({
          mode: t.Literal("useExisting"),
          offerId: t.String(),
        }),
        t.Object({
          mode: t.Literal("create"),
          name: t.String({ minLength: 1 }),
          description: t.String({ minLength: 1 }),
          image: t.Optional(t.String()),
          availabilityStart: t.String({ format: "date-time" }),
          availabilityEnd: t.Optional(t.String({ format: "date-time" })),
          discountType: t.String(),
          discountValue: t.Integer({ minimum: 0 }),
          items: t.Array(
            t.Object({
              menuItemId: t.String(),
              quantity: t.Integer({ minimum: 1 }),
            }),
            { minItems: 1 },
          ),
        }),
      ]),
      response: {
        200: t.Object({
          id: t.String(),
          name: t.String(),
          description: t.String(),
          image: t.Nullable(t.String()),
          availabilityStart: t.Date(),
          availabilityEnd: t.Nullable(t.Date()),
          isActive: t.Boolean(),
          discountType: t.String(),
          discountValue: t.Integer(),
          items: t.Array(
            t.Object({
              id: t.String(),
              menuItemId: t.String(),
              quantity: t.Integer(),
            }),
          ),
        }),
        400: t.Object({ error: t.String() }),
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
