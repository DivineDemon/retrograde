import { Elysia, t } from "elysia";
import { PaymentMode } from "@/generated/prisma/enums";
import { createOrderBody } from "@/lib/form-schemas";
import { prisma } from "@/server/lib/prisma";

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

export const orderRoutes = new Elysia({ prefix: "/orders" })
  .post(
    "/",
    async ({ body, status }) => {
      const orderItems = body.items as Array<{
        menuItemId: string;
        quantity: number;
      }>;
      const ids = [...new Set(orderItems.map((item) => item.menuItemId))];
      const menuItems = (await prisma.menuItem.findMany({
        where: {
          id: { in: ids },
          isActive: true,
        },
      })) as Array<{
        id: string;
        slug: string;
        title: string;
        priceMinor: number;
      }>;

      if (menuItems.length !== ids.length) {
        return status(400, {
          error: "One or more menu items are missing or inactive",
        });
      }

      const menuItemById = new Map(menuItems.map((item) => [item.id, item]));
      const lineItems = orderItems.map((item) => {
        const menuItem = menuItemById.get(item.menuItemId);
        if (!menuItem) {
          throw new Error(`Missing menu item ${item.menuItemId}`);
        }
        const lineTotalMinor = menuItem.priceMinor * item.quantity;
        return {
          menuItemId: menuItem.id,
          menuItemSlug: menuItem.slug,
          menuItemTitle: menuItem.title,
          unitPriceMinor: menuItem.priceMinor,
          quantity: item.quantity,
          lineTotalMinor,
        };
      });

      const subtotalMinor = lineItems.reduce(
        (sum: number, item: { lineTotalMinor: number }) =>
          sum + item.lineTotalMinor,
        0,
      );

      let discountMinor = 0;
      if (body.limitedOfferId) {
        const activeOffer = await prisma.limitedOffer.findFirst({
          where: { id: body.limitedOfferId, isActive: true },
        });

        if (!activeOffer) {
          return status(400, { error: "Limited offer is not active" });
        }

        if (activeOffer.discountType === "PERCENTAGE") {
          discountMinor = Math.floor(
            (subtotalMinor * activeOffer.discountValue) / 100,
          );
        } else {
          discountMinor = activeOffer.discountValue;
        }
        discountMinor = Math.max(0, Math.min(discountMinor, subtotalMinor));
      }

      if (
        body.paymentMode !== PaymentMode.CARD_ON_DELIVERY &&
        body.paymentMode !== PaymentMode.CASH_ON_DELIVERY
      ) {
        return status(400, { error: "Invalid payment mode" });
      }

      if (body.guestId) {
        await prisma.customerProfile.upsert({
          where: { guestId: body.guestId },
          update: {
            customerName: body.customerName,
            customerPhone: body.customerPhone,
            streetAddress: body.streetAddress,
            city: body.city,
            addressNotes: body.addressNotes,
          },
          create: {
            guestId: body.guestId,
            customerName: body.customerName,
            customerPhone: body.customerPhone,
            streetAddress: body.streetAddress,
            city: body.city,
            addressNotes: body.addressNotes,
          },
        });
      }

      const order = await prisma.order.create({
        data: {
          paymentMode: body.paymentMode as PaymentMode,
          subtotalMinor,
          discountMinor,
          totalMinor: subtotalMinor - discountMinor,
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          streetAddress: body.streetAddress,
          city: body.city,
          addressNotes: body.addressNotes,
          guestId: body.guestId,
          limitedOfferId: body.limitedOfferId,
          items: {
            create: lineItems,
          },
        },
        include: {
          items: true,
        },
      });

      return status(201, {
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
    },
    {
      body: createOrderBody,
      response: {
        201: orderResponse,
        400: t.Object({ error: t.String() }),
      },
    },
  )
  .get(
    "/:id",
    async ({ params, status }) => {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: { items: true },
      });
      if (!order) {
        return status(404, { error: "Order not found" });
      }
      return {
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
      };
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: orderResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  );
