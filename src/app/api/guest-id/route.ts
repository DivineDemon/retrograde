import { cookies } from "next/headers";

const GUEST_COOKIE_NAME = "guestId";
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

export async function GET() {
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
      maxAge: THIRTY_DAYS_IN_SECONDS,
    });
  }

  return Response.json({ guestId });
}
