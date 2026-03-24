"use client";

import type { BaseSyntheticEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminSiteContentPutBody } from "@/lib/form-schemas";

type AdminSiteSectionProps = {
  siteContent: UseFormReturn<AdminSiteContentPutBody>;
  onSubmitSiteContent: (e?: BaseSyntheticEvent) => Promise<void>;
  isMutating: boolean;
};

export function AdminSiteSection({
  siteContent,
  onSubmitSiteContent,
  isMutating,
}: AdminSiteSectionProps) {
  return (
    <section className="grid gap-3 border-4 border-ink bg-white p-4 shadow-retro-sm">
      <h2 className="font-press-start text-[11px] leading-5 text-ink">
        LOCATION / STORY CONTENT
      </h2>
      <form
        className="grid gap-2 md:grid-cols-2"
        onSubmit={(e) => void onSubmitSiteContent(e)}
        noValidate
      >
        <Field>
          <FieldLabel className="sr-only">Manga session label</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Manga session label"
              {...siteContent.register("mangaSessionLabel")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[siteContent.formState.errors.mangaSessionLabel]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Manga session headline</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Manga session headline"
              {...siteContent.register("mangaSessionHeadline")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[siteContent.formState.errors.mangaSessionHeadline]}
            />
          </FieldContent>
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel className="sr-only">Manga session description</FieldLabel>
          <FieldContent>
            <Textarea
              placeholder="Manga session description"
              {...siteContent.register("mangaSessionDescription")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[siteContent.formState.errors.mangaSessionDescription]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Location label</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Location label"
              {...siteContent.register("locationLabel")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[siteContent.formState.errors.locationLabel]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Location address</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Location address"
              {...siteContent.register("locationAddress")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[siteContent.formState.errors.locationAddress]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Hours line one</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Hours line one"
              {...siteContent.register("hoursLineOne")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[siteContent.formState.errors.hoursLineOne]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Hours line two</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Hours line two"
              {...siteContent.register("hoursLineTwo")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[siteContent.formState.errors.hoursLineTwo]}
            />
          </FieldContent>
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel className="sr-only">Directions URL</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Directions URL"
              {...siteContent.register("directionsUrl")}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[siteContent.formState.errors.directionsUrl]}
            />
          </FieldContent>
        </Field>
        <Button
          type="submit"
          variant="retro"
          disabled={isMutating}
          className="md:col-span-2 border-4 bg-yellow px-3 py-2 font-press-start text-[9px] leading-4 text-ink disabled:opacity-60"
        >
          SAVE SITE CONTENT
        </Button>
      </form>
    </section>
  );
}
