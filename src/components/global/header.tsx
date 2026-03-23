import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "../max-width-wrapper";
import { Cart } from "./cart";

export const Header = () => {
  return (
    <MaxWidthWrapper className="flex w-full flex-col gap-4 border-b-6 p-4 sm:p-6 md:flex-row md:items-center md:justify-between lg:p-8">
      <Link href="/" className="flex items-center gap-3 sm:gap-5">
        <Image
          src="/landing/logo-retrograde.png"
          alt="Retrograde logo"
          width={64}
          height={48}
          className="h-12 w-16 object-cover"
        />
        <div className="space-y-1">
          <span className="block font-press-start text-[10px] leading-4 sm:text-[11px]">
            RETROGRADE
          </span>
          <span className="block font-press-start text-[9px] leading-4 sm:text-[10px]">
            ネオ・ブルータリスト コーヒー
          </span>
        </div>
      </Link>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Link
          href="/menu"
          className="border-4 border-ink bg-yellow px-2 py-2 text-center font-press-start text-[10px] leading-4 text-ink no-underline sm:px-3 sm:py-[10px] sm:text-[11px] lg:px-[14px] lg:py-[12px] lg:text-[12px]"
        >
          MENU
        </Link>
        <Cart />
      </div>
    </MaxWidthWrapper>
  );
};
