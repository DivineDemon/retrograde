import { Elysia } from "elysia";

import { prisma } from "@/server/lib/prisma";

export const prismaPlugin = new Elysia({ name: "prisma-plugin" }).decorate(
  "prisma",
  prisma,
);
