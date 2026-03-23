import Link from "next/link";
import { socialLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import MaxWidthWrapper from "../max-width-wrapper";

export const Footer = () => {
  return (
    <MaxWidthWrapper className="relative z-10 mt-12 flex flex-col gap-5 border-t-6 border-ink bg-ink px-4 pt-8 pb-8 sm:mt-14 sm:px-6 sm:pt-10 sm:pb-10 lg:mt-38 lg:flex-row lg:items-center lg:justify-between lg:px-[60px] lg:pt-12 lg:pb-[60px]">
      <div className="flex flex-col gap-[10px]">
        <div className="font-bangers text-[56px] leading-[52px] text-yellow sm:text-[64px] sm:leading-[60px] lg:text-[74px] lg:leading-[70px]">
          RETROGRADE
        </div>
        <div className="font-press-start text-[10px] leading-[17px] text-canvas sm:text-[11px] sm:leading-[18px]">
          COFFEE / VINYL / ARCADE / MANGA
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 lg:w-auto lg:flex lg:items-center lg:gap-[14px]">
        {socialLinks.map((btn) => (
          <Link
            href={btn.href}
            key={btn.label}
            target="_blank"
            className={cn(
              "cursor-pointer border-4 border-canvas px-[12px] py-[10px] font-press-start text-[11px] leading-4 text-ink sm:px-[14px] sm:py-[12px] sm:text-[12px]",
              btn.color,
            )}
          >
            {btn.label}
          </Link>
        ))}
      </div>
    </MaxWidthWrapper>
  );
};
