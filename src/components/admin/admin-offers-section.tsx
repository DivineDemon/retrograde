"use client";

import type { BaseSyntheticEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminOfferFormDraft } from "@/lib/form-schemas";
import { type Offer, parseError } from "./admin-dashboard-types";

type AdminOffersSectionProps = {
  offerDraft: UseFormReturn<AdminOfferFormDraft>;
  offers: Offer[];
  activeOfferId: string | null;
  editingOfferId: string | null;
  setEditingOfferId: (id: string | null) => void;
  onSubmitOffer: (e?: BaseSyntheticEvent) => Promise<void>;
  isMutating: boolean;
  performAction: (action: () => Promise<void>) => Promise<void>;
  emptyOfferDraftValues: () => AdminOfferFormDraft;
};

export function AdminOffersSection({
  offerDraft,
  offers,
  activeOfferId,
  editingOfferId,
  setEditingOfferId,
  onSubmitOffer,
  isMutating,
  performAction,
  emptyOfferDraftValues,
}: AdminOffersSectionProps) {
  return (
    <section className="grid gap-3 border-4 border-ink bg-white p-4 shadow-retro-sm">
      <h2 className="font-press-start text-[11px] leading-5 text-ink">
        LIMITED OFFERS
      </h2>
      <form
        className="grid gap-2 md:grid-cols-2"
        onSubmit={(e) => void onSubmitOffer(e)}
        noValidate
      >
        <Field>
          <FieldLabel className="sr-only">Name</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Name"
              {...offerDraft.register("name")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[offerDraft.formState.errors.name]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Image URL</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Image URL (optional)"
              {...offerDraft.register("image")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[offerDraft.formState.errors.image]}
            />
          </FieldContent>
        </Field>
        <Controller
          name="durationMode"
          control={offerDraft.control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="sr-only">Duration mode</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    variant="retro"
                    className="h-auto w-full font-press-start text-[9px] leading-4"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent variant="retro">
                    <SelectItem value="TIME">TIME</SelectItem>
                    <SelectItem value="CAPACITY">CAPACITY</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError
                  className="font-press-start text-[8px] leading-4 text-red-700"
                  errors={[offerDraft.formState.errors.durationMode]}
                />
              </FieldContent>
            </Field>
          )}
        />
        <Controller
          name="discountType"
          control={offerDraft.control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="sr-only">Discount type</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    variant="retro"
                    className="h-auto w-full font-press-start text-[9px] leading-4"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent variant="retro">
                    <SelectItem value="PERCENTAGE">PERCENTAGE</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">FIXED_AMOUNT</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError
                  className="font-press-start text-[8px] leading-4 text-red-700"
                  errors={[offerDraft.formState.errors.discountType]}
                />
              </FieldContent>
            </Field>
          )}
        />
        <Field>
          <FieldLabel className="sr-only">Discount value</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              min={0}
              placeholder="Discount value"
              {...offerDraft.register("discountValue", {
                valueAsNumber: true,
              })}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[offerDraft.formState.errors.discountValue]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Availability start</FieldLabel>
          <FieldContent>
            <Input
              type="datetime-local"
              {...offerDraft.register("availabilityStart")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[offerDraft.formState.errors.availabilityStart]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Availability end</FieldLabel>
          <FieldContent>
            <Input
              type="datetime-local"
              {...offerDraft.register("availabilityEnd")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[offerDraft.formState.errors.availabilityEnd]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Max redemptions</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              min={1}
              placeholder="Max redemptions (capacity mode)"
              {...offerDraft.register("maxRedemptions")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[offerDraft.formState.errors.maxRedemptions]}
            />
          </FieldContent>
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel className="sr-only">Description</FieldLabel>
          <FieldContent>
            <Textarea
              placeholder="Description"
              {...offerDraft.register("description")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[offerDraft.formState.errors.description]}
            />
          </FieldContent>
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel className="sr-only">Offer items</FieldLabel>
          <FieldContent>
            <Textarea
              placeholder="Offer items as menuItemId:qty comma separated"
              {...offerDraft.register("items")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[offerDraft.formState.errors.items]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldContent>
            <div className="flex items-center gap-2">
              <input
                id="admin-offer-active"
                type="checkbox"
                {...offerDraft.register("isActive")}
              />
              <Label
                htmlFor="admin-offer-active"
                className="cursor-pointer font-press-start text-[9px] leading-4 text-ink"
              >
                ACTIVE
              </Label>
            </div>
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[offerDraft.formState.errors.isActive]}
            />
          </FieldContent>
        </Field>
        <div className="md:col-span-2 flex gap-2">
          <Button
            type="submit"
            variant="retro"
            disabled={isMutating}
            className="border-4 bg-yellow px-3 py-2 font-press-start text-[9px] leading-4 text-ink disabled:opacity-60"
          >
            {editingOfferId ? "UPDATE OFFER" : "CREATE OFFER"}
          </Button>
          {editingOfferId ? (
            <Button
              type="button"
              variant="retro"
              onClick={() => {
                setEditingOfferId(null);
                offerDraft.reset(emptyOfferDraftValues());
              }}
              className="border-4 bg-cyan px-3 py-2 font-press-start text-[9px] leading-4 text-ink"
            >
              CANCEL EDIT
            </Button>
          ) : null}
        </div>
      </form>

      <div className="space-y-2">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="grid gap-2 border-2 border-ink bg-canvas p-2 md:grid-cols-[1fr_auto]"
          >
            <div>
              <p className="font-press-start text-[9px] leading-4 text-ink">
                {offer.name} ({offer.discountType}:{offer.discountValue}) -{" "}
                {offer.isActive ? "ACTIVE" : "INACTIVE"}
              </p>
              <p className="font-press-start text-[8px] leading-4 text-ink/70">
                Mode: {offer.durationMode} | Used: {offer.redemptionsUsed} /{" "}
                {offer.maxRedemptions ?? "N/A"} | Items: {offer.items.length}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="retro"
                onClick={() => {
                  setEditingOfferId(offer.id);
                  offerDraft.reset({
                    name: offer.name,
                    description: offer.description,
                    image: offer.image ?? "",
                    durationMode: offer.durationMode,
                    availabilityStart: new Date(offer.availabilityStart)
                      .toISOString()
                      .slice(0, 16),
                    availabilityEnd: offer.availabilityEnd
                      ? new Date(offer.availabilityEnd)
                          .toISOString()
                          .slice(0, 16)
                      : "",
                    maxRedemptions: offer.maxRedemptions
                      ? String(offer.maxRedemptions)
                      : "",
                    isActive: offer.isActive,
                    discountType: offer.discountType,
                    discountValue: offer.discountValue,
                    items: offer.items
                      .map((item) => `${item.menuItemId}:${item.quantity}`)
                      .join(","),
                  });
                }}
                className="h-auto border-2 bg-white px-2 py-1 text-[8px] leading-4 text-ink"
              >
                EDIT
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  void performAction(async () => {
                    const response = await fetch(
                      `/api/admin/offers/${encodeURIComponent(offer.id)}`,
                      { method: "DELETE", credentials: "include" },
                    );
                    if (!response.ok) {
                      throw new Error(
                        await parseError(response, "Failed to delete offer."),
                      );
                    }
                  })
                }
                className="h-auto border-2 border-ink bg-red-100 px-2 py-1 text-[8px] leading-4 text-red-800"
              >
                DELETE
              </Button>
            </div>
          </div>
        ))}
        <p className="font-press-start text-[8px] leading-4 text-ink/70">
          Active offer: {activeOfferId ?? "none"}
        </p>
      </div>
    </section>
  );
}
