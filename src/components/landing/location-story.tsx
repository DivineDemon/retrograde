import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "../max-width-wrapper";

type LocationStoryProps = {
  mangaSessionLabel: string;
  mangaSessionHeadline: string;
  mangaSessionDescription: string;
  locationLabel: string;
  locationAddress: string;
  hoursLineOne: string;
  hoursLineTwo: string;
  directionsUrl: string;
};

export const LocationStory = ({
  mangaSessionLabel,
  mangaSessionHeadline,
  mangaSessionDescription,
  locationLabel,
  locationAddress,
  hoursLineOne,
  hoursLineTwo,
  directionsUrl,
}: LocationStoryProps) => {
  return (
    <MaxWidthWrapper className="relative grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-8 lg:p-8">
      <div className="shadow-retro-md flex flex-col gap-[14px] border-6 border-ink bg-magenta p-4 sm:p-5 md:p-6">
        <p className="font-press-start text-[10px] leading-[17px] tracking-[0.06em] text-white sm:text-[11px] sm:leading-[18px]">
          {mangaSessionLabel}
        </p>
        <p className="whitespace-pre-wrap font-bangers text-[60px] leading-[56px] text-white sm:text-[76px] sm:leading-[68px] md:text-[96px] md:leading-[88px]">
          {mangaSessionHeadline}
        </p>
        <p className="m-0 max-w-[620px] font-noto text-base leading-7 text-white sm:text-[17px] md:text-lg">
          {mangaSessionDescription}
        </p>
      </div>
      <div className="shadow-retro-md flex flex-col gap-[14px] border-6 border-ink p-4 sm:p-5 md:p-[22px]">
        <p className="font-press-start text-[11px] leading-[18px] text-ink sm:text-xs">
          {locationLabel}
        </p>
        <p className="font-noto text-base leading-7 text-ink sm:text-lg">
          {locationAddress}
        </p>
        <div className="border-t-4 border-ink pt-3">
          <p className="whitespace-pre-wrap font-press-start text-[10px] leading-[17px] text-ink sm:text-[11px] sm:leading-[18px]">
            {hoursLineOne}
            {"\n"}
            {hoursLineTwo}
          </p>
        </div>
        <Link
          href={directionsUrl}
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
