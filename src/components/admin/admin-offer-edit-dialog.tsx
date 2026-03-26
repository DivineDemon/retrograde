"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import Image from "next/image";
import { type ChangeEvent, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  type AdminOfferFormDraft,
  adminOfferFormDraftBody,
} from "@/lib/form-schemas";
import { uploadImageToImgbb } from "@/lib/utils";
import {
  emptyOfferDraftValues,
  type Offer,
  parseError,
} from "./admin-dashboard-types";

const toDateTimeLocalValue = (value: string | null | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

type AdminOfferEditDialogProps = {
  offerId: string;
  triggerLabel?: string;
  disabled?: boolean;
  performAction: (action: () => Promise<void>) => Promise<void>;
};

export function AdminOfferEditDialog({
  offerId,
  triggerLabel = "EDIT",
  disabled = false,
  performAction,
}: AdminOfferEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const form = useForm<AdminOfferFormDraft>({
    resolver: typeboxResolver(adminOfferFormDraftBody),
    defaultValues: emptyOfferDraftValues(),
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadOffer = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/admin/offers/${encodeURIComponent(offerId)}`,
          { credentials: "include" },
        );
        if (!response.ok) {
          throw new Error(await parseError(response, "Failed to load offer."));
        }
        const offer = (await response.json()) as Offer;
        if (cancelled) return;
        form.reset({
          name: offer.name,
          description: offer.description ?? "",
          image: offer.image ?? "",
          durationMode: offer.durationMode,
          availabilityStart: toDateTimeLocalValue(offer.availabilityStart),
          availabilityEnd: toDateTimeLocalValue(offer.availabilityEnd),
          maxRedemptions:
            offer.maxRedemptions === null ? "" : String(offer.maxRedemptions),
          isActive: offer.isActive,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          items: (offer.items ?? [])
            .map((item) => `${item.menuItemId}:${item.quantity}`)
            .join(","),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load offer.";
        toast.error(message);
        setOpen(false);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadOffer();
    return () => {
      cancelled = true;
    };
  }, [form, offerId, open]);

  const onSubmit = form.handleSubmit(async (values) => {
    let updated = false;
    await performAction(async () => {
      const rawItems = values.items
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const items = rawItems.map((entry) => {
        const [menuItemId, quantityRaw] = entry.split(":");
        return {
          menuItemId: (menuItemId ?? "").trim(),
          quantity: Number(quantityRaw ?? "1"),
        };
      });

      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        image: values.image?.trim() || undefined,
        durationMode: values.durationMode,
        availabilityStart: new Date(values.availabilityStart).toISOString(),
        availabilityEnd: values.availabilityEnd?.trim()
          ? new Date(values.availabilityEnd).toISOString()
          : undefined,
        maxRedemptions:
          values.durationMode === "CAPACITY" && values.maxRedemptions?.trim()
            ? Number(values.maxRedemptions)
            : undefined,
        isActive: values.isActive,
        discountType: values.discountType,
        discountValue: values.discountValue,
        items,
      };

      const response = await fetch(
        `/api/admin/offers/${encodeURIComponent(offerId)}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error(await parseError(response, "Failed to save offer."));
      }
      updated = true;
    });

    if (updated) {
      setOpen(false);
    }
  });

  const imagePreviewUrl = form.watch("image")?.trim() ?? "";

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

      form.setValue("image", uploadedUrl, {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="retro"
            disabled={disabled}
            className="h-auto border-2 bg-white px-2 py-1 text-[8px] leading-4 text-ink"
          >
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent
        variant="retro"
        showCloseButton={false}
        className="max-h-[85vh] max-w-2xl overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-press-start text-[10px] leading-5 text-ink">
            EDIT LIMITED OFFER
          </DialogTitle>
          <DialogDescription className="font-press-start text-[8px] leading-4 text-ink/80">
            Update offer details and save changes.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-2 md:grid-cols-2"
          onSubmit={(e) => void onSubmit(e)}
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
                disabled={isLoading || isUploadingImage}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.image]}
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
                {...form.register("name")}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.name]}
              />
            </FieldContent>
          </Field>
          <Controller
            name="durationMode"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="sr-only">Duration mode</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
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
                    errors={[form.formState.errors.durationMode]}
                  />
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            name="discountType"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="sr-only">Discount type</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
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
                    errors={[form.formState.errors.discountType]}
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
                {...form.register("discountValue", { valueAsNumber: true })}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.discountValue]}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel className="sr-only">Availability start</FieldLabel>
            <FieldContent>
              <Input
                type="datetime-local"
                {...form.register("availabilityStart")}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.availabilityStart]}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel className="sr-only">Availability end</FieldLabel>
            <FieldContent>
              <Input
                type="datetime-local"
                {...form.register("availabilityEnd")}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.availabilityEnd]}
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
                {...form.register("maxRedemptions")}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.maxRedemptions]}
              />
            </FieldContent>
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel className="sr-only">Description</FieldLabel>
            <FieldContent>
              <Textarea
                placeholder="Description"
                {...form.register("description")}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.description]}
              />
            </FieldContent>
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel className="sr-only">Offer items</FieldLabel>
            <FieldContent>
              <Textarea
                placeholder="Offer items as menuItemId:qty comma separated"
                {...form.register("items")}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.items]}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <div className="flex items-center gap-2">
                <input
                  id={`admin-offer-edit-active-${offerId}`}
                  type="checkbox"
                  {...form.register("isActive")}
                  disabled={isLoading}
                />
                <Label
                  htmlFor={`admin-offer-edit-active-${offerId}`}
                  className="cursor-pointer font-press-start text-[9px] leading-4 text-ink"
                >
                  ACTIVE
                </Label>
              </div>
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.isActive]}
              />
            </FieldContent>
          </Field>
          <DialogFooter className="md:col-span-2 mx-0 mb-0 border-0 bg-transparent p-0 pt-2">
            <Button
              type="button"
              variant="retro"
              onClick={() => setOpen(false)}
              className="border-2 bg-white px-3 py-2 font-press-start text-[8px] leading-4 text-ink"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="retro"
              disabled={
                disabled ||
                isLoading ||
                isUploadingImage ||
                form.formState.isSubmitting
              }
              className="border-2 bg-yellow px-3 py-2 font-press-start text-[8px] leading-4 text-ink disabled:opacity-60"
            >
              {form.formState.isSubmitting ? "SAVING..." : "SAVE CHANGES"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
