import { treaty } from "@elysiajs/eden";
import type { App } from "@/server/app";

/**
 * Eden Treaty builds paths from the Elysia route tree (e.g. `.api.menu` → `/api/menu`).
 * The base URL must be the **origin only** — if it ends with `/api`, requests become
 * `/api/api/menu` and return 404.
 */
const normalizeApiOrigin = (raw: string): string => {
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.replace(/\/api$/i, "") || trimmed;
};

const isAbsoluteHttpUrl = (value: string): boolean =>
  /^https?:\/\//i.test(value);

const resolveApiUrl = (): string => {
  const serverInternal = process.env.INTERNAL_API_URL?.trim();
  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (typeof window !== "undefined") {
    const clientEnvUrl = publicUrl || serverInternal;
    if (clientEnvUrl) {
      if (clientEnvUrl.startsWith("/")) {
        return window.location.origin;
      }
      if (isAbsoluteHttpUrl(clientEnvUrl)) {
        return normalizeApiOrigin(clientEnvUrl);
      }
    }
    return window.location.origin;
  }

  if (serverInternal && isAbsoluteHttpUrl(serverInternal)) {
    return normalizeApiOrigin(serverInternal);
  }
  if (publicUrl && isAbsoluteHttpUrl(publicUrl)) {
    return normalizeApiOrigin(publicUrl);
  }

  const port = process.env.PORT?.trim() || "3000";
  return `http://127.0.0.1:${port}`;
};

/**
 * Reusable Eden Treaty factory for server and client consumers.
 */
export const createApiClient = (baseUrl = resolveApiUrl()) =>
  treaty<App>(baseUrl);

export const apiClient = createApiClient();

export type ApiClient = ReturnType<typeof createApiClient>;
