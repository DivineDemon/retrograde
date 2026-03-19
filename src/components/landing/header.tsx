import Image from "next/image";

export const Header = () => {
  return (
    <header className="relative z-10 flex flex-col gap-5 border-b-6 border-ink bg-canvas px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative h-[84px] w-[124px] shrink-0 sm:h-[96px] sm:w-[144px] lg:h-[120px] lg:w-[180px]">
          <Image
            src="/landing/logo-retrograde.png"
            alt="Retrograde logo"
            fill
            sizes="(max-width: 639px) 124px, (max-width: 1023px) 144px, 180px"
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col gap-[6px]">
          <div className="font-press-start text-[10px] leading-4 tracking-[0.08em] text-ink uppercase sm:text-xs sm:leading-[18px] lg:text-sm lg:leading-5">
            RETRO TOKYO BEANS
          </div>
          <div className="font-noto text-xs leading-4 text-ink sm:text-[13px] sm:leading-[18px]">
            ネオ・ブルータリスト コーヒー
          </div>
        </div>
      </div>
      <nav className="grid w-full grid-cols-3 gap-2 sm:gap-3 lg:w-auto lg:flex lg:items-center lg:gap-[14px]">
        <a
          href="/#menu"
          className="border-4 border-ink bg-white px-2 py-2 text-center no-underline sm:px-3 sm:py-[10px] lg:px-[14px] lg:py-[12px]"
        >
          <div className="font-press-start text-[10px] leading-4 text-ink sm:text-[11px] lg:text-[12px]">
            MENU
          </div>
        </a>
        <a
          href="/#locations"
          className="border-4 border-ink bg-cyan px-2 py-2 text-center no-underline sm:px-3 sm:py-[10px] lg:px-[14px] lg:py-[12px]"
        >
          <div className="font-press-start text-[10px] leading-4 text-ink sm:text-[11px] lg:text-[12px]">
            LOCATIONS
          </div>
        </a>
        <a
          href="/#order"
          className="border-4 border-ink bg-yellow px-2 py-2 text-center no-underline sm:px-3 sm:py-[10px] lg:px-[16px] lg:py-[12px]"
        >
          <div className="font-press-start text-[10px] leading-4 text-ink sm:text-[11px] lg:text-[12px]">
            ORDER
          </div>
        </a>
      </nav>
    </header>
  );
};
