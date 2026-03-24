import { Elysia, t } from "elysia";
import { prisma } from "@/server/lib/prisma";

const defaultSiteContent = {
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
};

const siteContentResponse = t.Object({
  id: t.String(),
  mangaSessionLabel: t.String(),
  mangaSessionHeadline: t.String(),
  mangaSessionDescription: t.String(),
  locationLabel: t.String(),
  locationAddress: t.String(),
  hoursLineOne: t.String(),
  hoursLineTwo: t.String(),
  directionsUrl: t.String(),
});

export const siteContentRoutes = new Elysia({ prefix: "/site-content" }).get(
  "/",
  async () =>
    prisma.siteContent.upsert({
      where: { id: "singleton" },
      update: {},
      create: {
        id: "singleton",
        ...defaultSiteContent,
      },
    }),
  {
    response: siteContentResponse,
  },
);
