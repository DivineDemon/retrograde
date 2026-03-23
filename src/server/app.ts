import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";

import { env } from "@/server/env";
import { adminRoutes } from "@/server/routes/admin";
import { guestRoutes } from "@/server/routes/guest";
import { menuRoutes } from "@/server/routes/menu";
import { offerRoutes } from "@/server/routes/offers";
import { orderRoutes } from "@/server/routes/orders";
import { statsRoutes } from "@/server/routes/stats";

import { prismaPlugin } from "./plugins/prisma";

export const app = new Elysia({ name: "retrograde-api" })
  .use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  )
  .use(prismaPlugin)
  .group("/api", (api) =>
    api
      .get("/health", () => ({
        status: "ok",
        service: "retrograde-api",
      }))
      .use(menuRoutes)
      .use(statsRoutes)
      .use(offerRoutes)
      .use(guestRoutes)
      .use(orderRoutes)
      .use(adminRoutes),
  );

export type App = typeof app;
