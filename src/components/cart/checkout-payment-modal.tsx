"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api/client";
import {
  type CheckoutPaymentFormBody,
  type CustomerAddressBody,
  checkoutPaymentFormBody,
} from "@/lib/form-schemas";
import type { CartLineItem } from "../../lib/cart-store";

export type { CheckoutPaymentFormBody };

type GuestAddressResponse = {
  guestId: string;
  customerName: string;
  customerPhone: string;
  streetAddress: string;
  city: string;
  addressNotes: string | null;
};

const PAYMENT_MODE_TO_API = {
  "card-on-delivery": "CARD_ON_DELIVERY",
  "cash-on-delivery": "CASH_ON_DELIVERY",
} as const;

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
  const [isLoadingGuestProfile, setIsLoadingGuestProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutPaymentFormBody>({
    resolver: typeboxResolver(checkoutPaymentFormBody),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      streetAddress: "",
      city: "",
      addressNotes: "",
      paymentMode: "card-on-delivery",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    hasPrefilledAddressRef.current = false;

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
        if (hasPrefilledAddressRef.current) {
          return;
        }
        form.reset({
          customerName: addressData.customerName || "",
          customerPhone: addressData.customerPhone || "",
          streetAddress: addressData.streetAddress || "",
          city: addressData.city || "",
          addressNotes: addressData.addressNotes ?? "",
          paymentMode: "card-on-delivery",
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
  }, [isOpen, form.reset]);

  const saveGuestAddress = async (
    activeGuestId: string,
    values: CustomerAddressBody,
  ) => {
    try {
      await fetch(`/api/guest/${encodeURIComponent(activeGuestId)}/address`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: values.customerName.trim(),
          customerPhone: values.customerPhone.trim(),
          streetAddress: values.streetAddress.trim(),
          city: values.city.trim(),
          addressNotes: values.addressNotes?.trim() || "",
        }),
      });
    } catch {
      // No-op: order creation remains the source of truth.
    }
  };

  const handlePlaceOrder = form.handleSubmit(async (values) => {
    if (items.length === 0 || isSubmitting) {
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
        paymentMode: PAYMENT_MODE_TO_API[values.paymentMode],
        guestId: activeGuestId ?? undefined,
        limitedOfferId: appliedOfferId ?? undefined,
        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone.trim(),
        streetAddress: values.streetAddress.trim(),
        city: values.city.trim(),
        addressNotes: values.addressNotes?.trim() || undefined,
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
        await saveGuestAddress(activeGuestId, {
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          streetAddress: values.streetAddress,
          city: values.city,
          addressNotes: values.addressNotes,
        });
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
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent
        variant="retro"
        showCloseButton={false}
        className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto border-4 border-ink bg-cyan p-4 text-ink sm:max-w-2xl sm:p-5"
      >
        <DialogTitle className="sr-only">Checkout</DialogTitle>
        <DialogDescription className="sr-only">
          Enter delivery details and choose payment mode.
        </DialogDescription>
        <div className="flex items-center justify-between gap-3 border-b-4 border-ink pb-3">
          <p className="font-press-start text-[11px] leading-4 text-ink">
            CHECKOUT
          </p>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            variant="retro"
            className="h-auto shrink-0 border-4 bg-white px-3 py-2 leading-4 disabled:opacity-50"
          >
            CLOSE
          </Button>
        </div>

        <form className="contents" onSubmit={handlePlaceOrder} noValidate>
          <div className="mt-4 border-4 border-ink bg-yellow p-4">
            <div className="grid grid-cols-1 gap-2">
              <Field>
                <FieldLabel
                  htmlFor="checkout-customer-name"
                  className="font-press-start text-[9px] leading-4 text-ink"
                >
                  NAME *
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="checkout-customer-name"
                    type="text"
                    {...form.register("customerName")}
                    disabled={isSubmitting}
                    variant="retro"
                    className="h-auto border-2 bg-white py-2 leading-4 disabled:opacity-50"
                  />
                  <FieldError
                    className="font-press-start text-[8px] leading-4 text-red-700"
                    errors={[form.formState.errors.customerName]}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="checkout-customer-phone"
                  className="font-press-start text-[9px] leading-4 text-ink"
                >
                  PHONE *
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="checkout-customer-phone"
                    type="tel"
                    {...form.register("customerPhone")}
                    disabled={isSubmitting}
                    variant="retro"
                    className="h-auto border-2 bg-white py-2 leading-4 disabled:opacity-50"
                  />
                  <FieldError
                    className="font-press-start text-[8px] leading-4 text-red-700"
                    errors={[form.formState.errors.customerPhone]}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="checkout-street-address"
                  className="font-press-start text-[9px] leading-4 text-ink"
                >
                  STREET ADDRESS *
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="checkout-street-address"
                    type="text"
                    {...form.register("streetAddress")}
                    disabled={isSubmitting}
                    variant="retro"
                    className="h-auto border-2 bg-white py-2 leading-4 disabled:opacity-50"
                  />
                  <FieldError
                    className="font-press-start text-[8px] leading-4 text-red-700"
                    errors={[form.formState.errors.streetAddress]}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="checkout-city"
                  className="font-press-start text-[9px] leading-4 text-ink"
                >
                  CITY *
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="checkout-city"
                    type="text"
                    {...form.register("city")}
                    disabled={isSubmitting}
                    variant="retro"
                    className="h-auto border-2 bg-white py-2 leading-4 disabled:opacity-50"
                  />
                  <FieldError
                    className="font-press-start text-[8px] leading-4 text-red-700"
                    errors={[form.formState.errors.city]}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="checkout-address-notes"
                  className="font-press-start text-[9px] leading-4 text-ink"
                >
                  ADDRESS NOTES
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="checkout-address-notes"
                    {...form.register("addressNotes")}
                    rows={2}
                    disabled={isSubmitting}
                    variant="retro"
                    className="resize-none border-2 border-ink bg-white disabled:opacity-50"
                  />
                  <FieldError
                    className="font-press-start text-[8px] leading-4 text-red-700"
                    errors={[form.formState.errors.addressNotes]}
                  />
                </FieldContent>
              </Field>

              {isLoadingGuestProfile ? (
                <p className="font-press-start text-[8px] leading-4 text-ink">
                  Loading saved address...
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 border-4 border-ink bg-yellow p-4">
            <Field orientation="vertical">
              <FieldLabel
                htmlFor="checkout-payment-mode"
                className="font-press-start text-[10px] leading-4 text-ink"
              >
                PAYMENT MODE (On Delivery Only)
              </FieldLabel>
              <FieldContent>
                <Controller
                  name="paymentMode"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        id="checkout-payment-mode"
                        variant="retro"
                        className="mt-3 h-auto w-full border-2 bg-white py-2 leading-4"
                      >
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                      <SelectContent variant="retro">
                        <SelectItem value="card-on-delivery">Card</SelectItem>
                        <SelectItem value="cash-on-delivery">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError
                  className="font-press-start text-[8px] leading-4 text-red-700"
                  errors={[form.formState.errors.paymentMode]}
                />
              </FieldContent>
            </Field>
          </div>
          <Button
            type="submit"
            disabled={items.length === 0 || isSubmitting}
            variant="retro"
            className="mt-4 h-auto w-full border-4 bg-magenta px-4 py-3 text-center text-white disabled:opacity-50"
          >
            {isSubmitting ? "PLACING ORDER..." : "PLACE ORDER"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
