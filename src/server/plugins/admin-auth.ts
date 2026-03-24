import { createHmac, timingSafeEqual } from "node:crypto";
import { Elysia } from "elysia";

import { env } from "@/server/env";

type AdminAuthResolution = {
  ok: boolean;
  reason?: string;
};

const signAdminSession = (expiresAtEpochSeconds: number): string => {
  const payload = `admin:${expiresAtEpochSeconds}`;
  const signature = createHmac("sha256", env.adminSessionSecret)
    .update(payload)
    .digest("hex");
  return `${expiresAtEpochSeconds}.${signature}`;
};

const safeCompare = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
};

const getCookieValue = (
  cookieHeader: string | undefined,
  name: string,
): string => {
  if (!cookieHeader) {
    return "";
  }

  const cookies = cookieHeader.split(";");
  for (const cookiePart of cookies) {
    const [rawName, ...rawValue] = cookiePart.trim().split("=");
    if (rawName !== name) {
      continue;
    }
    return decodeURIComponent(rawValue.join("="));
  }

  return "";
};

export const resolveAdminAuth = (
  headers: Record<string, string | undefined>,
): AdminAuthResolution => {
  const providedSecret = headers["x-admin-secret"];
  if (providedSecret && providedSecret === env.adminApiSecret) {
    return { ok: true };
  }

  const cookieValue = getCookieValue(
    headers.cookie,
    env.adminSessionCookieName,
  );
  if (!cookieValue) {
    if (providedSecret) {
      return { ok: false, reason: "Invalid admin secret" };
    }
    return { ok: false, reason: "Missing admin credentials" };
  }

  const [expiresRaw, providedSignature] = cookieValue.split(".");
  const expiresAtEpochSeconds = Number.parseInt(expiresRaw ?? "", 10);
  if (
    !Number.isInteger(expiresAtEpochSeconds) ||
    !providedSignature ||
    expiresAtEpochSeconds <= Math.floor(Date.now() / 1000)
  ) {
    return { ok: false, reason: "Invalid or expired admin session" };
  }

  const expectedSignature = createHmac("sha256", env.adminSessionSecret)
    .update(`admin:${expiresAtEpochSeconds}`)
    .digest("hex");
  if (!safeCompare(expectedSignature, providedSignature)) {
    return { ok: false, reason: "Invalid or expired admin session" };
  }

  return { ok: true };
};

const toSetCookieHeader = (token: string, maxAgeSeconds: number): string => {
  const attributes = [
    `${env.adminSessionCookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (env.nodeEnv === "production") {
    attributes.push("Secure");
  }

  return attributes.join("; ");
};

export const createAdminSessionCookieHeader = (): string => {
  const expiresAtEpochSeconds =
    Math.floor(Date.now() / 1000) + env.adminSessionTtlSeconds;
  const token = signAdminSession(expiresAtEpochSeconds);
  return toSetCookieHeader(token, env.adminSessionTtlSeconds);
};

export const clearAdminSessionCookieHeader = (): string =>
  toSetCookieHeader("", 0);

export const adminAuthPlugin = new Elysia({
  name: "admin-auth-plugin",
}).onBeforeHandle(({ headers, status }) => {
  const result = resolveAdminAuth(headers);
  if (!result.ok) {
    if (result.reason === "Invalid admin secret") {
      return status(403, { error: result.reason });
    }
    return status(401, { error: result.reason ?? "Unauthorized" });
  }
});
