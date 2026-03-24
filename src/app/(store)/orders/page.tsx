import { OrdersClient } from "@/components/orders/orders-client";
import { getGuestOrders } from "@/lib/api/server";
import { getOrCreateGuestId } from "@/lib/guest-server";

export default async function OrdersPage() {
  const guestId = await getOrCreateGuestId();
  const initialOrders = await getGuestOrders(guestId);
  return <OrdersClient initialOrders={initialOrders} />;
}
