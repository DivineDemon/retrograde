import { Elysia } from "elysia";

import { env } from "@/server/env";

export const adminAuthPlugin = new Elysia({
  name: "admin-auth-plugin",
}).onBeforeHandle(({ headers, status }) => {
  const providedSecret = headers["x-admin-secret"];

  if (!providedSecret) {
    return status(401, { error: "Missing x-admin-secret header" });
  }

  if (providedSecret !== env.adminApiSecret) {
    return status(403, { error: "Invalid admin secret" });
  }
});
