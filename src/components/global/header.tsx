import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Cart } from "../cart/cart";
import MaxWidthWrapper from "../max-width-wrapper";
import { buttonVariants } from "../ui/button";

export const Header = () => {
  const headerActionClass =
    "font-press-start text-[10px] sm:text-[11px] lg:text-[12px]";

  const navLinkClass = cn(
    buttonVariants({ variant: "retro" }),
    headerActionClass,
    "text-ink no-underline",
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b-6 bg-canvas">
      <MaxWidthWrapper className="flex w-full flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between lg:p-8">
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
          <Link href="/menu" className={cn(navLinkClass, "bg-yellow")}>
            MENU
          </Link>
          <Link href="/orders" className={cn(navLinkClass, "bg-cyan")}>
            ORDERS
          </Link>
          <Cart triggerClassName={headerActionClass} />
        </div>
      </MaxWidthWrapper>
    </header>
  );
};
