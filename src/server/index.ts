import { fileURLToPath } from "node:url";
import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { app as apiApp } from "@/server/app";
import { env } from "@/server/env";

import { prisma } from "./lib/prisma";

const app = new Elysia({ name: "retrograde-api-node", adapter: node() }).use(
  apiApp,
);

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  app.listen(env.apiPort);

  console.log(`Retrograde API listening on port ${env.apiPort}`);

  process.once("SIGINT", () => {
    void shutdown();
  });
  process.once("SIGTERM", () => {
    void shutdown();
  });
}
