import "server-only";

import { app } from "@/server/app";

/** Dummy origin; Elysia routes by pathname only. */
const INTERNAL_ORIGIN = "http://r.internal";

/**
 * Call the mounted Elysia app in-process (no HTTP to localhost).
 * Use this from Server Components / `server-only` code instead of Eden over the network.
 */
export const fetchElysia = async (
  path: string,
  init?: RequestInit,
): Promise<Response> => {
  const pathname = path.startsWith("/") ? path : `/${path}`;
  return await Promise.resolve(
    app.fetch(new Request(`${INTERNAL_ORIGIN}${pathname}`, init)),
  );
};
