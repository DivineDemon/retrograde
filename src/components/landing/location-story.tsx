import Image from "next/image";

export const LocationStory = () => {
  return (
    <section className="relative z-10 flex flex-col gap-4 px-4 pt-9 sm:px-6 sm:pt-10 md:gap-6 md:px-10 md:pt-12 lg:flex-row lg:px-[60px]">
      <div className="relative z-10 shadow-retro-md flex flex-col gap-[14px] border-6 border-ink bg-magenta p-4 sm:p-5 md:p-6 lg:flex-[1.2]">
        <div className="font-press-start text-[10px] leading-[17px] tracking-[0.06em] text-white sm:text-[11px] sm:leading-[18px]">
          MANGA NIGHT SESSIONS / FRI + SAT
        </div>
        <div className="whitespace-pre-wrap font-bangers text-[60px] leading-[56px] text-white sm:text-[76px] sm:leading-[68px] md:text-[96px] md:leading-[88px]">
          DRAW. DRINK.
          <br />
          REPEAT.
        </div>
        <p className="m-0 max-w-[620px] font-noto text-base leading-7 text-white sm:text-[17px] md:text-lg">
          Live ink artists, city-pop DJs, and all-night espresso labs. Bring
          your sketchbook and claim your booth.
        </p>
      </div>
      <div className="shadow-retro-md flex flex-col gap-[14px] border-6 border-ink p-4 sm:p-5 md:p-[22px] lg:flex-[0.8]">
        <div className="font-press-start text-[11px] leading-[18px] text-ink sm:text-xs">
          RETROGRADE HQ
        </div>
        <div className="font-noto text-base leading-7 text-ink sm:text-lg">
          2-11-9 Dogenzaka, Shibuya-ku, Tokyo
        </div>
        <div className="border-t-4 border-ink pt-3">
          <div className="whitespace-pre-wrap font-press-start text-[10px] leading-[17px] text-ink sm:text-[11px] sm:leading-[18px]">
            WEEKDAYS 07:00-22:00
            <br />
            WEEKENDS 08:00-24:00
          </div>
        </div>
        <button
          type="button"
          className="w-fit cursor-pointer border-4 border-ink bg-cyan px-[12px] py-[10px] sm:px-[14px] sm:py-3"
        >
          <div className="font-press-start text-[11px] leading-4 text-ink sm:text-[12px]">
            GET DIRECTIONS
          </div>
        </button>
      </div>

      <div className="bg-canvas border-6 border-ink shadow-retro-sm pointer-events-none absolute -bottom-20 left-2/3 xl:left-1/2 z-10 hidden h-[154px] w-[154px] lg:block">
        <Image
          src="/landing/sticker-greenhair-mug.png"
          alt="Sticker drinking"
          fill
          sizes="154px"
          className="object-contain p-[10px]"
        />
      </div>
    </section>
  );
};
