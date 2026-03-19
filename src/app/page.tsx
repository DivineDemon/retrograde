import { BackgroundFX } from "@/components/landing/background-fx";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { LocationStory } from "@/components/landing/location-story";
import { MangaStrip } from "@/components/landing/manga-strip";
import { MenuCards } from "@/components/landing/menu-cards";
import { StatsMarquee } from "@/components/landing/stats-marquee";

export default function Home() {
  return (
    <div className="bg-canvas relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col overflow-x-hidden antialiased font-sans">
      <BackgroundFX />
      <Header />
      <Hero />
      <MangaStrip />
      <MenuCards />
      <StatsMarquee />
      <LocationStory />
      <Footer />
    </div>
  );
}
