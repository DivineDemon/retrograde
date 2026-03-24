import { Elysia, t } from "elysia";
import { guestAddressBody } from "@/lib/form-schemas";
import { prisma } from "@/server/lib/prisma";

const guestAddressResponse = t.Object({
  guestId: t.String(),
  customerName: t.String(),
  customerPhone: t.String(),
  streetAddress: t.String(),
  city: t.String(),
  addressNotes: t.Nullable(t.String()),
});

const guestOrderSummary = t.Object({
  id: t.String(),
  status: t.String(),
  createdAt: t.Date(),
  subtotalMinor: t.Integer(),
  discountMinor: t.Integer(),
  totalMinor: t.Integer(),
  currency: t.String(),
  limitedOfferId: t.Nullable(t.String()),
  items: t.Array(
    t.Object({
      id: t.String(),
      menuItemId: t.Nullable(t.String()),
      menuItemSlug: t.String(),
      menuItemTitle: t.String(),
      unitPriceMinor: t.Integer(),
      quantity: t.Integer(),
      lineTotalMinor: t.Integer(),
    }),
  ),
});

export const guestRoutes = new Elysia({ prefix: "/guest" })
  .get(
    "/:guestId/orders",
    async ({ params }) => {
      const orders = await prisma.order.findMany({
        where: { guestId: params.guestId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          items: true,
        },
      });

      return orders.map((order) => ({
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        subtotalMinor: order.subtotalMinor,
        discountMinor: order.discountMinor,
        totalMinor: order.totalMinor,
        currency: order.currency,
        limitedOfferId: order.limitedOfferId,
        items: order.items.map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemSlug: item.menuItemSlug,
          menuItemTitle: item.menuItemTitle,
          unitPriceMinor: item.unitPriceMinor,
          quantity: item.quantity,
          lineTotalMinor: item.lineTotalMinor,
        })),
      }));
    },
    {
      params: t.Object({ guestId: t.String({ minLength: 1 }) }),
      response: {
        200: t.Array(guestOrderSummary),
      },
    },
  )
  .get(
    "/:guestId/address",
    async ({ params, status }) => {
      const profile = await prisma.customerProfile.findUnique({
        where: { guestId: params.guestId },
      });

      if (!profile) {
        return status(404, { error: "No saved address found for guest" });
      }

      return {
        guestId: profile.guestId,
        customerName: profile.customerName,
        customerPhone: profile.customerPhone,
        streetAddress: profile.streetAddress,
        city: profile.city,
        addressNotes: profile.addressNotes,
      };
    },
    {
      params: t.Object({ guestId: t.String({ minLength: 1 }) }),
      response: {
        200: guestAddressResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .put(
    "/:guestId/address",
    async ({ params, body }) => {
      const saved = await prisma.customerProfile.upsert({
        where: { guestId: params.guestId },
        update: {
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          streetAddress: body.streetAddress,
          city: body.city,
          addressNotes: body.addressNotes,
        },
        create: {
          guestId: params.guestId,
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          streetAddress: body.streetAddress,
          city: body.city,
          addressNotes: body.addressNotes,
        },
      });

      return {
        guestId: saved.guestId,
        customerName: saved.customerName,
        customerPhone: saved.customerPhone,
        streetAddress: saved.streetAddress,
        city: saved.city,
        addressNotes: saved.addressNotes,
      };
    },
    {
      params: t.Object({ guestId: t.String({ minLength: 1 }) }),
      body: guestAddressBody,
      response: guestAddressResponse,
    },
  );
