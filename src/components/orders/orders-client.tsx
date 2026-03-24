"use client";

import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Button } from "@/components/ui/button";
import type { GuestOrderSummary } from "@/lib/api/types";
import { formatMenuPriceYen } from "@/lib/utils";

function formatOrderStatus(status: string) {
  return status.replaceAll("_", " ");
}

type OrdersClientProps = {
  initialOrders: GuestOrderSummary[] | null;
};

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialOrders?.length) {
      setExpandedOrderId(null);
    }
  }, [initialOrders]);

  const ordersError = initialOrders === null ? "Could not load orders." : null;

  return (
    <MaxWidthWrapper className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 font-press-start text-[12px] leading-6 text-ink sm:text-[13px]">
        YOUR ORDERS
      </h1>

      {ordersError ? (
        <div className="border-4 border-ink bg-white p-3 shadow-retro-sm">
          <p className="font-press-start text-[10px] leading-4 text-ink">
            {ordersError}
          </p>
        </div>
      ) : null}

      {!ordersError && initialOrders && initialOrders.length === 0 ? (
        <div className="border-4 border-ink bg-white p-3 shadow-retro-sm">
          <p className="font-press-start text-[10px] leading-4 text-ink">
            No orders yet. When you place one, it will show up here.
          </p>
        </div>
      ) : null}

      {!ordersError && initialOrders && initialOrders.length > 0 ? (
        <ul className="space-y-4">
          {initialOrders.map((order) => (
            <li
              key={order.id}
              className="border-4 border-ink bg-white p-3 shadow-retro-sm"
            >
              <Button
                type="button"
                variant="retro"
                onClick={() =>
                  setExpandedOrderId((current) =>
                    current === order.id ? null : order.id,
                  )
                }
                className="h-auto min-h-0 flex flex-col gap-0 space-y-0 p-2.5 bg-white w-full justify-start text-left whitespace-normal"
                aria-expanded={expandedOrderId === order.id}
              >
                <div className="w-full flex flex-wrap items-start justify-between gap-2 font-press-start text-[10px] leading-4 text-ink">
                  <span className="uppercase">
                    {formatOrderStatus(order.status)}
                  </span>
                  <span>{formatMenuPriceYen(order.totalMinor)}</span>
                </div>
                <p className="w-full font-press-start text-[8px] leading-4 text-ink opacity-80">
                  {new Date(order.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <div className="w-full flex flex-wrap items-start justify-between gap-2 font-press-start text-[10px] leading-4 text-ink">
                  <span className="uppercase font-press-start text-[8px] leading-4 text-ink opacity-70">
                    ID: {order.id}
                  </span>
                  <span className="font-press-start text-[8px] leading-4 text-ink opacity-70">
                    {expandedOrderId === order.id
                      ? "Tap to hide details"
                      : "Tap to see details"}
                  </span>
                </div>
              </Button>

              {expandedOrderId === order.id ? (
                <div className="mt-3 space-y-2 border-t-2 border-dashed border-ink pt-2">
                  <p className="font-press-start text-[9px] leading-4 text-ink">
                    ITEMS
                  </p>
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-2 font-press-start text-[8px] leading-4 text-ink"
                      >
                        <span className="max-w-[70%] truncate">
                          {item.menuItemTitle} x{item.quantity}
                        </span>
                        <span>{formatMenuPriceYen(item.lineTotalMinor)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between font-press-start text-[9px] leading-4 text-ink">
                      <span>SUBTOTAL</span>
                      <span>{formatMenuPriceYen(order.subtotalMinor)}</span>
                    </div>
                    <div className="flex items-center justify-between font-press-start text-[9px] leading-4 text-ink">
                      <span>DISCOUNT</span>
                      <span>
                        {order.discountMinor > 0
                          ? `-${formatMenuPriceYen(order.discountMinor)}`
                          : formatMenuPriceYen(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-press-start text-[9px] leading-4 text-ink">
                      <span>TOTAL</span>
                      <span>{formatMenuPriceYen(order.totalMinor)}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </MaxWidthWrapper>
  );
}
