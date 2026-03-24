"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn, formatMenuPriceYen } from "@/lib/utils";
import { computeOfferDiscountMinor, useCart } from "../../lib/cart-store";
import { CheckoutPaymentModal } from "./checkout-payment-modal";

type CartProps = {
  triggerClassName?: string;
};

export const Cart = ({ triggerClassName }: CartProps) => {
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
      setIsCheckoutPaymentOpen(false);
    }
  }, [isCartSheetOpen]);

  return (
    <>
      <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
        <SheetTrigger
          className={cn(
            buttonVariants({ variant: "retro" }),
            triggerClassName,
            "relative bg-white text-ink no-underline",
          )}
          aria-label={`Open cart with ${itemCount} items`}
        >
          <span>CART</span>
          <span className="absolute right-0 top-0 flex size-4 items-center justify-center bg-magenta font-press-start text-[9px] text-white">
            {itemCount}
          </span>
        </SheetTrigger>
        <SheetContent
          side="right"
          variant="retro"
          showCloseButton={false}
          className={cn(
            "w-full max-w-md gap-0 space-y-0 border-l-6 border-ink bg-cyan p-0 text-ink sm:max-w-md",
          )}
        >
          <SheetTitle className="sr-only">Cart sheet</SheetTitle>
          <SheetDescription className="sr-only">
            Review cart items and proceed to checkout.
          </SheetDescription>
          <div className="flex items-center justify-between border-b-4 border-ink p-4 sm:p-5">
            <div>
              <p className="font-press-start text-[11px] leading-4 text-ink">
                CART
              </p>
              <p className="font-press-start text-[10px] leading-4 text-ink">
                {itemCount} ITEM{itemCount > 1 ? "S" : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="retro"
              onClick={() => setIsCartSheetOpen(false)}
              className="h-auto border-4 border-ink bg-white px-3 py-2 leading-4 text-ink"
            >
              CLOSE
            </Button>
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
                      <Button
                        type="button"
                        variant="retro"
                        className="h-auto min-w-0 border-2 border-ink bg-canvas px-2 py-1 text-[10px] leading-4"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease quantity for ${item.title}`}
                      >
                        -
                      </Button>
                      <span>QTY: {item.quantity}</span>
                      <Button
                        type="button"
                        variant="retro"
                        className="h-auto min-w-0 border-2 border-ink bg-canvas px-2 py-1 text-[10px] leading-4"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity for ${item.title}`}
                      >
                        +
                      </Button>
                    </div>
                    <span>
                      {formatMenuPriceYen(item.price * item.quantity)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="retro"
                    className="mt-2 h-auto border-2 border-ink bg-magenta px-2 py-1 text-[9px] leading-4 text-white"
                    onClick={() => removeItem(item.id)}
                  >
                    REMOVE
                  </Button>
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
            <Button
              type="button"
              disabled={items.length === 0}
              onClick={handleOpenCheckout}
              variant="retro"
              className="h-auto w-full border-4 border-ink bg-magenta px-4 py-3 text-[11px] leading-4 text-white disabled:opacity-50"
            >
              CHECKOUT
            </Button>
          </div>
        </SheetContent>
      </Sheet>
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
