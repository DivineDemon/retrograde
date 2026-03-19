import Image from "next/image";

const stats = [
  { label: "DAILY CUPS", value: "1,984", valueColor: "text-magenta" },
  { label: "VINYL SPINS", value: "402", valueColor: "text-ink" },
  { label: "ARCADE TOKENS", value: "9,008", valueColor: "text-ink" },
  { label: "COMBO RATE", value: "87%", valueColor: "text-ink" },
];

export const StatsMarquee = () => {
  return (
    <section className="relative z-10 flex px-4 pt-7 sm:px-6 sm:pt-8 md:px-10 md:pt-9 lg:px-[60px]">
      <div className="relative z-10 grid w-full grid-cols-1 gap-2 border-6 border-ink bg-ink p-2 sm:grid-cols-2 sm:gap-3 sm:p-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-2 border-4 border-ink bg-canvas p-[12px] sm:p-[14px]"
          >
            <div className="font-press-start text-[10px] leading-3 text-ink">
              {stat.label}
            </div>
            <div
              className={`${stat.valueColor} font-bangers text-[40px] leading-[40px] sm:text-[46px] sm:leading-[46px] md:text-[52px] md:leading-[52px]`}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-canvas border-6 border-ink shadow-retro-xs pointer-events-none absolute -top-10 xl:-top-5 left-48 xl:left-64 z-10 hidden h-[110px] w-[110px] lg:block">
        <Image
          src="/landing/sticker-mug-steam.png"
          alt="Sticker coffee"
          fill
          sizes="110px"
          className="object-contain p-2"
        />
      </div>
    </section>
  );
};
