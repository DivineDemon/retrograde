"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { CartLineItem } from "../../lib/cart-store";

export type CheckoutAddressFormValues = {
  customerName: string;
  customerPhone: string;
  streetAddress: string;
  city: string;
  addressNotes: string;
};

type CheckoutField =
  | "customerName"
  | "customerPhone"
  | "streetAddress"
  | "city";

type GuestAddressResponse = {
  guestId: string;
  customerName: string;
  customerPhone: string;
  streetAddress: string;
  city: string;
  addressNotes: string | null;
};

type PaymentMode = "card-on-delivery" | "cash-on-delivery";

const PAYMENT_MODE_TO_API = {
  "card-on-delivery": "CARD_ON_DELIVERY",
  "cash-on-delivery": "CASH_ON_DELIVERY",
} as const;

const FIELD_LABELS: Record<CheckoutField, string> = {
  customerName: "Name",
  customerPhone: "Phone",
  streetAddress: "Street address",
  city: "City",
};

type CheckoutPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartLineItem[];
  appliedOfferId: string | null;
  onSuccess: () => void;
};

export const CheckoutPaymentModal = ({
  isOpen,
  onClose,
  items,
  appliedOfferId,
  onSuccess,
}: CheckoutPaymentModalProps) => {
  const [guestId, setGuestId] = useState<string | null>(null);
  const hasPrefilledAddressRef = useRef(false);
  const [formValues, setFormValues] = useState<CheckoutAddressFormValues>({
    customerName: "",
    customerPhone: "",
    streetAddress: "",
    city: "",
    addressNotes: "",
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<CheckoutField, string>>
  >({});
  const [isLoadingGuestProfile, setIsLoadingGuestProfile] = useState(false);
  const [paymentMode, setPaymentMode] =
    useState<PaymentMode>("card-on-delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!isSubmitting) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const bootstrapGuest = async () => {
      setIsLoadingGuestProfile(true);
      try {
        const response = await fetch("/api/guest-id", {
          credentials: "include",
        });
        if (!response.ok || cancelled) {
          return;
        }
        const data = (await response.json()) as { guestId: string };
        setGuestId(data.guestId);

        const addressResponse = await fetch(
          `/api/guest/${encodeURIComponent(data.guestId)}/address`,
        );
        if (addressResponse.status === 404 || cancelled) {
          return;
        }
        if (!addressResponse.ok) {
          throw new Error("Could not load saved address.");
        }

        const addressData =
          (await addressResponse.json()) as GuestAddressResponse;
        setFormValues((previous) => {
          if (hasPrefilledAddressRef.current) {
            return previous;
          }
          return {
            customerName:
              previous.customerName || addressData.customerName || "",
            customerPhone:
              previous.customerPhone || addressData.customerPhone || "",
            streetAddress:
              previous.streetAddress || addressData.streetAddress || "",
            city: previous.city || addressData.city || "",
            addressNotes:
              previous.addressNotes || addressData.addressNotes || "",
          };
        });
        hasPrefilledAddressRef.current = true;
      } catch {
        // No-op: keep checkout usable even if prefill fails.
      } finally {
        if (!cancelled) {
          setIsLoadingGuestProfile(false);
        }
      }
    };

    void bootstrapGuest();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const onFormValueChange = (
    field: keyof CheckoutAddressFormValues,
    value: string,
  ) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
    if (field in FIELD_LABELS) {
      const checkoutField = field as CheckoutField;
      if (formErrors[checkoutField]) {
        setFormErrors((previous) => ({
          ...previous,
          [checkoutField]: undefined,
        }));
      }
    }
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<CheckoutField, string>> = {};
    (Object.keys(FIELD_LABELS) as CheckoutField[]).forEach((field) => {
      if (!formValues[field].trim()) {
        nextErrors[field] = `${FIELD_LABELS[field]} is required`;
      }
    });
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveGuestAddress = async (activeGuestId: string) => {
    try {
      await fetch(`/api/guest/${encodeURIComponent(activeGuestId)}/address`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: formValues.customerName.trim(),
          customerPhone: formValues.customerPhone.trim(),
          streetAddress: formValues.streetAddress.trim(),
          city: formValues.city.trim(),
          addressNotes: formValues.addressNotes.trim() || "",
        }),
      });
    } catch {
      // No-op: order creation remains the source of truth.
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0 || isSubmitting) {
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      let activeGuestId = guestId;
      if (!activeGuestId) {
        const guestResponse = await fetch("/api/guest-id", {
          credentials: "include",
        });
        if (guestResponse.ok) {
          const data = (await guestResponse.json()) as { guestId: string };
          activeGuestId = data.guestId;
          setGuestId(data.guestId);
        }
      }

      const payload = {
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
        paymentMode: PAYMENT_MODE_TO_API[paymentMode],
        guestId: activeGuestId ?? undefined,
        limitedOfferId: appliedOfferId ?? undefined,
        customerName: formValues.customerName.trim(),
        customerPhone: formValues.customerPhone.trim(),
        streetAddress: formValues.streetAddress.trim(),
        city: formValues.city.trim(),
        addressNotes: formValues.addressNotes.trim() || undefined,
      };

      const response = await apiClient.api.orders.post(payload);

      if (response.error || !response.data) {
        const fallbackError = "Could not place your order. Please try again.";
        const apiError =
          response.error && typeof response.error.value === "object"
            ? (response.error.value as { error?: string }).error
            : null;
        toast.error(apiError || fallbackError);
        return;
      }

      if (activeGuestId) {
        await saveGuestAddress(activeGuestId);
      }

      toast.success(
        "Order placed successfully. Thank you — we'll confirm delivery details soon.",
      );
      onSuccess();
    } catch {
      toast.error("Could not place your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close checkout"
        className="fixed inset-0 z-60 bg-ink/40 transition-opacity duration-200"
        onClick={() => {
          if (!isSubmitting) {
            onClose();
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        className={cn(
          "fixed left-1/2 top-1/2 z-61 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto border-4 border-ink bg-cyan p-4 shadow-retro-sm sm:p-5",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b-4 border-ink pb-3">
          <p className="font-press-start text-[11px] leading-4 text-ink">
            CHECKOUT
          </p>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="shrink-0 border-4 border-ink bg-white px-3 py-2 font-press-start text-[10px] leading-4 text-ink disabled:opacity-50"
          >
            CLOSE
          </button>
        </div>

        <div className="mt-4 border-4 border-ink bg-yellow p-4">
          <div className="grid grid-cols-1 gap-2">
            <label className="flex flex-col gap-1">
              <span className="font-press-start text-[9px] leading-4 text-ink">
                NAME *
              </span>
              <input
                type="text"
                value={formValues.customerName}
                onChange={(event) =>
                  onFormValueChange("customerName", event.target.value)
                }
                disabled={isSubmitting}
                className="w-full border-2 border-ink bg-white px-2 py-2 font-press-start text-[10px] leading-4 text-ink disabled:opacity-50"
              />
              {formErrors.customerName ? (
                <span className="font-press-start text-[8px] leading-4 text-red-700">
                  {formErrors.customerName}
                </span>
              ) : null}
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-press-start text-[9px] leading-4 text-ink">
                PHONE *
              </span>
              <input
                type="tel"
                value={formValues.customerPhone}
                onChange={(event) =>
                  onFormValueChange("customerPhone", event.target.value)
                }
                disabled={isSubmitting}
                className="w-full border-2 border-ink bg-white px-2 py-2 font-press-start text-[10px] leading-4 text-ink disabled:opacity-50"
              />
              {formErrors.customerPhone ? (
                <span className="font-press-start text-[8px] leading-4 text-red-700">
                  {formErrors.customerPhone}
                </span>
              ) : null}
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-press-start text-[9px] leading-4 text-ink">
                STREET ADDRESS *
              </span>
              <input
                type="text"
                value={formValues.streetAddress}
                onChange={(event) =>
                  onFormValueChange("streetAddress", event.target.value)
                }
                disabled={isSubmitting}
                className="w-full border-2 border-ink bg-white px-2 py-2 font-press-start text-[10px] leading-4 text-ink disabled:opacity-50"
              />
              {formErrors.streetAddress ? (
                <span className="font-press-start text-[8px] leading-4 text-red-700">
                  {formErrors.streetAddress}
                </span>
              ) : null}
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-press-start text-[9px] leading-4 text-ink">
                CITY *
              </span>
              <input
                type="text"
                value={formValues.city}
                onChange={(event) =>
                  onFormValueChange("city", event.target.value)
                }
                disabled={isSubmitting}
                className="w-full border-2 border-ink bg-white px-2 py-2 font-press-start text-[10px] leading-4 text-ink disabled:opacity-50"
              />
              {formErrors.city ? (
                <span className="font-press-start text-[8px] leading-4 text-red-700">
                  {formErrors.city}
                </span>
              ) : null}
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-press-start text-[9px] leading-4 text-ink">
                ADDRESS NOTES
              </span>
              <textarea
                value={formValues.addressNotes}
                onChange={(event) =>
                  onFormValueChange("addressNotes", event.target.value)
                }
                rows={2}
                disabled={isSubmitting}
                className="w-full resize-none border-2 border-ink bg-white px-2 py-2 font-press-start text-[10px] leading-4 text-ink disabled:opacity-50"
              />
            </label>
            {isLoadingGuestProfile ? (
              <p className="font-press-start text-[8px] leading-4 text-ink">
                Loading saved address...
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 border-4 border-ink bg-yellow p-4">
          <p className="font-press-start text-[10px] leading-4 text-ink">
            PAYMENT MODE (On Delivery Only)
          </p>
          <div className="mt-3 flex w-full items-center gap-2">
            <label className="flex w-full cursor-pointer items-center gap-2 border-2 border-ink bg-white px-3 py-2">
              <input
                type="radio"
                name="checkout-payment-mode"
                value="card-on-delivery"
                checked={paymentMode === "card-on-delivery"}
                onChange={() => setPaymentMode("card-on-delivery")}
                disabled={isSubmitting}
              />
              <span className="font-press-start text-[10px] leading-4 text-ink">
                Card
              </span>
            </label>
            <label className="flex w-full cursor-pointer items-center gap-2 border-2 border-ink bg-white px-3 py-2">
              <input
                type="radio"
                name="checkout-payment-mode"
                value="cash-on-delivery"
                checked={paymentMode === "cash-on-delivery"}
                onChange={() => setPaymentMode("cash-on-delivery")}
                disabled={isSubmitting}
              />
              <span className="font-press-start text-[10px] leading-4 text-ink">
                Cash
              </span>
            </label>
          </div>
        </div>
        <button
          type="button"
          disabled={items.length === 0 || isSubmitting}
          onClick={handlePlaceOrder}
          className="mt-4 w-full border-4 border-ink bg-magenta px-4 py-3 text-center font-press-start text-[11px] leading-4 text-white disabled:opacity-50"
        >
          {isSubmitting ? "PLACING ORDER..." : "PLACE ORDER"}
        </button>
      </div>
    </>
  );
};
