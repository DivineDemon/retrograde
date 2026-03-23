"use client";

import { useEffect, useMemo, useState } from "react";
import { cn, formatMenuPriceYen } from "@/lib/utils";
import { computeOfferDiscountMinor, useCart } from "../../lib/cart-store";
import { CheckoutPaymentModal } from "./checkout-payment-modal";

export const Cart = () => {
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [isCheckoutPaymentOpen, setIsCheckoutPaymentOpen] = useState(false);
  const {
    items,
    itemCount,
    subtotal,
    setQuantity,
    removeItem,
    clearCart,
    appliedOfferId,
    appliedOffer,
  } = useCart();

  const estimatedDiscountMinor = useMemo(
    () =>
      appliedOfferId && appliedOffer
        ? computeOfferDiscountMinor(subtotal, appliedOffer)
        : 0,
    [appliedOffer, appliedOfferId, subtotal],
  );

  const estimatedTotalMinor = useMemo(
    () => Math.max(0, subtotal - estimatedDiscountMinor),
    [estimatedDiscountMinor, subtotal],
  );

  const handleOpenCheckout = () => {
    if (items.length === 0) {
      return;
    }
    setIsCheckoutPaymentOpen(true);
  };

  useEffect(() => {
    if (!isCartSheetOpen) {
      return;
    }

    const onEscapePress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isCheckoutPaymentOpen) {
          setIsCheckoutPaymentOpen(false);
          return;
        }
        setIsCartSheetOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscapePress);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEscapePress);
    };
  }, [isCartSheetOpen, isCheckoutPaymentOpen]);

  useEffect(() => {
    if (!isCartSheetOpen) {
      setIsCheckoutPaymentOpen(false);
    }
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
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="border-4 border-ink bg-white p-3 shadow-retro-sm">
                <p className="font-press-start text-[10px] leading-4 text-ink">
                  Your cart is empty.
                </p>
              </div>
            ) : null}
            {items.map((item) => (
              <div
                key={item.id}
                className="border-4 border-ink bg-white p-3 shadow-retro-sm"
              >
                <p className="font-press-start text-[10px] leading-4 text-ink">
                  {item.title}
                </p>
                <div className="mt-2 flex items-center justify-between font-press-start text-[10px] leading-4 text-ink">
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      className="border-2 border-ink bg-canvas px-2 py-1"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      aria-label={`Decrease quantity for ${item.title}`}
                    >
                      -
                    </button>
                    <span>QTY: {item.quantity}</span>
                    <button
                      type="button"
                      className="border-2 border-ink bg-canvas px-2 py-1"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase quantity for ${item.title}`}
                    >
                      +
                    </button>
                  </div>
                  <span>{formatMenuPriceYen(item.price * item.quantity)}</span>
                </div>
                <button
                  type="button"
                  className="mt-2 border-2 border-ink bg-magenta px-2 py-1 font-press-start text-[9px] leading-4 text-white"
                  onClick={() => removeItem(item.id)}
                >
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 border-t-4 border-ink bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between font-press-start text-[11px] leading-4 text-ink">
            <span>SUBTOTAL</span>
            <span>{formatMenuPriceYen(subtotal)}</span>
          </div>
          {appliedOfferId && appliedOffer && estimatedDiscountMinor > 0 ? (
            <>
              <div className="flex items-center justify-between font-press-start text-[10px] leading-4 text-ink">
                <span>OFFER ({appliedOffer.name})</span>
                <span>-{formatMenuPriceYen(estimatedDiscountMinor)}</span>
              </div>
              <p className="font-press-start text-[8px] leading-4 text-ink opacity-80">
                Estimated total matches checkout; final totals are confirmed
                when you place the order.
              </p>
            </>
          ) : null}
          <div className="flex items-center justify-between border-t-2 border-dashed border-ink pt-2 font-press-start text-[11px] leading-4 text-ink">
            <span>TOTAL (est.)</span>
            <span>{formatMenuPriceYen(estimatedTotalMinor)}</span>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleOpenCheckout}
            className="w-full border-4 border-ink bg-magenta px-4 py-3 text-center font-press-start text-[11px] leading-4 text-white disabled:opacity-50"
          >
            CHECKOUT
          </button>
        </div>
      </aside>
      <CheckoutPaymentModal
        isOpen={isCheckoutPaymentOpen}
        onClose={() => setIsCheckoutPaymentOpen(false)}
        items={items}
        appliedOfferId={appliedOfferId}
        onSuccess={() => {
          clearCart();
          setIsCheckoutPaymentOpen(false);
          setIsCartSheetOpen(false);
        }}
      />
    </>
  );
};
