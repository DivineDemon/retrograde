import { X } from "lucide-react";
import Image from "next/image";
import type { OfferLineItem } from "../../lib/cart-store";

type OfferProps = {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  image?: string | null;
  name?: string;
  items?: OfferLineItem[];
};

export const Offer = ({
  isOpen,
  onClose,
  onAccept,
  image,
  name,
  items,
}: OfferProps) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Limited drop poster"
      tabIndex={-1}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div className="relative w-full max-w-[720px] bg-canvas shadow-retro-md shadow-white">
        <button
          type="button"
          className="absolute -left-3 -top-3 bg-white size-6 font-press-start text-[10px] leading-none text-ink"
          onClick={onClose}
          aria-label="Close popup"
        >
          <X className="size-full" />
        </button>
        <Image
          src={image ?? "/landing/limited-drop.png"}
          alt={name ? `${name} poster` : "Limited drop promo poster"}
          width={800}
          height={800}
          className="h-auto w-full border-4 border-ink"
          priority
        />
        <div className="w-full bg-ink/50 p-5 absolute bottom-0 left-0 right-0 text-white flex items-center justify-between">
          <div className="flex flex-col gap-1 items-center justify-between flex-1 w-full">
            <p className="w-full text-left font-press-start text-xs">
              {name ?? "LIMITED DROP"}
            </p>
            {items && items.length > 0 ? (
              <p className="w-full text-left font-press-start text-xs">
                {items
                  .map((item) => `${item.title} x${item.quantity}`)
                  .join(" + ")}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="w-fit cursor-pointer border-4 border-ink px-4 py-3 font-press-start bg-yellow text-[11px] leading-4 text-ink sm:text-[12px]"
            onClick={handleAccept}
          >
            UNLOCK
          </button>
        </div>
      </div>
    </div>
  );
};
