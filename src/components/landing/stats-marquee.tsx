import Image from "next/image";
import { getStats } from "@/lib/api/server";
import { cn } from "@/lib/utils";
import MaxWidthWrapper from "../max-width-wrapper";

const statMeta = [
  {
    label: "DAILY CUPS",
    key: "dailyCups" as const,
    valueColor: "text-magenta",
  },
  { label: "VINYL SPINS", key: "vinylSpins" as const, valueColor: "text-ink" },
  { label: "ARCADE", key: "arcade" as const, valueColor: "text-ink" },
  { label: "COMBO RATE", key: "comboRate" as const, valueColor: "text-ink" },
];

export const StatsMarquee = async () => {
  const stats = await getStats();

  return (
    <MaxWidthWrapper className="relative p-4 sm:p-6 lg:p-8">
      <div className="grid w-full grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4">
        {statMeta.map((stat) => (
          <div
            key={stat.label}
            className="shadow-retro-sm flex flex-col gap-3 border-6 border-ink p-4 sm:p-[18px]"
          >
            <div className="font-press-start text-[10px] leading-3 text-ink">
              {stat.label}
            </div>
            <div
              className={cn(
                stat.valueColor,
                "font-bangers text-[40px] leading-[40px] sm:text-[46px] sm:leading-[46px] md:text-[52px] md:leading-[52px]",
              )}
            >
              {stat.key === "comboRate"
                ? `${stats?.comboRate ?? 0}%`
                : Intl.NumberFormat("en-US").format(stats?.[stat.key] ?? 0)}
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute -top-10 left-50 lg:left-45 lg:-top-15 z-10 hidden h-[110px] w-[110px] border-6 border-ink bg-canvas shadow-retro-xs md:block">
        <Image
          fill
          sizes="110px"
          alt="Sticker coffee"
          className="object-contain p-2"
          src="/landing/sticker-mug-steam.png"
        />
      </div>
    </MaxWidthWrapper>
  );
};
