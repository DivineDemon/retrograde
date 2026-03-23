import { Elysia, t } from "elysia";
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
});

export const guestRoutes = new Elysia({ prefix: "/guest" })
  .get(
    "/:guestId/orders",
    async ({ params }) => {
      const orders = await prisma.order.findMany({
        where: { guestId: params.guestId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          status: true,
          createdAt: true,
          subtotalMinor: true,
          discountMinor: true,
          totalMinor: true,
          currency: true,
          limitedOfferId: true,
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
      body: t.Object({
        customerName: t.String({ minLength: 1 }),
        customerPhone: t.String({ minLength: 1 }),
        streetAddress: t.String({ minLength: 1 }),
        city: t.String({ minLength: 1 }),
        addressNotes: t.Optional(t.String()),
      }),
      response: guestAddressResponse,
    },
  );
