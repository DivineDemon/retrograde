export const Hero = () => {
  return (
    <section className="relative z-10 flex flex-col gap-8 px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 md:px-10 md:pt-12 lg:flex-row lg:items-start lg:justify-between lg:gap-6 lg:px-[60px] lg:pt-14 lg:pb-10 xl:gap-[28px] xl:pt-[72px] xl:pb-[40px]">
      <div className="flex w-full flex-col gap-4 sm:gap-5 md:gap-[22px] lg:min-w-0 lg:flex-1 xl:w-[860px] xl:shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-magenta border-3 border-ink h-[18px] w-[18px]" />
          <div className="font-press-start text-[10px] leading-4 tracking-[0.08em] text-ink sm:text-[11px] sm:leading-[18px] md:text-[12px]">
            LEVEL 01 / SHIBUYA
          </div>
        </div>
        <h1 className="m-0 whitespace-pre-wrap font-bangers text-[64px] leading-[58px] tracking-[0.01em] text-ink sm:text-[88px] sm:leading-[78px] md:text-[112px] md:leading-[100px] lg:text-[124px] lg:leading-[108px] xl:text-[152px] xl:leading-[132px]">
          NEO BRUTAL
          <br />
          COFFEE ATTACK
        </h1>
        <p className="m-0 max-w-[760px] font-noto text-base leading-7 text-ink sm:text-[18px] sm:leading-8 md:text-xl md:leading-8 lg:text-2xl lg:leading-9">
          Retrograde blends 80s pop-art noise, manga punch panels, and
          arcade-era energy into hand-pulled espresso and electric pour-over
          rituals.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            className="cursor-pointer border-5 border-ink bg-magenta px-4 py-3 sm:px-[18px] sm:py-[14px] md:px-[22px] md:py-[18px]"
          >
            <div className="font-press-start text-[11px] leading-4 text-ink sm:text-xs md:text-sm md:leading-[18px]">
              START ORDER
            </div>
          </button>
          <button
            type="button"
            className="cursor-pointer border-5 border-ink bg-white px-4 py-3 sm:px-[18px] sm:py-[14px] md:px-[22px] md:py-[18px]"
          >
            <div className="font-press-start text-[11px] leading-4 text-ink sm:text-xs md:text-sm md:leading-[18px]">
              VIEW MENU
            </div>
          </button>
        </div>
      </div>

      {/* Hero Product Card */}
      <div className="shadow-retro-lg flex w-full max-w-[480px] flex-col gap-[10px] border-6 border-ink bg-white p-4 sm:p-5 lg:w-[340px] lg:shrink-0 xl:w-[420px] xl:-rotate-2">
        <div className="font-press-start text-[10px] leading-[14px] text-ink sm:text-[11px]">
          NOW BREWING
        </div>
        <div className="font-bangers text-[44px] leading-[44px] text-magenta sm:text-[52px] sm:leading-[52px] md:text-[58px] md:leading-[58px]">
          PIXEL LATTE
        </div>
        <div className="font-noto text-[15px] leading-6 text-ink sm:text-base">
          Single-origin shot + sakura cream + glitch cocoa dust.
        </div>
        <div className="flex items-center justify-between border-t-4 border-ink pt-[10px]">
          <div className="font-press-start text-[11px] leading-4 text-ink sm:text-[12px]">
            ¥690
          </div>
          <button
            type="button"
            className="cursor-pointer border-3 border-ink bg-yellow px-[10px] py-[8px]"
          >
            <div className="font-press-start text-[11px] leading-4 text-ink sm:text-[12px]">
              ADD +1
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
