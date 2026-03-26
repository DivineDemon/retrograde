"use client";

import Image from "next/image";
import { type BaseSyntheticEvent, type ChangeEvent, useState } from "react";
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
import { toast } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import type { AdminOfferFormDraft } from "@/lib/form-schemas";
import { uploadImageToImgbb } from "@/lib/utils";
import { AdminConfirmDeleteDialog } from "./admin-confirm-delete-dialog";
import { type Offer, parseError } from "./admin-dashboard-types";
import { AdminOfferEditDialog } from "./admin-offer-edit-dialog";

type AdminOffersSectionProps = {
  offerDraft: UseFormReturn<AdminOfferFormDraft>;
  offers: Offer[];
  activeOfferId: string | null;
  onSubmitOffer: (e?: BaseSyntheticEvent) => Promise<void>;
  isMutating: boolean;
  performAction: (action: () => Promise<void>) => Promise<void>;
};

export function AdminOffersSection({
  offerDraft,
  offers,
  activeOfferId,
  onSubmitOffer,
  isMutating,
  performAction,
}: AdminOffersSectionProps) {
  const imagePreviewUrl = offerDraft.watch("image")?.trim() ?? "";
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG and JPG images are allowed.");
      event.target.value = "";
      return;
    }

    setIsUploadingImage(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result !== "string") {
            reject(new Error("Could not read selected image."));
            return;
          }
          const [, encoded = ""] = result.split(",");
          resolve(encoded);
        };
        reader.onerror = () =>
          reject(new Error("Could not read selected image."));
        reader.readAsDataURL(file);
      });

      const response = await uploadImageToImgbb({ imageBase64: base64 });
      const uploadedUrl = response.data.url.trim();

      offerDraft.setValue("image", uploadedUrl, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      toast.success("Image uploaded.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image upload failed.";
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

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
        <Field className="md:col-span-2">
          <FieldLabel className="font-press-start text-[8px] leading-4 text-ink">
            Offer image (PNG/JPG)
          </FieldLabel>
          <FieldContent>
            <Input
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              multiple={false}
              variant="retro"
              className="font-press-start file:border-r p-0 file:h-9 file:pr-2 text-[9px] leading-4 file:mr-4 file:font-press-start file:text-[8px]"
              onChange={(event) => void handleImageUpload(event)}
              disabled={isMutating || isUploadingImage}
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[offerDraft.formState.errors.image]}
            />
          </FieldContent>
        </Field>
        {imagePreviewUrl ? (
          <div className="md:col-span-2 w-full flex flex-col items-center justify-center">
            <p className="mb-1 font-press-start text-[8px] leading-4 text-ink/80">
              Image preview
            </p>
            <Image
              src={imagePreviewUrl}
              alt="Offer preview"
              width={96}
              height={96}
              unoptimized
              className="h-24 w-24 border-2 border-ink object-cover"
            />
          </div>
        ) : null}
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
            disabled={isMutating || isUploadingImage}
            className="border-4 bg-yellow px-3 py-2 font-press-start text-[9px] leading-4 text-ink disabled:opacity-60"
          >
            CREATE OFFER
          </Button>
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
              <AdminOfferEditDialog
                offerId={offer.id}
                disabled={isMutating}
                performAction={performAction}
              />
              <AdminConfirmDeleteDialog
                itemLabel={`offer "${offer.name}"`}
                disabled={isMutating}
                onConfirm={() =>
                  performAction(async () => {
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
              />
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
