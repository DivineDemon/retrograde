import { Hero } from "@/components/landing/hero";
import { LocationStory } from "@/components/landing/location-story";
import { MangaStrip } from "@/components/landing/manga-strip";
import { MenuCards } from "@/components/landing/menu-cards";
import { StatsMarquee } from "@/components/landing/stats-marquee";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-start justify-start">
      <Hero />
      <MangaStrip />
      <MenuCards />
      <StatsMarquee />
      <LocationStory />
    </div>
  );
}
