"use client";

import { useEffect, useMemo, useState } from "react";
import { menuItems } from "@/lib/constants";
import { cn, formatMenuPriceYen } from "@/lib/utils";

const cartItems = [
  {
    id: menuItems[0].id,
    title: menuItems[0].title,
    quantity: 1,
    price: Number(menuItems[0].price.replace("¥", "")),
  },
  {
    id: menuItems[1].id,
    title: menuItems[1].title,
    quantity: 1,
    price: Number(menuItems[1].price.replace("¥", "")),
  },
  {
    id: menuItems[2].id,
    title: menuItems[2].title,
    quantity: 1,
    price: Number(menuItems[2].price.replace("¥", "")),
  },
] as const;

type PaymentMode = "card-on-delivery" | "cash-on-delivery";

export const Cart = () => {
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [paymentMode, setPaymentMode] =
    useState<PaymentMode>("card-on-delivery");

  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [],
  );
  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [],
  );

  useEffect(() => {
    if (!isCartSheetOpen) {
      return;
    }

    const onEscapePress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCartSheetOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscapePress);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEscapePress);
    };
  }, [isCartSheetOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsCartSheetOpen(true)}
        className="relative border-4 border-ink bg-white px-2 py-2 text-center font-press-start text-[10px] leading-4 text-ink no-underline sm:px-3 sm:py-[10px] sm:text-[11px] lg:px-[14px] lg:py-[12px] lg:text-[12px]"
        aria-label={`Open cart with ${itemCount} items`}
        aria-haspopup="dialog"
        aria-expanded={isCartSheetOpen}
      >
        <span>CART</span>
        <p className="absolute right-0 top-0 size-4 bg-magenta text-[10px] text-white">
          {itemCount}
        </p>
      </button>
      <button
        type="button"
        aria-label="Close cart"
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 transition-opacity duration-200",
          isCartSheetOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsCartSheetOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Cart sheet"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l-6 border-ink bg-cyan transition-transform duration-200",
          isCartSheetOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b-4 border-ink p-4 sm:p-5">
          <div>
            <p className="font-press-start text-[11px] leading-4 text-ink">
              CART
            </p>
            <p className="font-press-start text-[10px] leading-4 text-ink">
              {itemCount} ITEM{itemCount > 1 ? "S" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCartSheetOpen(false)}
            className="border-4 border-ink bg-white px-3 py-2 font-press-start text-[10px] leading-4 text-ink"
          >
            CLOSE
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="sticky top-0 z-10 border-4 border-ink bg-yellow p-4">
            <p className="font-press-start text-[10px] leading-4 text-ink">
              PAYMENT MODE (On Delivery Only)
            </p>
            <div className="w-full mt-3 flex items-center gap-2">
              <label className="w-full flex cursor-pointer items-center gap-2 border-2 border-ink bg-white px-3 py-2">
                <input
                  type="radio"
                  name="payment-mode"
                  value="card-on-delivery"
                  checked={paymentMode === "card-on-delivery"}
                  onChange={() => setPaymentMode("card-on-delivery")}
                />
                <span className="font-press-start text-[10px] leading-4 text-ink">
                  Card
                </span>
              </label>
              <label className="w-full flex cursor-pointer items-center gap-2 border-2 border-ink bg-white px-3 py-2">
                <input
                  type="radio"
                  name="payment-mode"
                  value="cash-on-delivery"
                  checked={paymentMode === "cash-on-delivery"}
                  onChange={() => setPaymentMode("cash-on-delivery")}
                />
                <span className="font-press-start text-[10px] leading-4 text-ink">
                  Cash
                </span>
              </label>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="border-4 border-ink bg-white p-3 shadow-retro-sm"
              >
                <p className="font-press-start text-[10px] leading-4 text-ink">
                  {item.title}
                </p>
                <div className="mt-2 flex items-center justify-between font-press-start text-[10px] leading-4 text-ink">
                  <span>QTY: {item.quantity}</span>
                  <span>{formatMenuPriceYen(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 border-t-4 border-ink bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between font-press-start text-[11px] leading-4 text-ink">
            <span>SUBTOTAL</span>
            <span>{formatMenuPriceYen(subtotal)}</span>
          </div>
          <button
            type="button"
            className="w-full border-4 border-ink bg-magenta px-4 py-3 text-center font-press-start text-[11px] leading-4 text-white"
          >
            PLACE ORDER
          </button>
        </div>
      </aside>
    </>
  );
};
