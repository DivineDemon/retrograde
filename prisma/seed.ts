import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  DiscountType,
  MenuCategory,
  OfferDurationMode,
} from "../src/generated/prisma/enums";
import { seedMenuItems, seedStats } from "../src/server/data/bootstrap";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run prisma seed");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

const categoryMap: Record<string, MenuCategory> = {
  "NON-COFFEE": MenuCategory.NON_COFFEE,
  "COLD BREW": MenuCategory.COLD_BREW,
};

const FEATURED_MENU_SLUG = "pixel-cheesecake";
const MOST_POPULAR_SLUGS = new Set([
  "crt-mocha",
  "manga-fizz",
  "pixel-cheesecake",
]);

const normalizeCategory = (category: string): MenuCategory =>
  categoryMap[category] ?? (category.replaceAll(" ", "_") as MenuCategory);

const main = async () => {
  await prisma.menuItem.updateMany({
    where: { isFeatured: true },
    data: { isFeatured: false },
  });

  await prisma.menuItem.updateMany({
    where: { isMostPopular: true },
    data: { isMostPopular: false },
  });

  for (const item of seedMenuItems) {
    const slug = item.slug;
    await prisma.menuItem.upsert({
      where: { slug },
      update: {
        title: item.title,
        description: item.description,
        priceMinor: item.priceMinor,
        currency: "JPY",
        category: normalizeCategory(item.category),
        cardColor: item.cardColor,
        titleColor: item.titleColor,
        isFeatured: slug === FEATURED_MENU_SLUG,
        isMostPopular: MOST_POPULAR_SLUGS.has(slug),
        isActive: true,
      },
      create: {
        slug,
        title: item.title,
        description: item.description,
        priceMinor: item.priceMinor,
        currency: "JPY",
        category: normalizeCategory(item.category),
        cardColor: item.cardColor,
        titleColor: item.titleColor,
        isFeatured: slug === FEATURED_MENU_SLUG,
        isMostPopular: MOST_POPULAR_SLUGS.has(slug),
        isActive: true,
      },
    });
  }

  await prisma.stats.upsert({
    where: { id: "singleton" },
    update: {
      dailyCups: seedStats.dailyCups,
      vinylSpins: seedStats.vinylSpins,
      arcade: seedStats.arcade,
      comboRate: seedStats.comboRate,
    },
    create: {
      id: "singleton",
      dailyCups: seedStats.dailyCups,
      vinylSpins: seedStats.vinylSpins,
      arcade: seedStats.arcade,
      comboRate: seedStats.comboRate,
    },
  });

  await prisma.siteContent.upsert({
    where: { id: "singleton" },
    update: {
      mangaSessionLabel: "MANGA NIGHT SESSIONS / FRI + SAT",
      mangaSessionHeadline: "DRAW. DRINK.\nREPEAT.",
      mangaSessionDescription:
        "Live ink artists, city-pop DJs, and all-night espresso labs. Bring your sketchbook and claim your booth.",
      locationLabel: "RETROGRADE HQ",
      locationAddress: "5 L, Block L Gulberg 2, Lahore, 54660, Pakistan",
      hoursLineOne: "08:00AM-12:00AM",
      hoursLineTwo: "DAILY, NO EXCEPTIONS",
      directionsUrl:
        "https://www.google.com/maps/place/Retrograde+Coffee+-+Gulberg/@31.5200515,74.3463278,17z/data=!3m1!4b1!4m6!3m5!1s0x3919055116e42c0d:0xfed728ebcf47be89!8m2!3d31.520047!4d74.3489027!16s%2Fg%2F11n3kztsrs?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D",
    },
    create: {
      id: "singleton",
      mangaSessionLabel: "MANGA NIGHT SESSIONS / FRI + SAT",
      mangaSessionHeadline: "DRAW. DRINK.\nREPEAT.",
      mangaSessionDescription:
        "Live ink artists, city-pop DJs, and all-night espresso labs. Bring your sketchbook and claim your booth.",
      locationLabel: "RETROGRADE HQ",
      locationAddress: "5 L, Block L Gulberg 2, Lahore, 54660, Pakistan",
      hoursLineOne: "08:00AM-12:00AM",
      hoursLineTwo: "DAILY, NO EXCEPTIONS",
      directionsUrl:
        "https://www.google.com/maps/place/Retrograde+Coffee+-+Gulberg/@31.5200515,74.3463278,17z/data=!3m1!4b1!4m6!3m5!1s0x3919055116e42c0d:0xfed728ebcf47be89!8m2!3d31.520047!4d74.3489027!16s%2Fg%2F11n3kztsrs?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D",
    },
  });

  await prisma.limitedOffer.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  const bundleMenuItems = await prisma.menuItem.findMany({
    where: {
      slug: {
        in: ["pixel-cheesecake", "cassette-latte"],
      },
    },
  });

  if (bundleMenuItems.length !== 2) {
    return;
  }

  const cheesecake = bundleMenuItems.find(
    (menuItem) => menuItem.slug === "pixel-cheesecake",
  );
  const latte = bundleMenuItems.find(
    (menuItem) => menuItem.slug === "cassette-latte",
  );

  if (!cheesecake || !latte) {
    return;
  }

  await prisma.limitedOffer.deleteMany({
    where: { name: "Retro Double Drop" },
  });

  await prisma.limitedOffer.create({
    data: {
      name: "Retro Double Drop",
      description:
        "Unlock the limited combo: Pixel Cheesecake + Cassette Latte.",
      image: "https://i.ibb.co/Dfr1DSGX/limited-drop.png",
      durationMode: OfferDurationMode.TIME,
      availabilityStart: new Date("2026-01-01T00:00:00.000Z"),
      availabilityEnd: null,
      maxRedemptions: null,
      redemptionsUsed: 0,
      isActive: true,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      items: {
        create: [
          { menuItemId: cheesecake.id, quantity: 1 },
          { menuItemId: latte.id, quantity: 1 },
        ],
      },
    },
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
