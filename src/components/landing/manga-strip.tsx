"use client";

import Image from "next/image";
import { useState } from "react";
import {
  type AppliedOffer,
  type OfferLineItem,
  useCart,
} from "../../lib/cart-store";
import { Offer } from "../global/offer";
import MaxWidthWrapper from "../max-width-wrapper";
import { Button } from "../ui/button";

type MangaStripProps = {
  offerId?: string;
  offerName?: string;
  offerImage?: string | null;
  offerDescription?: string;
  offerItems?: OfferLineItem[];
  discountType?: string;
  discountValue?: number;
};

export const MangaStrip = ({
  offerId,
  offerName,
  offerImage,
  offerDescription,
  offerItems,
  discountType,
  discountValue,
}: MangaStripProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { applyOffer } = useCart();

  const handleAcceptOffer = () => {
    if (!offerId || !offerItems?.length) {
      setIsOpen(false);
      return;
    }
    const resolvedDiscountType =
      discountType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE";
    const offerMeta: AppliedOffer = {
      id: offerId,
      name: offerName ?? "LIMITED DROP",
      description: offerDescription ?? "Unlock the active offer bundle.",
      items: offerItems,
      discountType: resolvedDiscountType,
      discountValue:
        typeof discountValue === "number" && Number.isFinite(discountValue)
          ? Math.max(0, Math.floor(discountValue))
          : 0,
    };
    applyOffer(offerMeta);
    setIsOpen(false);
  };

  return (
    <MaxWidthWrapper className="p-4 sm:p-6 lg:p-8">
      <section className="relative z-10 flex w-full flex-col gap-4 md:gap-8 border-6 border-ink bg-yellow px-4 py-4 shadow-retro-md sm:px-5 sm:py-5 md:flex-row md:items-center md:justify-between lg:px-6">
        <div className="pointer-events-none absolute -top-42 right-21 z-10 hidden h-[176px] w-[176px] border-6 border-ink bg-canvas shadow-retro-sm xl:-top-36 xl:right-42 lg:block">
          <Image
            fill
            sizes="176px"
            alt="Sticker barista"
            className="object-contain p-3"
            src="/landing/sticker-purple-barista.png"
          />
        </div>
        <p className="font-bangers text-[52px] leading-[48px] text-ink sm:text-[62px] sm:leading-[58px] lg:text-[70px] lg:leading-[64px]">
          POW!
        </p>
        <p className="max-w-[620px] font-press-start text-[10px] leading-[17px] lg:text-center tracking-[0.04em] text-ink sm:text-[11px] sm:leading-[18px]">
          {offerName
            ? `LIMITED OFFER: ${offerName}`
            : "LIMITED OFFER: 8-BIT CARAMEL CRUSH / COMBO SET WITH VINYL PLAYLIST QR"}
        </p>
        <Button
          type="button"
          variant="retro"
          className="w-fit shrink-0 border-4 border-ink bg-white px-[12px] py-[10px] text-[11px] leading-4 sm:px-[14px] sm:py-[12px] sm:text-[12px]"
          onClick={() => setIsOpen(true)}
        >
          VIEW
        </Button>
      </section>
      <Offer
        open={isOpen}
        onOpenChange={setIsOpen}
        onAccept={handleAcceptOffer}
        image={offerImage}
        name={offerName}
        items={offerItems}
      />
    </MaxWidthWrapper>
  );
};
