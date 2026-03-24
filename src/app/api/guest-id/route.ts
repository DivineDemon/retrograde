import { getOrCreateGuestId } from "@/lib/guest-server";

export async function GET() {
  const guestId = await getOrCreateGuestId();
  return Response.json({ guestId });
}
