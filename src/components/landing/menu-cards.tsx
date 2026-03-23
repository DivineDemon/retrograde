import { menuItems } from "@/lib/constants";
import { cn, formatMenuPriceYen } from "@/lib/utils";
import MaxWidthWrapper from "../max-width-wrapper";

export const MenuCards = () => {
  return (
    <MaxWidthWrapper className="grid w-full grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 lg:p-8">
      {menuItems.map((card) => (
        <div
          key={card.id}
          className={cn(
            card.color,
            "shadow-retro-sm flex h-full flex-col gap-3 border-6 border-ink p-4 sm:p-[18px]",
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
          <div className="mt-auto font-press-start text-[12px] leading-4 text-ink">
            {formatMenuPriceYen(Number(card.price.replace("¥", "")))}
          </div>
        </div>
      ))}
    </MaxWidthWrapper>
  );
};
