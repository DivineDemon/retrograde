"use client";

import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import type { GuestOrderSummary } from "@/lib/api/types";
import { formatMenuPriceYen } from "@/lib/utils";

function formatOrderStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function OrdersPage() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [guestLoading, setGuestLoading] = useState(true);
  const [guestError, setGuestError] = useState<string | null>(null);

  const [orders, setOrders] = useState<GuestOrderSummary[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setGuestLoading(true);
      setGuestError(null);
      try {
        const response = await fetch("/api/guest-id", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Could not load guest session.");
        }
        const data = (await response.json()) as { guestId: string };
        if (!cancelled) {
          setGuestId(data.guestId);
        }
      } catch (error) {
        if (!cancelled) {
          setGuestError(
            error instanceof Error ? error.message : "Something went wrong.",
          );
        }
      } finally {
        if (!cancelled) {
          setGuestLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!guestId) {
      return;
    }
    let cancelled = false;
    (async () => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const response = await fetch(
          `/api/guest/${encodeURIComponent(guestId)}/orders`,
          { credentials: "include" },
        );
        if (!response.ok) {
          throw new Error("Could not load orders.");
        }
        const data = (await response.json()) as GuestOrderSummary[];
        if (!cancelled) {
          setOrders(data);
        }
      } catch (error) {
        if (!cancelled) {
          setOrdersError(
            error instanceof Error ? error.message : "Something went wrong.",
          );
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [guestId]);

  const showOrdersSkeleton =
    guestId && (ordersLoading || (orders === null && !ordersError));

  return (
    <MaxWidthWrapper className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 font-press-start text-[12px] leading-6 text-ink sm:text-[13px]">
        YOUR ORDERS
      </h1>

      {guestLoading ? (
        <p className="font-press-start text-[10px] leading-4 text-ink">
          Loading…
        </p>
      ) : null}

      {guestError ? (
        <div className="border-4 border-ink bg-white p-3 shadow-retro-sm">
          <p className="font-press-start text-[10px] leading-4 text-ink">
            {guestError}
          </p>
        </div>
      ) : null}

      {!guestLoading && !guestError && guestId && showOrdersSkeleton ? (
        <p className="font-press-start text-[10px] leading-4 text-ink">
          Loading orders…
        </p>
      ) : null}

      {!guestLoading && !guestError && guestId && ordersError ? (
        <div className="border-4 border-ink bg-white p-3 shadow-retro-sm">
          <p className="font-press-start text-[10px] leading-4 text-ink">
            {ordersError}
          </p>
        </div>
      ) : null}

      {!guestLoading &&
      !guestError &&
      guestId &&
      orders &&
      orders.length === 0 ? (
        <div className="border-4 border-ink bg-white p-3 shadow-retro-sm">
          <p className="font-press-start text-[10px] leading-4 text-ink">
            No orders yet. When you place one, it will show up here.
          </p>
        </div>
      ) : null}

      {!guestLoading &&
      !guestError &&
      guestId &&
      orders &&
      orders.length > 0 ? (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border-4 border-ink bg-white p-3 shadow-retro-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 font-press-start text-[10px] leading-4 text-ink">
                <span className="uppercase">
                  {formatOrderStatus(order.status)}
                </span>
                <span>{formatMenuPriceYen(order.totalMinor)}</span>
              </div>
              <p className="mt-2 font-press-start text-[8px] leading-4 text-ink opacity-80">
                {new Date(order.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="mt-1 font-press-start text-[8px] leading-4 text-ink opacity-70">
                ID: {order.id}
              </p>
              {order.discountMinor > 0 ? (
                <div className="mt-3 space-y-1 border-t-2 border-dashed border-ink pt-2">
                  <div className="flex items-center justify-between font-press-start text-[9px] leading-4 text-ink">
                    <span>SUBTOTAL</span>
                    <span>{formatMenuPriceYen(order.subtotalMinor)}</span>
                  </div>
                  <div className="flex items-center justify-between font-press-start text-[9px] leading-4 text-ink">
                    <span>DISCOUNT</span>
                    <span>-{formatMenuPriceYen(order.discountMinor)}</span>
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
