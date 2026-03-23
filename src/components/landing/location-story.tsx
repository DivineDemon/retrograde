import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "../max-width-wrapper";

export const LocationStory = () => {
  return (
    <MaxWidthWrapper className="relative grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-8 lg:p-8">
      <div className="shadow-retro-md flex flex-col gap-[14px] border-6 border-ink bg-magenta p-4 sm:p-5 md:p-6">
        <p className="font-press-start text-[10px] leading-[17px] tracking-[0.06em] text-white sm:text-[11px] sm:leading-[18px]">
          MANGA NIGHT SESSIONS / FRI + SAT
        </p>
        <p className="whitespace-pre-wrap font-bangers text-[60px] leading-[56px] text-white sm:text-[76px] sm:leading-[68px] md:text-[96px] md:leading-[88px]">
          DRAW. DRINK.
          <br />
          REPEAT.
        </p>
        <p className="m-0 max-w-[620px] font-noto text-base leading-7 text-white sm:text-[17px] md:text-lg">
          Live ink artists, city-pop DJs, and all-night espresso labs. Bring
          your sketchbook and claim your booth.
        </p>
      </div>
      <div className="shadow-retro-md flex flex-col gap-[14px] border-6 border-ink p-4 sm:p-5 md:p-[22px]">
        <p className="font-press-start text-[11px] leading-[18px] text-ink sm:text-xs">
          RETROGRADE HQ
        </p>
        <p className="font-noto text-base leading-7 text-ink sm:text-lg">
          5 L, Block L Gulberg 2, Lahore, 54660, Pakistan
        </p>
        <div className="border-t-4 border-ink pt-3">
          <p className="whitespace-pre-wrap font-press-start text-[10px] leading-[17px] text-ink sm:text-[11px] sm:leading-[18px]">
            08:00AM-12:00AM
            <br />
            DAILY, NO EXCEPTIONS
          </p>
        </div>
        <Link
          href="https://www.google.com/maps/place/Retrograde+Coffee+-+Gulberg/@31.5200515,74.3463278,17z/data=!3m1!4b1!4m6!3m5!1s0x3919055116e42c0d:0xfed728ebcf47be89!8m2!3d31.520047!4d74.3489027!16s%2Fg%2F11n3kztsrs?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D"
          className="mt-auto w-fit cursor-pointer border-4 border-ink bg-cyan px-[12px] py-[10px] font-press-start text-[11px] leading-4 text-ink sm:px-[14px] sm:py-3 sm:text-[12px]"
        >
          GET DIRECTIONS
        </Link>
      </div>
      <div className="pointer-events-none absolute -bottom-20 right-6 z-10 hidden h-[154px] w-[154px] border-6 border-ink bg-canvas shadow-retro-sm lg:block xl:right-24">
        <Image
          fill
          sizes="154px"
          alt="Sticker drinking"
          className="object-contain p-[10px]"
          src="/landing/sticker-greenhair-mug.png"
        />
      </div>
    </MaxWidthWrapper>
  );
};
