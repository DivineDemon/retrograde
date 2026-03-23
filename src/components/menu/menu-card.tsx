import type { MenuItem } from "@/lib/constants";
import { cn, formatMenuPriceYen } from "@/lib/utils";

export default function MenuCard({ card }: { card: MenuItem }) {
  return (
    <div
      className={cn(
        card.color,
        "shadow-retro-sm flex h-fit flex-col gap-3 border-6 border-ink p-4 sm:p-[18px]",
      )}
    >
      <div className="font-press-start text-[10px] leading-3 text-ink">
        {card.category}
      </div>
      <div
        className={cn(
          card.titleColor,
          "font-bangers text-[42px] leading-[42px] sm:text-[48px] sm:leading-[48px] md:text-[52px] md:leading-[52px]",
        )}
      >
        {card.title}
      </div>
      <div className="font-noto text-[15px] leading-[22px] text-ink">
        {card.description}
      </div>
      <div className="flex items-center justify-between border-t-4 border-ink pt-[10px]">
        <div className="font-press-start text-[11px] leading-4 text-ink sm:text-[12px]">
          {formatMenuPriceYen(Number(card.price.replace("¥", "")))}
        </div>
        <button
          type="button"
          className="cursor-pointer border-3 border-ink bg-yellow px-[10px] py-[8px] font-press-start text-[11px] leading-4 text-ink sm:text-[12px]"
        >
          ADD +1
        </button>
      </div>
    </div>
  );
}
