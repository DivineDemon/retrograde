import "server-only";

import { cookies } from "next/headers";
import {
  GUEST_COOKIE_MAX_AGE_SECONDS,
  GUEST_COOKIE_NAME,
} from "@/lib/guest-cookie";

/**
 * Reads `guestId` from the cookie, or creates one and sets the cookie (same behavior as GET /api/guest-id).
 */
export async function getOrCreateGuestId(): Promise<string> {
  const cookieStore = await cookies();
  const existingGuestId = cookieStore.get(GUEST_COOKIE_NAME)?.value?.trim();
  const guestId = existingGuestId || crypto.randomUUID();

  if (!existingGuestId) {
    cookieStore.set({
      name: GUEST_COOKIE_NAME,
      value: guestId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: GUEST_COOKIE_MAX_AGE_SECONDS,
    });
  }

  return guestId;
}
