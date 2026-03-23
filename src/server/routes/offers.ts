import { Elysia, t } from "elysia";
import { prisma } from "@/server/lib/prisma";

export const offerRoutes = new Elysia({ prefix: "/offers" }).get(
  "/active",
  async ({ status }) => {
    const offer = await prisma.limitedOffer.findFirst({
      where: { isActive: true },
      include: {
        items: {
          include: {
            menuItem: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!offer) {
      return status(404, { error: "No active limited offer found" });
    }

    return offer;
  },
  {
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
            menuItem: t.Object({
              id: t.String(),
              slug: t.String(),
              title: t.String(),
              priceMinor: t.Integer(),
            }),
          }),
        ),
      }),
      404: t.Object({ error: t.String() }),
    },
  },
);
