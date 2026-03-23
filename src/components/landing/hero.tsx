import Link from "next/link";
import { getFeaturedMenuItem } from "@/lib/api/server";
import { cn } from "@/lib/utils";
import MaxWidthWrapper from "../max-width-wrapper";
import MenuCard from "../menu/menu-card";

const CTA_BUTTON_CLASS =
  "cursor-pointer border-5 border-ink px-4 py-3 font-press-start text-[11px] leading-4 text-ink sm:px-[18px] sm:py-[14px] sm:text-xs md:px-[22px] md:py-[18px] md:text-sm md:leading-[18px]";

export const Hero = async () => {
  const featured = await getFeaturedMenuItem();

  return (
    <MaxWidthWrapper className="relative w-full overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute right-0 top-0 hidden h-[200px] w-[400px] border-b-6 border-l-6 border-ink bg-cyan lg:block" />

      <div
        className={cn(
          "relative grid gap-4 sm:gap-6 lg:items-start lg:gap-8",
          featured && "lg:grid-cols-[minmax(0,1fr)_auto]",
        )}
      >
        <div
          id="hero-left"
          className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:gap-8"
        >
          <p className="w-full text-left font-press-start text-[10px] leading-4 tracking-[0.08em] text-ink sm:text-[11px] sm:leading-[18px] md:text-[12px]">
            LEVEL 01 / SHIBUYA
          </p>
          <h1 className="m-0 w-full whitespace-pre-wrap text-left font-bangers text-[52px] leading-[48px] tracking-[0.01em] text-ink sm:text-[88px] sm:leading-[78px] md:text-[112px] md:leading-[100px] lg:text-[124px] lg:leading-[108px] xl:text-[152px] xl:leading-[132px]">
            PRO COFFEE
            <br />
            POWER-UP
          </h1>
          <p className="m-0 mr-auto w-full max-w-[760px] text-left font-noto text-[16px] leading-7 text-ink sm:text-[18px] sm:leading-8 md:text-xl md:leading-8 lg:text-2xl lg:leading-9">
            Retrograde blends 80s pop-art noise, manga punch panels, and
            arcade-era energy into hand-pulled espresso and electric pour-over
            rituals.
          </p>
          <Link href="/menu" className={cn(CTA_BUTTON_CLASS, "bg-cyan w-fit")}>
            VIEW MENU
          </Link>
        </div>
        {featured ? (
          <div
            id="hero-right"
            className="min-w-0 max-w-full shrink-0 lg:max-w-[min(100%,380px)] lg:justify-self-end lg:pt-2 lg:-rotate-2"
          >
            <MenuCard card={featured} />
          </div>
        ) : null}
      </div>
    </MaxWidthWrapper>
  );
};
