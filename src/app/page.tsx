import { Hero } from "@/components/landing/hero";
import { LocationStory } from "@/components/landing/location-story";
import { MangaStrip } from "@/components/landing/manga-strip";
import { MenuCards } from "@/components/landing/menu-cards";
import { StatsMarquee } from "@/components/landing/stats-marquee";
import { getActiveOffer } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const activeOffer = await getActiveOffer();

  return (
    <div className="relative w-full min-h-screen flex flex-col items-start justify-start">
      <Hero />
      <MangaStrip
        offerId={activeOffer?.id}
        offerName={activeOffer?.name}
        offerImage={activeOffer?.image}
        offerDescription={activeOffer?.description}
        discountType={activeOffer?.discountType}
        discountValue={activeOffer?.discountValue}
        offerItems={activeOffer?.items.map((item) => ({
          menuItemId: item.menuItemId,
          title: item.menuItem.title,
          quantity: item.quantity,
          priceMinor: item.menuItem.priceMinor,
        }))}
      />
      <MenuCards />
      <StatsMarquee />
      <LocationStory />
    </div>
  );
}
