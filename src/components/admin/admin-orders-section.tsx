"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMenuPriceYen } from "@/lib/utils";
import { AdminConfirmDeleteDialog } from "./admin-confirm-delete-dialog";
import {
  ORDER_STATUSES,
  type Order,
  parseError,
} from "./admin-dashboard-types";

type AdminOrdersSectionProps = {
  orderStatusFilter: string;
  setOrderStatusFilter: (value: string) => void;
  orders: Order[];
  expandedOrderId: string | null;
  setExpandedOrderId: Dispatch<SetStateAction<string | null>>;
  loadAllData: (statusFilter?: string) => Promise<void>;
  performAction: (action: () => Promise<void>) => Promise<void>;
  isMutating: boolean;
};

export function AdminOrdersSection({
  orderStatusFilter,
  setOrderStatusFilter,
  orders,
  expandedOrderId,
  setExpandedOrderId,
  loadAllData,
  performAction,
  isMutating,
}: AdminOrdersSectionProps) {
  return (
    <section className="grid gap-3 border-4 border-ink bg-white p-4 shadow-retro-sm">
      <h2 className="font-press-start text-[11px] leading-5 text-ink">
        ORDERS
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={orderStatusFilter === "" ? "__all__" : orderStatusFilter}
          onValueChange={(value) =>
            setOrderStatusFilter(
              value == null || value === "__all__" ? "" : value,
            )
          }
        >
          <SelectTrigger
            variant="retro"
            className="h-auto min-w-48 font-press-start text-[9px] leading-4"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent variant="retro">
            <SelectItem value="__all__">ALL STATUSES</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="retro"
          onClick={() => void loadAllData(orderStatusFilter)}
          className="border-4 bg-cyan px-3 py-2 font-press-start text-[9px] leading-4 text-ink"
        >
          APPLY FILTER
        </Button>
      </div>
      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="grid gap-3 border-2 border-ink bg-canvas p-3 md:grid-cols-[1fr_auto]"
          >
            <div className="space-y-1">
              <p className="font-press-start text-[9px] leading-4 text-ink">
                {order.id} - {order.status} -{" "}
                {formatMenuPriceYen(order.totalMinor)}
              </p>
              <Button
                type="button"
                variant="retro"
                onClick={() =>
                  setExpandedOrderId((current) =>
                    current === order.id ? null : order.id,
                  )
                }
                aria-expanded={expandedOrderId === order.id}
                className="h-auto border-2 bg-white px-2 py-1 text-[8px] leading-4 text-ink"
              >
                {expandedOrderId === order.id ? "HIDE DETAILS" : "SHOW DETAILS"}
              </Button>
            </div>
            <div className="justify-self-start md:justify-self-end">
              <Select
                value={order.status}
                onValueChange={(status) => {
                  if (status == null) return;
                  void performAction(async () => {
                    const response = await fetch(
                      `/api/admin/orders/${encodeURIComponent(order.id)}/status`,
                      {
                        method: "PATCH",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status }),
                      },
                    );
                    if (!response.ok) {
                      throw new Error(
                        await parseError(
                          response,
                          "Failed to update order status.",
                        ),
                      );
                    }
                  });
                }}
              >
                <SelectTrigger
                  variant="retro"
                  size="sm"
                  className="h-auto min-w-36 font-press-start text-[8px] leading-4"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent variant="retro">
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="font-press-start text-[8px] leading-4 text-ink/70 md:col-span-2">
              {order.customerName} | {order.customerPhone} |{" "}
              {order.streetAddress}, {order.city}
            </p>
            {expandedOrderId === order.id ? (
              <div className="space-y-2 border-t border-dashed border-ink pt-2 md:col-span-2">
                <p className="font-press-start text-[8px] leading-4 text-ink">
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
                  <div className="flex items-center justify-between font-press-start text-[8px] leading-4 text-ink">
                    <span>SUBTOTAL</span>
                    <span>{formatMenuPriceYen(order.subtotalMinor)}</span>
                  </div>
                  <div className="flex items-center justify-between font-press-start text-[8px] leading-4 text-ink">
                    <span>DISCOUNT</span>
                    <span>
                      {order.discountMinor > 0
                        ? `-${formatMenuPriceYen(order.discountMinor)}`
                        : formatMenuPriceYen(0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="flex gap-2 md:col-span-2">
              <Button
                type="button"
                variant="retro"
                onClick={() =>
                  void performAction(async () => {
                    const response = await fetch(
                      `/api/admin/orders/${encodeURIComponent(order.id)}/cancel`,
                      { method: "POST", credentials: "include" },
                    );
                    if (!response.ok) {
                      throw new Error(
                        await parseError(response, "Failed to cancel order."),
                      );
                    }
                  })
                }
                className="h-auto border-2 bg-yellow px-2 py-1 text-[8px] leading-4 text-ink"
              >
                CANCEL
              </Button>
              <AdminConfirmDeleteDialog
                itemLabel={`order "${order.id}"`}
                disabled={isMutating}
                onConfirm={() =>
                  performAction(async () => {
                    const response = await fetch(
                      `/api/admin/orders/${encodeURIComponent(order.id)}`,
                      { method: "DELETE", credentials: "include" },
                    );
                    if (!response.ok) {
                      throw new Error(
                        await parseError(response, "Failed to delete order."),
                      );
                    }
                  })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
