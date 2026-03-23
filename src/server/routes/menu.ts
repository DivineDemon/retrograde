import { Elysia, t } from "elysia";
import { prisma } from "@/server/lib/prisma";

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

export const menuRoutes = new Elysia({ prefix: "/menu" })
  .get(
    "/",
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
  .get(
    "/featured",
    async ({ status }) => {
      const featured = await prisma.menuItem.findFirst({
        where: { isFeatured: true, isActive: true },
      });

      if (!featured) {
        return status(404, { error: "No featured menu item found" });
      }

      return featured;
    },
    {
      response: {
        200: menuItemResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .get(
    "/most-popular",
    async () => {
      return prisma.menuItem.findMany({
        where: { isMostPopular: true, isActive: true },
        orderBy: { title: "asc" },
        take: 3,
      });
    },
    {
      response: t.Array(menuItemResponse),
    },
  )
  .get(
    "/:slug",
    async ({ params, status }) => {
      const item = await prisma.menuItem.findUnique({
        where: { slug: params.slug },
      });

      if (!item) {
        return status(404, { error: "Menu item not found" });
      }

      return item;
    },
    {
      params: t.Object({ slug: t.String() }),
      response: {
        200: menuItemResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  );
