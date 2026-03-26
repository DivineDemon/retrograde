"use client";

import { useState } from "react";
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

type AdminConfirmDeleteDialogProps = {
  itemLabel: string;
  onConfirm: () => Promise<void>;
  disabled?: boolean;
  triggerClassName?: string;
};

export function AdminConfirmDeleteDialog({
  itemLabel,
  onConfirm,
  disabled = false,
  triggerClassName,
}: AdminConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
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
            className={
              triggerClassName ??
              "h-auto border-2 border-destructive bg-destructive/20 px-2 py-1 text-[8px] leading-4 text-destructive"
            }
          >
            DELETE
          </Button>
        }
      />
      <DialogContent
        variant="retro"
        showCloseButton={false}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-press-start text-[10px] leading-5 text-ink">
            CONFIRM DELETE
          </DialogTitle>
          <DialogDescription className="font-press-start text-[8px] leading-4 text-ink/80">
            Are you sure you want to delete {itemLabel}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-0 bg-transparent">
          <Button
            type="button"
            variant="retro"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="border-2 bg-white px-3 py-2 font-press-start text-[8px] leading-4 text-ink"
          >
            CANCEL
          </Button>
          <Button
            type="button"
            variant="retro"
            onClick={() => void handleConfirm()}
            disabled={disabled || isSubmitting}
            className="border-2 border-destructive bg-destructive/20 px-3 py-2 font-press-start text-[8px] leading-4 text-destructive"
          >
            {isSubmitting ? "DELETING..." : "DELETE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
