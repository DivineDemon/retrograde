import { Elysia, t } from "elysia";
import { prisma } from "@/server/lib/prisma";

const statsResponse = t.Object({
  dailyCups: t.Integer(),
  vinylSpins: t.Integer(),
  arcade: t.Integer(),
  comboRate: t.Integer(),
});

export const statsRoutes = new Elysia({ prefix: "/stats" }).get(
  "/",
  async () => {
    const stats = await prisma.stats.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    });

    return {
      dailyCups: stats.dailyCups,
      vinylSpins: stats.vinylSpins,
      arcade: stats.arcade,
      comboRate: stats.comboRate,
    };
  },
  {
    response: statsResponse,
  },
);
