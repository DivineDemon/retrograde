const socialLinks = [
  { label: "INSTAGRAM", color: "bg-white" },
  { label: "SPOTIFY", color: "bg-cyan" },
  { label: "BOOK TABLE", color: "bg-magenta" },
];

export const Footer = () => {
  return (
    <footer className="relative z-10 mt-12 flex flex-col gap-5 border-t-6 border-ink bg-ink px-4 pt-8 pb-8 sm:mt-14 sm:px-6 sm:pt-10 sm:pb-10 lg:mt-38 lg:flex-row lg:items-center lg:justify-between lg:px-[60px] lg:pt-12 lg:pb-[60px]">
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
          <button
            type="button"
            key={btn.label}
            className={`cursor-pointer ${btn.color} border-4 border-canvas px-[12px] py-[10px] sm:px-[14px] sm:py-[12px]`}
          >
            <div className="font-press-start text-[11px] leading-4 text-ink sm:text-[12px]">
              {btn.label}
            </div>
          </button>
        ))}
      </div>
    </footer>
  );
};
