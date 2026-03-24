"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OfferLineItem } from "../../lib/cart-store";

type OfferProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
  image?: string | null;
  name?: string;
  items?: OfferLineItem[];
};

export const Offer = ({
  open,
  onOpenChange,
  onAccept,
  image,
  name,
  items,
}: OfferProps) => {
  const handleAccept = () => {
    if (onAccept) {
      onAccept();
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="retro"
        showCloseButton={false}
        overlayClassName="bg-ink/70"
        className="md:max-w-xl lg:max-w-3xl gap-0 border-0 bg-transparent p-0 shadow-none ring-0"
      >
        <DialogTitle className="sr-only">Limited drop poster</DialogTitle>
        <DialogDescription className="sr-only">
          {name ? `${name} promotional offer` : "Limited promotional offer"}
        </DialogDescription>
        <div className="relative w-full bg-canvas shadow-retro-md shadow-white">
          <Button
            type="button"
            variant="retro"
            size="icon-xs"
            className="absolute -left-3 -top-3 size-6 rounded-none border-4 border-ink bg-white p-0 font-press-start text-[10px] leading-none text-ink"
            onClick={() => onOpenChange(false)}
            aria-label="Close popup"
          >
            <X className="size-full" />
          </Button>
          <Image
            src={image ?? "/landing/limited-drop.png"}
            alt={name ? `${name} poster` : "Limited drop promo poster"}
            width={800}
            height={800}
            className="h-auto w-full border-4 border-ink"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 flex w-full items-center justify-between bg-ink/50 p-2.5 md:p-5 text-white">
            <div className="flex w-full flex-1 flex-col items-center justify-between gap-1">
              <p className="w-full text-left font-press-start text-[10px] md:text-xs mb-1">
                {name ?? "LIMITED DROP"}
              </p>
              {items && items.length > 0
                ? items.map((item) => (
                    <p
                      key={item.menuItemId}
                      className="w-full text-left font-press-start text-[10px] md:text-xs"
                    >
                      - {item.quantity} {item.title}
                    </p>
                  ))
                : null}
            </div>
            <Button
              size="sm"
              type="button"
              variant="retro"
              onClick={handleAccept}
              className="h-auto ml-auto md:ml-0 w-fit cursor-pointer border-4 border-ink bg-yellow py-2 font-press-start text-[11px] leading-4 text-ink sm:text-[12px]"
            >
              UNLOCK
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
