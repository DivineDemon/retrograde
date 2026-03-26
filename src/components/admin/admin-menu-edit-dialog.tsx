"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useEffect, useState } from "react";
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
  type AdminMenuItemCreateBody,
  adminMenuItemUpdateBody,
} from "@/lib/form-schemas";
import {
  MENU_CATEGORIES,
  type MenuItem,
  parseError,
} from "./admin-dashboard-types";

const normalizeMenuCategory = (category: string): string => {
  const normalized = category
    .trim()
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
  return MENU_CATEGORIES.includes(
    normalized as (typeof MENU_CATEGORIES)[number],
  )
    ? normalized
    : "SIGNATURE";
};

type AdminMenuEditDialogProps = {
  menuItemId: string;
  triggerLabel?: string;
  disabled?: boolean;
  performAction: (action: () => Promise<void>) => Promise<void>;
};

export function AdminMenuEditDialog({
  menuItemId,
  triggerLabel = "EDIT",
  disabled = false,
  performAction,
}: AdminMenuEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AdminMenuItemCreateBody>({
    resolver: typeboxResolver(adminMenuItemUpdateBody),
    defaultValues: {
      slug: "",
      title: "",
      description: "",
      priceMinor: 0,
      category: "SIGNATURE",
      cardColor: "",
      titleColor: "",
      isFeatured: false,
      isMostPopular: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadMenuItem = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/admin/menu/${encodeURIComponent(menuItemId)}`,
          { credentials: "include" },
        );
        if (!response.ok) {
          throw new Error(
            await parseError(response, "Failed to load menu item."),
          );
        }
        const item = (await response.json()) as MenuItem;
        if (cancelled) return;
        form.reset({
          slug: item.slug,
          title: item.title,
          description: item.description ?? "",
          priceMinor: item.priceMinor,
          category: normalizeMenuCategory(item.category),
          cardColor: item.cardColor ?? "",
          titleColor: item.titleColor ?? "",
          isFeatured: item.isFeatured,
          isMostPopular: item.isMostPopular,
          isActive: item.isActive,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load menu item.";
        toast.error(message);
        setOpen(false);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadMenuItem();
    return () => {
      cancelled = true;
    };
  }, [form, menuItemId, open]);

  const onSubmit = form.handleSubmit(async (values) => {
    let updated = false;
    await performAction(async () => {
      const response = await fetch(
        `/api/admin/menu/${encodeURIComponent(menuItemId)}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: values.slug.trim(),
            title: values.title.trim(),
            description: values.description.trim(),
            priceMinor: values.priceMinor,
            category: values.category,
            cardColor: values.cardColor?.trim() || undefined,
            titleColor: values.titleColor?.trim() || undefined,
            isFeatured: values.isFeatured ?? false,
            isMostPopular: values.isMostPopular ?? false,
            isActive: values.isActive ?? true,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await parseError(response, "Failed to update menu item."),
        );
      }
      updated = true;
    });

    if (updated) {
      setOpen(false);
    }
  });

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
            EDIT MENU ITEM
          </DialogTitle>
          <DialogDescription className="font-press-start text-[8px] leading-4 text-ink/80">
            Update menu item details and save changes.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-2 md:grid-cols-2"
          onSubmit={(e) => void onSubmit(e)}
        >
          <Field>
            <FieldLabel className="sr-only">Slug</FieldLabel>
            <FieldContent>
              <Input
                placeholder="Slug"
                {...form.register("slug")}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.slug]}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel className="sr-only">Title</FieldLabel>
            <FieldContent>
              <Input
                placeholder="Title"
                {...form.register("title")}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.title]}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel className="sr-only">Price (minor)</FieldLabel>
            <FieldContent>
              <Input
                placeholder="Price (minor)"
                type="number"
                min={0}
                {...form.register("priceMinor", { valueAsNumber: true })}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.priceMinor]}
              />
            </FieldContent>
          </Field>
          <Controller
            name="category"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="sr-only">Category</FieldLabel>
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
                      {MENU_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError
                    className="font-press-start text-[8px] leading-4 text-red-700"
                    errors={[form.formState.errors.category]}
                  />
                </FieldContent>
              </Field>
            )}
          />
          <Field>
            <FieldLabel className="sr-only">Card color</FieldLabel>
            <FieldContent>
              <Input
                placeholder="Card color (optional)"
                {...form.register("cardColor")}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.cardColor]}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel className="sr-only">Title color</FieldLabel>
            <FieldContent>
              <Input
                placeholder="Title color (optional)"
                {...form.register("titleColor")}
                variant="retro"
                className="font-press-start text-[9px] leading-4"
                disabled={isLoading}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.titleColor]}
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
          <Field>
            <FieldContent>
              <div className="flex items-center gap-2">
                <input
                  id={`admin-menu-edit-featured-${menuItemId}`}
                  type="checkbox"
                  {...form.register("isFeatured")}
                  disabled={isLoading}
                />
                <Label
                  htmlFor={`admin-menu-edit-featured-${menuItemId}`}
                  className="cursor-pointer font-press-start text-[9px] leading-4 text-ink"
                >
                  FEATURED
                </Label>
              </div>
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.isFeatured]}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <div className="flex items-center gap-2">
                <input
                  id={`admin-menu-edit-most-popular-${menuItemId}`}
                  type="checkbox"
                  {...form.register("isMostPopular")}
                  disabled={isLoading}
                />
                <Label
                  htmlFor={`admin-menu-edit-most-popular-${menuItemId}`}
                  className="cursor-pointer font-press-start text-[9px] leading-4 text-ink"
                >
                  MOST POPULAR
                </Label>
              </div>
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.isMostPopular]}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <div className="flex items-center gap-2">
                <input
                  id={`admin-menu-edit-active-${menuItemId}`}
                  type="checkbox"
                  {...form.register("isActive")}
                  disabled={isLoading}
                />
                <Label
                  htmlFor={`admin-menu-edit-active-${menuItemId}`}
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
              disabled={disabled || isLoading || form.formState.isSubmitting}
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
