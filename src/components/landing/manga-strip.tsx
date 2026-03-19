import Image from "next/image";

export const MangaStrip = () => {
  return (
    <section className="relative z-10 flex px-4 pt-4 sm:px-6 sm:pt-5 md:px-10 md:pt-6 lg:px-[60px]">
      <div className="relative z-10 shadow-retro-md flex grow flex-col gap-3 border-6 border-ink bg-yellow px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-center md:justify-between md:gap-4 lg:px-6">
        <div className="font-bangers text-[52px] leading-[48px] text-ink sm:text-[62px] sm:leading-[58px] lg:text-[70px] lg:leading-[64px]">
          POW!
        </div>
        <div className="max-w-[620px] font-press-start text-[10px] leading-[17px] tracking-[0.04em] text-ink sm:text-[11px] sm:leading-[18px]">
          LIMITED DROP: 8-BIT CARAMEL CRUSH / COMBO SET WITH VINYL PLAYLIST QR
        </div>
        <button
          type="button"
          className="w-fit cursor-pointer border-4 border-ink bg-white px-[12px] py-[10px] sm:px-[14px] sm:py-[12px]"
        >
          <div className="font-press-start text-[11px] leading-4 text-ink sm:text-[12px]">
            UNLOCK
          </div>
        </button>
      </div>

      <div className="bg-canvas border-6 border-ink shadow-retro-sm pointer-events-none absolute -top-32 xl:-top-28 right-56 z-10 hidden h-[176px] w-[176px] lg:block">
        <Image
          src="/landing/sticker-purple-barista.png"
          alt="Sticker barista"
          fill
          sizes="176px"
          className="object-contain p-3"
        />
      </div>
    </section>
  );
};
