import Link from "next/link";
import { cn } from "@/lib/utils";
import MaxWidthWrapper from "../max-width-wrapper";

const CTA_BUTTON_CLASS =
  "cursor-pointer border-5 border-ink px-4 py-3 font-press-start text-[11px] leading-4 text-ink sm:px-[18px] sm:py-[14px] sm:text-xs md:px-[22px] md:py-[18px] md:text-sm md:leading-[18px]";

export const Hero = () => {
  return (
    <MaxWidthWrapper className="relative w-full overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute right-0 top-0 hidden h-[200px] w-[400px] border-b-6 border-l-6 border-ink bg-magenta lg:block" />
      <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:gap-8 lg:pr-[440px]">
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
      <div className="mt-4 flex w-full flex-col gap-[10px] border-6 border-ink bg-white p-4 shadow-retro-lg sm:mt-6 sm:p-5 lg:absolute lg:right-10 lg:top-10 lg:mt-0 lg:w-[420px] lg:-rotate-2">
        <div className="font-press-start text-[10px] leading-[14px] text-ink sm:text-[11px]">
          NOW BREWING
        </div>
        <div className="font-bangers text-[44px] leading-[44px] text-magenta sm:text-[52px] sm:leading-[52px] md:text-[58px] md:leading-[58px]">
          PIXEL CHEESECAKE
        </div>
        <p className="font-noto text-[15px] leading-6 text-ink sm:text-base">
          Baked vanilla cheesecake with berry coulis and crumbs.
        </p>
        <div className="flex items-center justify-between border-t-4 border-ink pt-[10px]">
          <div className="font-press-start text-[11px] leading-4 text-ink sm:text-[12px]">
            ¥620
          </div>
          <button
            type="button"
            className="cursor-pointer border-3 border-ink bg-yellow px-[10px] py-[8px] font-press-start text-[11px] leading-4 text-ink sm:text-[12px]"
          >
            ADD +1
          </button>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};
