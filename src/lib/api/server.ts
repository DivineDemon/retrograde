import "server-only";

import { fetchElysia } from "@/lib/api/elysia-internal-fetch";
import type {
  MenuItemDto,
  OfferDto,
  SiteContentDto,
  StatsDto,
} from "@/lib/api/types";

const toMenuItem = (value: unknown): MenuItemDto | null => {
  if (!value || typeof value !== "object") return null;
  return value as MenuItemDto;
};

const defaultSiteContent: SiteContentDto = {
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
};

export const getMenuItems = async (): Promise<MenuItemDto[]> => {
  try {
    const response = await fetchElysia("/api/menu");
    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        const detail = await response.text();
        console.error("[getMenuItems] HTTP", response.status, detail);
      }
      return [];
    }
    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) return [];
    return data.map(toMenuItem).filter((item): item is MenuItemDto => !!item);
  } catch (cause) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getMenuItems] failed:", cause);
    }
    return [];
  }
};

export const getFeaturedMenuItem = async (): Promise<MenuItemDto | null> => {
  try {
    const response = await fetchElysia("/api/menu/featured");
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as unknown;
    return toMenuItem(data);
  } catch {
    return null;
  }
};

export const getStats = async (): Promise<StatsDto | null> => {
  try {
    const response = await fetchElysia("/api/stats");
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as unknown;
    if (!data || typeof data !== "object") return null;
    return data as StatsDto;
  } catch {
    return null;
  }
};

export const getActiveOffer = async (): Promise<OfferDto | null> => {
  try {
    const response = await fetchElysia("/api/offers/active");
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as unknown;
    if (!data || typeof data !== "object") return null;
    return data as OfferDto;
  } catch {
    return null;
  }
};

export const getSiteContent = async (): Promise<SiteContentDto> => {
  try {
    const response = await fetchElysia("/api/site-content");
    if (!response.ok) {
      return defaultSiteContent;
    }
    const data = (await response.json()) as unknown;
    if (!data || typeof data !== "object") return defaultSiteContent;
    return data as SiteContentDto;
  } catch {
    return defaultSiteContent;
  }
};
