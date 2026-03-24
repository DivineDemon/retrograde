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
import type {
  AdminStatsAdjustPatchBody,
  AdminStatsPutBody,
} from "@/lib/form-schemas";
import type { Stats } from "./admin-dashboard-types";

type AdminStatsSectionProps = {
  stats: Stats | null;
  statsPut: UseFormReturn<AdminStatsPutBody>;
  statsAdjust: UseFormReturn<AdminStatsAdjustPatchBody>;
  onSubmitStatsPut: (e?: BaseSyntheticEvent) => Promise<void>;
  onSubmitStatsAdjust: (e?: BaseSyntheticEvent) => Promise<void>;
  isMutating: boolean;
};

export function AdminStatsSection({
  stats,
  statsPut,
  statsAdjust,
  onSubmitStatsPut,
  onSubmitStatsAdjust,
  isMutating,
}: AdminStatsSectionProps) {
  return (
    <section className="grid gap-3 border-4 border-ink bg-white p-4 shadow-retro-sm">
      <h2 className="font-press-start text-[11px] leading-5 text-ink">STATS</h2>
      {stats ? (
        <p className="font-press-start text-[8px] leading-4 text-ink/70">
          Current: cups {stats.dailyCups}, vinyl {stats.vinylSpins}, arcade{" "}
          {stats.arcade}, combo {stats.comboRate}
        </p>
      ) : null}
      <form
        className="grid gap-2 md:grid-cols-4"
        onSubmit={(e) => void onSubmitStatsPut(e)}
        noValidate
      >
        <Field>
          <FieldLabel className="sr-only">Daily cups</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              {...statsPut.register("dailyCups", { valueAsNumber: true })}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[statsPut.formState.errors.dailyCups]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Vinyl spins</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              {...statsPut.register("vinylSpins", { valueAsNumber: true })}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[statsPut.formState.errors.vinylSpins]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Arcade</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              {...statsPut.register("arcade", { valueAsNumber: true })}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[statsPut.formState.errors.arcade]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Combo rate</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              {...statsPut.register("comboRate", { valueAsNumber: true })}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[statsPut.formState.errors.comboRate]}
            />
          </FieldContent>
        </Field>
        <Button
          type="submit"
          variant="retro"
          disabled={isMutating}
          className="md:col-span-4 border-4 bg-yellow px-3 py-2 font-press-start text-[9px] leading-4 text-ink disabled:opacity-60"
        >
          OVERWRITE STATS
        </Button>
      </form>

      <form
        className="grid gap-2 md:grid-cols-4"
        onSubmit={(e) => void onSubmitStatsAdjust(e)}
        noValidate
      >
        <Field>
          <FieldLabel className="sr-only">Daily cups delta</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              {...statsAdjust.register("dailyCupsDelta", {
                valueAsNumber: true,
              })}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[statsAdjust.formState.errors.dailyCupsDelta]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Vinyl spins delta</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              {...statsAdjust.register("vinylSpinsDelta", {
                valueAsNumber: true,
              })}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[statsAdjust.formState.errors.vinylSpinsDelta]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Arcade delta</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              {...statsAdjust.register("arcadeDelta", {
                valueAsNumber: true,
              })}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[statsAdjust.formState.errors.arcadeDelta]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="sr-only">Combo rate delta</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              {...statsAdjust.register("comboRateDelta", {
                valueAsNumber: true,
              })}
              variant="retro"
              className="font-press-start text-[9px] leading-4"
            />
            <FieldError
              className="font-press-start text-[8px] leading-4 text-red-700"
              errors={[statsAdjust.formState.errors.comboRateDelta]}
            />
          </FieldContent>
        </Field>
        <Button
          type="submit"
          variant="retro"
          disabled={isMutating}
          className="md:col-span-4 border-4 bg-cyan px-3 py-2 font-press-start text-[9px] leading-4 text-ink disabled:opacity-60"
        >
          APPLY DELTA
        </Button>
      </form>
    </section>
  );
}
