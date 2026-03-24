import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"textarea"> & {
  variant?: "default" | "retro";
}) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant}
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        "data-[variant=retro]:min-h-20 data-[variant=retro]:rounded-none data-[variant=retro]:border-[3px] data-[variant=retro]:border-ink data-[variant=retro]:bg-background data-[variant=retro]:px-3 data-[variant=retro]:py-2 data-[variant=retro]:font-press-start data-[variant=retro]:text-[10px]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
