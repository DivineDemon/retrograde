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
import type { AdminMenuItemCreateBody } from "@/lib/form-schemas";
import { formatMenuPriceYen } from "@/lib/utils";
import {
  MENU_CATEGORIES,
  type MenuItem,
  parseError,
} from "./admin-dashboard-types";

type AdminMenuSectionProps = {
  menu: UseFormReturn<AdminMenuItemCreateBody>;
  menuItems: MenuItem[];
  editingMenuId: string | null;
  setEditingMenuId: (id: string | null) => void;
  onSubmitMenu: (e?: BaseSyntheticEvent) => Promise<void>;
  isMutating: boolean;
  performAction: (action: () => Promise<void>) => Promise<void>;
  emptyMenuValues: () => AdminMenuItemCreateBody;
};

export function AdminMenuSection({
  menu,
  menuItems,
  editingMenuId,
  setEditingMenuId,
  onSubmitMenu,
  isMutating,
  performAction,
  emptyMenuValues,
}: AdminMenuSectionProps) {
  return (
    <section className="grid gap-3 border-4 border-ink bg-white p-4 shadow-retro-sm">
      <h2 className="font-press-start text-[11px] leading-5 text-ink">MENU</h2>
      <form
        className="grid gap-2 md:grid-cols-2"
        onSubmit={(e) => void onSubmitMenu(e)}
        noValidate
      >
        <Field>
          <FieldLabel className="sr-only">Slug</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Slug"
              {...menu.register("slug")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[menu.formState.errors.slug]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Title</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Title"
              {...menu.register("title")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[menu.formState.errors.title]}
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
              {...menu.register("priceMinor", { valueAsNumber: true })}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[menu.formState.errors.priceMinor]}
            />
          </FieldContent>
        </Field>
        <Controller
          name="category"
          control={menu.control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="sr-only">Category</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange}>
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
                  errors={[menu.formState.errors.category]}
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
              {...menu.register("cardColor")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[menu.formState.errors.cardColor]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Title color</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Title color (optional)"
              {...menu.register("titleColor")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[menu.formState.errors.titleColor]}
            />
          </FieldContent>
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel className="sr-only">Description</FieldLabel>
          <FieldContent>
            <Textarea
              placeholder="Description"
              {...menu.register("description")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[menu.formState.errors.description]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldContent>
            <div className="flex items-center gap-2">
              <input
                id="admin-menu-featured"
                type="checkbox"
                {...menu.register("isFeatured")}
              />
              <Label
                htmlFor="admin-menu-featured"
                className="cursor-pointer font-press-start text-[9px] leading-4 text-ink"
              >
                FEATURED
              </Label>
            </div>
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[menu.formState.errors.isFeatured]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldContent>
            <div className="flex items-center gap-2">
              <input
                id="admin-menu-most-popular"
                type="checkbox"
                {...menu.register("isMostPopular")}
              />
              <Label
                htmlFor="admin-menu-most-popular"
                className="cursor-pointer font-press-start text-[9px] leading-4 text-ink"
              >
                MOST POPULAR
              </Label>
            </div>
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[menu.formState.errors.isMostPopular]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldContent>
            <div className="flex items-center gap-2">
              <input
                id="admin-menu-active"
                type="checkbox"
                {...menu.register("isActive")}
              />
              <Label
                htmlFor="admin-menu-active"
                className="cursor-pointer font-press-start text-[9px] leading-4 text-ink"
              >
                ACTIVE
              </Label>
            </div>
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[menu.formState.errors.isActive]}
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
            {editingMenuId ? "UPDATE MENU ITEM" : "CREATE MENU ITEM"}
          </Button>
          {editingMenuId ? (
            <Button
              type="button"
              variant="retro"
              onClick={() => {
                setEditingMenuId(null);
                menu.reset(emptyMenuValues());
              }}
              className="border-4 bg-cyan px-3 py-2 font-press-start text-[9px] leading-4 text-ink"
            >
              CANCEL EDIT
            </Button>
          ) : null}
        </div>
      </form>

      <div className="space-y-2">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="grid gap-2 border-2 border-ink bg-canvas p-2 md:grid-cols-[1fr_auto]"
          >
            <div>
              <p className="font-press-start text-[9px] leading-4 text-ink">
                {item.title} ({item.slug}) -{" "}
                {formatMenuPriceYen(item.priceMinor)}
              </p>
              <p className="font-press-start text-[8px] leading-4 text-ink/70">
                {item.category} | {item.isActive ? "ACTIVE" : "INACTIVE"} |{" "}
                {item.isFeatured ? "FEATURED" : "NOT FEATURED"} |{" "}
                {item.isMostPopular ? "MOST POPULAR" : "REGULAR"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="retro"
                onClick={() => {
                  setEditingMenuId(item.id);
                  menu.reset({
                    slug: item.slug,
                    title: item.title,
                    description: item.description,
                    priceMinor: item.priceMinor,
                    category: item.category,
                    cardColor: item.cardColor ?? "",
                    titleColor: item.titleColor ?? "",
                    isFeatured: item.isFeatured,
                    isMostPopular: item.isMostPopular,
                    isActive: item.isActive,
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
                      `/api/admin/menu/${encodeURIComponent(item.id)}`,
                      { method: "DELETE", credentials: "include" },
                    );
                    if (!response.ok) {
                      throw new Error(
                        await parseError(
                          response,
                          "Failed to delete menu item.",
                        ),
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
      </div>
    </section>
  );
}
