import "server-only";

import { fetchElysia } from "@/lib/api/elysia-internal-fetch";
import type { MenuItemDto, OfferDto, StatsDto } from "@/lib/api/types";

const toMenuItem = (value: unknown): MenuItemDto | null => {
  if (!value || typeof value !== "object") return null;
  return value as MenuItemDto;
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
