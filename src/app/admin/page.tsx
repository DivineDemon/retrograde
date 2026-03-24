"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { formatMenuPriceYen } from "@/lib/utils";

type MenuItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceMinor: number;
  currency: string;
  category: string;
  cardColor: string | null;
  titleColor: string | null;
  isFeatured: boolean;
  isMostPopular: boolean;
  isActive: boolean;
};

type OfferItem = {
  id: string;
  menuItemId: string;
  quantity: number;
};

type Offer = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  durationMode: "TIME" | "CAPACITY";
  availabilityStart: string;
  availabilityEnd: string | null;
  maxRedemptions: number | null;
  redemptionsUsed: number;
  isActive: boolean;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  items: OfferItem[];
};

type OrderItem = {
  id: string;
  menuItemId: string | null;
  menuItemSlug: string;
  menuItemTitle: string;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
};

type Order = {
  id: string;
  status: string;
  paymentMode: string;
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  streetAddress: string;
  city: string;
  addressNotes: string | null;
  guestId: string | null;
  limitedOfferId: string | null;
  createdAt: string;
  items: OrderItem[];
};

type Stats = {
  id: string;
  dailyCups: number;
  vinylSpins: number;
  arcade: number;
  comboRate: number;
};

type SiteContent = {
  id: string;
  mangaSessionLabel: string;
  mangaSessionHeadline: string;
  mangaSessionDescription: string;
  locationLabel: string;
  locationAddress: string;
  hoursLineOne: string;
  hoursLineTwo: string;
  directionsUrl: string;
};

const MENU_CATEGORIES = [
  "SIGNATURE",
  "COLD_BREW",
  "DESSERT",
  "ESPRESSO",
  "FILTER",
  "NON_COFFEE",
  "BAKERY",
  "SAVORY",
  "BREAKFAST",
] as const;
const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
] as const;

const initialMenuForm = {
  slug: "",
  title: "",
  description: "",
  priceMinor: "0",
  category: "SIGNATURE",
  cardColor: "",
  titleColor: "",
  isFeatured: false,
  isMostPopular: false,
  isActive: true,
};

const initialOfferForm = {
  name: "",
  description: "",
  image: "",
  durationMode: "TIME" as "TIME" | "CAPACITY",
  availabilityStart: "",
  availabilityEnd: "",
  maxRedemptions: "",
  isActive: false,
  discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
  discountValue: "0",
  items: "",
};

const parseError = async (response: Response, fallback: string) => {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return payload?.error ?? fallback;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [_siteContent, setSiteContent] = useState<SiteContent | null>(null);

  const [menuForm, setMenuForm] = useState(initialMenuForm);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState(initialOfferForm);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [statsForm, setStatsForm] = useState({
    dailyCups: "0",
    vinylSpins: "0",
    arcade: "0",
    comboRate: "0",
  });
  const [statsAdjustmentForm, setStatsAdjustmentForm] = useState({
    dailyCupsDelta: "0",
    vinylSpinsDelta: "0",
    arcadeDelta: "0",
    comboRateDelta: "0",
  });
  const [siteForm, setSiteForm] = useState({
    mangaSessionLabel: "",
    mangaSessionHeadline: "",
    mangaSessionDescription: "",
    locationLabel: "",
    locationAddress: "",
    hoursLineOne: "",
    hoursLineTwo: "",
    directionsUrl: "",
  });

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const activeOfferId = useMemo(
    () => offers.find((offer) => offer.isActive)?.id ?? null,
    [offers],
  );

  const loadAllData = async (statusFilter = orderStatusFilter) => {
    setLoading(true);
    setGlobalError(null);

    try {
      const orderUrl = statusFilter
        ? `/api/admin/orders?status=${encodeURIComponent(statusFilter)}`
        : "/api/admin/orders";

      const [menuRes, offersRes, ordersRes, statsRes, siteRes] =
        await Promise.all([
          fetch("/api/admin/menu?includeInactive=true", {
            credentials: "include",
          }),
          fetch("/api/admin/offers", { credentials: "include" }),
          fetch(orderUrl, { credentials: "include" }),
          fetch("/api/stats", { credentials: "include" }),
          fetch("/api/admin/site-content", { credentials: "include" }),
        ]);

      if (
        !menuRes.ok ||
        !offersRes.ok ||
        !ordersRes.ok ||
        !statsRes.ok ||
        !siteRes.ok
      ) {
        throw new Error("Could not load admin dashboard data.");
      }

      const [menuData, offerData, orderData, statsData, siteData] =
        await Promise.all([
          menuRes.json() as Promise<MenuItem[]>,
          offersRes.json() as Promise<Offer[]>,
          ordersRes.json() as Promise<Order[]>,
          statsRes.json() as Promise<Stats>,
          siteRes.json() as Promise<SiteContent>,
        ]);

      setMenuItems(menuData);
      setOffers(offerData);
      setOrders(orderData);
      setStats(statsData);
      setSiteContent(siteData);
      setStatsForm({
        dailyCups: String(statsData.dailyCups),
        vinylSpins: String(statsData.vinylSpins),
        arcade: String(statsData.arcade),
        comboRate: String(statsData.comboRate),
      });
      setSiteForm({
        mangaSessionLabel: siteData.mangaSessionLabel,
        mangaSessionHeadline: siteData.mangaSessionHeadline,
        mangaSessionDescription: siteData.mangaSessionDescription,
        locationLabel: siteData.locationLabel,
        locationAddress: siteData.locationAddress,
        hoursLineOne: siteData.hoursLineOne,
        hoursLineTwo: siteData.hoursLineTwo,
        directionsUrl: siteData.directionsUrl,
      });
    } catch (error) {
      setGlobalError(
        error instanceof Error ? error.message : "Failed to load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: auth check runs once on mount.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const sessionResponse = await fetch("/api/admin/auth/me", {
        credentials: "include",
      });

      if (cancelled) return;
      if (!sessionResponse.ok) {
        router.replace("/admin/login");
        return;
      }

      setIsAuthorized(true);
      setAuthChecked(true);
      await loadAllData();
    })().catch(() => {
      if (!cancelled) {
        router.replace("/admin/login");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const performAction = async (action: () => Promise<void>) => {
    if (isMutating) return;
    setIsMutating(true);
    setActionMessage(null);
    setGlobalError(null);

    try {
      await action();
      await loadAllData();
      setActionMessage("Saved.");
    } catch (error) {
      setGlobalError(
        error instanceof Error ? error.message : "Action failed. Please retry.",
      );
    } finally {
      setIsMutating(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/admin/login");
  };

  const submitMenuForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await performAction(async () => {
      const payload = {
        slug: menuForm.slug.trim(),
        title: menuForm.title.trim(),
        description: menuForm.description.trim(),
        priceMinor: Number(menuForm.priceMinor),
        category: menuForm.category,
        cardColor: menuForm.cardColor.trim() || undefined,
        titleColor: menuForm.titleColor.trim() || undefined,
        isFeatured: menuForm.isFeatured,
        isMostPopular: menuForm.isMostPopular,
        isActive: menuForm.isActive,
      };

      const endpoint = editingMenuId
        ? `/api/admin/menu/${encodeURIComponent(editingMenuId)}`
        : "/api/admin/menu";
      const method = editingMenuId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(
          await parseError(response, "Failed to save menu item."),
        );
      }

      setMenuForm(initialMenuForm);
      setEditingMenuId(null);
    });
  };

  const submitOfferForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await performAction(async () => {
      const rawItems = offerForm.items
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const items = rawItems.map((entry) => {
        const [menuItemId, quantityRaw] = entry.split(":");
        return {
          menuItemId: (menuItemId ?? "").trim(),
          quantity: Number(quantityRaw ?? "1"),
        };
      });

      const payload = {
        name: offerForm.name.trim(),
        description: offerForm.description.trim(),
        image: offerForm.image.trim() || undefined,
        durationMode: offerForm.durationMode,
        availabilityStart: new Date(offerForm.availabilityStart).toISOString(),
        availabilityEnd: offerForm.availabilityEnd
          ? new Date(offerForm.availabilityEnd).toISOString()
          : undefined,
        maxRedemptions:
          offerForm.durationMode === "CAPACITY" && offerForm.maxRedemptions
            ? Number(offerForm.maxRedemptions)
            : undefined,
        isActive: offerForm.isActive,
        discountType: offerForm.discountType,
        discountValue: Number(offerForm.discountValue),
        items,
      };

      const endpoint = editingOfferId
        ? `/api/admin/offers/${encodeURIComponent(editingOfferId)}`
        : "/api/admin/offers";
      const method = editingOfferId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await parseError(response, "Failed to save offer."));
      }

      setOfferForm(initialOfferForm);
      setEditingOfferId(null);
    });
  };

  if (!authChecked || !isAuthorized) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl p-4 sm:p-6 lg:p-8">
        <p className="font-press-start text-[10px] leading-4 text-ink">
          Loading admin dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="flex flex-wrap items-center justify-between gap-3 border-4 border-ink bg-white p-3 shadow-retro-sm">
        <h1 className="font-press-start text-[12px] leading-6 text-ink">
          ADMIN DASHBOARD
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadAllData()}
            className="border-4 border-ink bg-cyan px-3 py-2 font-press-start text-[9px] leading-4 text-ink"
          >
            REFRESH
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="border-4 border-ink bg-yellow px-3 py-2 font-press-start text-[9px] leading-4 text-ink"
          >
            LOG OUT
          </button>
        </div>
      </section>

      {loading ? (
        <p className="font-press-start text-[9px] leading-4 text-ink">
          Refreshing...
        </p>
      ) : null}
      {actionMessage ? (
        <p className="border-2 border-ink bg-green-100 px-2 py-2 font-press-start text-[9px] leading-4 text-green-800">
          {actionMessage}
        </p>
      ) : null}
      {globalError ? (
        <p className="border-2 border-ink bg-red-100 px-2 py-2 font-press-start text-[9px] leading-4 text-red-800">
          {globalError}
        </p>
      ) : null}

      <section className="grid gap-3 border-4 border-ink bg-white p-4 shadow-retro-sm">
        <h2 className="font-press-start text-[11px] leading-5 text-ink">
          MENU
        </h2>
        <form className="grid gap-2 md:grid-cols-2" onSubmit={submitMenuForm}>
          <input
            placeholder="Slug"
            value={menuForm.slug}
            onChange={(event) =>
              setMenuForm((prev) => ({ ...prev, slug: event.target.value }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <input
            placeholder="Title"
            value={menuForm.title}
            onChange={(event) =>
              setMenuForm((prev) => ({ ...prev, title: event.target.value }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <input
            placeholder="Price (minor)"
            type="number"
            min={0}
            value={menuForm.priceMinor}
            onChange={(event) =>
              setMenuForm((prev) => ({
                ...prev,
                priceMinor: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <select
            value={menuForm.category}
            onChange={(event) =>
              setMenuForm((prev) => ({ ...prev, category: event.target.value }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          >
            {MENU_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            placeholder="Card color (optional)"
            value={menuForm.cardColor}
            onChange={(event) =>
              setMenuForm((prev) => ({
                ...prev,
                cardColor: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <input
            placeholder="Title color (optional)"
            value={menuForm.titleColor}
            onChange={(event) =>
              setMenuForm((prev) => ({
                ...prev,
                titleColor: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <textarea
            placeholder="Description"
            value={menuForm.description}
            onChange={(event) =>
              setMenuForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
            className="md:col-span-2 border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <label className="flex items-center gap-2 font-press-start text-[9px] leading-4 text-ink">
            <input
              type="checkbox"
              checked={menuForm.isFeatured}
              onChange={(event) =>
                setMenuForm((prev) => ({
                  ...prev,
                  isFeatured: event.target.checked,
                }))
              }
            />
            FEATURED
          </label>
          <label className="flex items-center gap-2 font-press-start text-[9px] leading-4 text-ink">
            <input
              type="checkbox"
              checked={menuForm.isMostPopular}
              onChange={(event) =>
                setMenuForm((prev) => ({
                  ...prev,
                  isMostPopular: event.target.checked,
                }))
              }
            />
            MOST POPULAR
          </label>
          <label className="flex items-center gap-2 font-press-start text-[9px] leading-4 text-ink">
            <input
              type="checkbox"
              checked={menuForm.isActive}
              onChange={(event) =>
                setMenuForm((prev) => ({
                  ...prev,
                  isActive: event.target.checked,
                }))
              }
            />
            ACTIVE
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={isMutating}
              className="border-4 border-ink bg-yellow px-3 py-2 font-press-start text-[9px] leading-4 text-ink disabled:opacity-60"
            >
              {editingMenuId ? "UPDATE MENU ITEM" : "CREATE MENU ITEM"}
            </button>
            {editingMenuId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingMenuId(null);
                  setMenuForm(initialMenuForm);
                }}
                className="border-4 border-ink bg-cyan px-3 py-2 font-press-start text-[9px] leading-4 text-ink"
              >
                CANCEL EDIT
              </button>
            ) : null}
          </div>
        </form>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="grid gap-2 border-2 border-ink bg-canvas p-2 md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="font-press-start text-[9px] leading-4 text-ink">
                  {item.title} ({item.slug}) -{" "}
                  {formatMenuPriceYen(item.priceMinor)}
                </p>
                <p className="font-press-start text-[8px] leading-4 text-ink/70">
                  {item.category} | {item.isActive ? "ACTIVE" : "INACTIVE"} |{" "}
                  {item.isFeatured ? "FEATURED" : "NOT FEATURED"} |{" "}
                  {item.isMostPopular ? "MOST POPULAR" : "REGULAR"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMenuId(item.id);
                    setMenuForm({
                      slug: item.slug,
                      title: item.title,
                      description: item.description,
                      priceMinor: String(item.priceMinor),
                      category: item.category,
                      cardColor: item.cardColor ?? "",
                      titleColor: item.titleColor ?? "",
                      isFeatured: item.isFeatured,
                      isMostPopular: item.isMostPopular,
                      isActive: item.isActive,
                    });
                  }}
                  className="border-2 border-ink bg-white px-2 py-1 font-press-start text-[8px] leading-4 text-ink"
                >
                  EDIT
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void performAction(async () => {
                      const response = await fetch(
                        `/api/admin/menu/${encodeURIComponent(item.id)}`,
                        { method: "DELETE", credentials: "include" },
                      );
                      if (!response.ok) {
                        throw new Error(
                          await parseError(
                            response,
                            "Failed to delete menu item.",
                          ),
                        );
                      }
                    })
                  }
                  className="border-2 border-ink bg-red-100 px-2 py-1 font-press-start text-[8px] leading-4 text-red-800"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 border-4 border-ink bg-white p-4 shadow-retro-sm">
        <h2 className="font-press-start text-[11px] leading-5 text-ink">
          LIMITED OFFERS
        </h2>
        <form className="grid gap-2 md:grid-cols-2" onSubmit={submitOfferForm}>
          <input
            placeholder="Name"
            value={offerForm.name}
            onChange={(event) =>
              setOfferForm((prev) => ({ ...prev, name: event.target.value }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <input
            placeholder="Image URL (optional)"
            value={offerForm.image}
            onChange={(event) =>
              setOfferForm((prev) => ({ ...prev, image: event.target.value }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <select
            value={offerForm.durationMode}
            onChange={(event) =>
              setOfferForm((prev) => ({
                ...prev,
                durationMode: event.target.value as "TIME" | "CAPACITY",
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          >
            <option value="TIME">TIME</option>
            <option value="CAPACITY">CAPACITY</option>
          </select>
          <select
            value={offerForm.discountType}
            onChange={(event) =>
              setOfferForm((prev) => ({
                ...prev,
                discountType: event.target.value as
                  | "PERCENTAGE"
                  | "FIXED_AMOUNT",
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          >
            <option value="PERCENTAGE">PERCENTAGE</option>
            <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
          </select>
          <input
            type="number"
            min={0}
            placeholder="Discount value"
            value={offerForm.discountValue}
            onChange={(event) =>
              setOfferForm((prev) => ({
                ...prev,
                discountValue: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <input
            type="datetime-local"
            value={offerForm.availabilityStart}
            onChange={(event) =>
              setOfferForm((prev) => ({
                ...prev,
                availabilityStart: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <input
            type="datetime-local"
            value={offerForm.availabilityEnd}
            onChange={(event) =>
              setOfferForm((prev) => ({
                ...prev,
                availabilityEnd: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <input
            type="number"
            min={1}
            placeholder="Max redemptions (capacity mode)"
            value={offerForm.maxRedemptions}
            onChange={(event) =>
              setOfferForm((prev) => ({
                ...prev,
                maxRedemptions: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <textarea
            placeholder="Description"
            value={offerForm.description}
            onChange={(event) =>
              setOfferForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
            className="md:col-span-2 border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <textarea
            placeholder="Offer items as menuItemId:qty comma separated"
            value={offerForm.items}
            onChange={(event) =>
              setOfferForm((prev) => ({ ...prev, items: event.target.value }))
            }
            className="md:col-span-2 border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <label className="flex items-center gap-2 font-press-start text-[9px] leading-4 text-ink">
            <input
              type="checkbox"
              checked={offerForm.isActive}
              onChange={(event) =>
                setOfferForm((prev) => ({
                  ...prev,
                  isActive: event.target.checked,
                }))
              }
            />
            ACTIVE
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={isMutating}
              className="border-4 border-ink bg-yellow px-3 py-2 font-press-start text-[9px] leading-4 text-ink disabled:opacity-60"
            >
              {editingOfferId ? "UPDATE OFFER" : "CREATE OFFER"}
            </button>
            {editingOfferId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingOfferId(null);
                  setOfferForm(initialOfferForm);
                }}
                className="border-4 border-ink bg-cyan px-3 py-2 font-press-start text-[9px] leading-4 text-ink"
              >
                CANCEL EDIT
              </button>
            ) : null}
          </div>
        </form>

        <div className="space-y-2">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="grid gap-2 border-2 border-ink bg-canvas p-2 md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="font-press-start text-[9px] leading-4 text-ink">
                  {offer.name} ({offer.discountType}:{offer.discountValue}) -{" "}
                  {offer.isActive ? "ACTIVE" : "INACTIVE"}
                </p>
                <p className="font-press-start text-[8px] leading-4 text-ink/70">
                  Mode: {offer.durationMode} | Used: {offer.redemptionsUsed} /{" "}
                  {offer.maxRedemptions ?? "N/A"} | Items: {offer.items.length}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingOfferId(offer.id);
                    setOfferForm({
                      name: offer.name,
                      description: offer.description,
                      image: offer.image ?? "",
                      durationMode: offer.durationMode,
                      availabilityStart: new Date(offer.availabilityStart)
                        .toISOString()
                        .slice(0, 16),
                      availabilityEnd: offer.availabilityEnd
                        ? new Date(offer.availabilityEnd)
                            .toISOString()
                            .slice(0, 16)
                        : "",
                      maxRedemptions: offer.maxRedemptions
                        ? String(offer.maxRedemptions)
                        : "",
                      isActive: offer.isActive,
                      discountType: offer.discountType,
                      discountValue: String(offer.discountValue),
                      items: offer.items
                        .map((item) => `${item.menuItemId}:${item.quantity}`)
                        .join(","),
                    });
                  }}
                  className="border-2 border-ink bg-white px-2 py-1 font-press-start text-[8px] leading-4 text-ink"
                >
                  EDIT
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void performAction(async () => {
                      const response = await fetch(
                        `/api/admin/offers/${encodeURIComponent(offer.id)}`,
                        { method: "DELETE", credentials: "include" },
                      );
                      if (!response.ok) {
                        throw new Error(
                          await parseError(response, "Failed to delete offer."),
                        );
                      }
                    })
                  }
                  className="border-2 border-ink bg-red-100 px-2 py-1 font-press-start text-[8px] leading-4 text-red-800"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
          <p className="font-press-start text-[8px] leading-4 text-ink/70">
            Active offer: {activeOfferId ?? "none"}
          </p>
        </div>
      </section>

      <section className="grid gap-3 border-4 border-ink bg-white p-4 shadow-retro-sm">
        <h2 className="font-press-start text-[11px] leading-5 text-ink">
          ORDERS
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={orderStatusFilter}
            onChange={(event) => setOrderStatusFilter(event.target.value)}
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          >
            <option value="">ALL STATUSES</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void loadAllData(orderStatusFilter)}
            className="border-4 border-ink bg-cyan px-3 py-2 font-press-start text-[9px] leading-4 text-ink"
          >
            APPLY FILTER
          </button>
        </div>
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="border-2 border-ink bg-canvas p-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedOrderId((current) =>
                      current === order.id ? null : order.id,
                    )
                  }
                  aria-expanded={expandedOrderId === order.id}
                  className="text-left font-press-start text-[9px] leading-4 text-ink"
                >
                  {order.id} - {order.status} -{" "}
                  {formatMenuPriceYen(order.totalMinor)}
                  <span className="ml-2 text-[8px] text-ink/70">
                    {expandedOrderId === order.id
                      ? "(hide details)"
                      : "(show details)"}
                  </span>
                </button>
                <select
                  value={order.status}
                  onChange={(event) =>
                    void performAction(async () => {
                      const response = await fetch(
                        `/api/admin/orders/${encodeURIComponent(order.id)}/status`,
                        {
                          method: "PATCH",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: event.target.value }),
                        },
                      );
                      if (!response.ok) {
                        throw new Error(
                          await parseError(
                            response,
                            "Failed to update order status.",
                          ),
                        );
                      }
                    })
                  }
                  className="border-2 border-ink px-2 py-1 font-press-start text-[8px] leading-4"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 font-press-start text-[8px] leading-4 text-ink/70">
                {order.customerName} | {order.customerPhone} |{" "}
                {order.streetAddress}, {order.city}
              </p>
              {expandedOrderId === order.id ? (
                <div className="mt-2 space-y-2 border-t border-dashed border-ink pt-2">
                  <p className="font-press-start text-[8px] leading-4 text-ink">
                    ITEMS
                  </p>
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-2 font-press-start text-[8px] leading-4 text-ink"
                      >
                        <span className="max-w-[70%] truncate">
                          {item.menuItemTitle} x{item.quantity}
                        </span>
                        <span>{formatMenuPriceYen(item.lineTotalMinor)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between font-press-start text-[8px] leading-4 text-ink">
                      <span>SUBTOTAL</span>
                      <span>{formatMenuPriceYen(order.subtotalMinor)}</span>
                    </div>
                    <div className="flex items-center justify-between font-press-start text-[8px] leading-4 text-ink">
                      <span>DISCOUNT</span>
                      <span>
                        {order.discountMinor > 0
                          ? `-${formatMenuPriceYen(order.discountMinor)}`
                          : formatMenuPriceYen(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void performAction(async () => {
                      const response = await fetch(
                        `/api/admin/orders/${encodeURIComponent(order.id)}/cancel`,
                        { method: "POST", credentials: "include" },
                      );
                      if (!response.ok) {
                        throw new Error(
                          await parseError(response, "Failed to cancel order."),
                        );
                      }
                    })
                  }
                  className="border-2 border-ink bg-yellow px-2 py-1 font-press-start text-[8px] leading-4 text-ink"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void performAction(async () => {
                      const response = await fetch(
                        `/api/admin/orders/${encodeURIComponent(order.id)}`,
                        { method: "DELETE", credentials: "include" },
                      );
                      if (!response.ok) {
                        throw new Error(
                          await parseError(response, "Failed to delete order."),
                        );
                      }
                    })
                  }
                  className="border-2 border-ink bg-red-100 px-2 py-1 font-press-start text-[8px] leading-4 text-red-800"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 border-4 border-ink bg-white p-4 shadow-retro-sm">
        <h2 className="font-press-start text-[11px] leading-5 text-ink">
          STATS
        </h2>
        {stats ? (
          <p className="font-press-start text-[8px] leading-4 text-ink/70">
            Current: cups {stats.dailyCups}, vinyl {stats.vinylSpins}, arcade{" "}
            {stats.arcade}, combo {stats.comboRate}
          </p>
        ) : null}
        <form
          className="grid gap-2 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            void performAction(async () => {
              const response = await fetch("/api/admin/stats", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  dailyCups: Number(statsForm.dailyCups),
                  vinylSpins: Number(statsForm.vinylSpins),
                  arcade: Number(statsForm.arcade),
                  comboRate: Number(statsForm.comboRate),
                }),
              });
              if (!response.ok) {
                throw new Error(
                  await parseError(response, "Failed to update stats."),
                );
              }
            });
          }}
        >
          <input
            type="number"
            value={statsForm.dailyCups}
            onChange={(event) =>
              setStatsForm((prev) => ({
                ...prev,
                dailyCups: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <input
            type="number"
            value={statsForm.vinylSpins}
            onChange={(event) =>
              setStatsForm((prev) => ({
                ...prev,
                vinylSpins: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <input
            type="number"
            value={statsForm.arcade}
            onChange={(event) =>
              setStatsForm((prev) => ({ ...prev, arcade: event.target.value }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <input
            type="number"
            value={statsForm.comboRate}
            onChange={(event) =>
              setStatsForm((prev) => ({
                ...prev,
                comboRate: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <button
            type="submit"
            disabled={isMutating}
            className="md:col-span-4 border-4 border-ink bg-yellow px-3 py-2 font-press-start text-[9px] leading-4 text-ink disabled:opacity-60"
          >
            OVERWRITE STATS
          </button>
        </form>

        <form
          className="grid gap-2 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            void performAction(async () => {
              const response = await fetch("/api/admin/stats/adjust", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  dailyCupsDelta: Number(statsAdjustmentForm.dailyCupsDelta),
                  vinylSpinsDelta: Number(statsAdjustmentForm.vinylSpinsDelta),
                  arcadeDelta: Number(statsAdjustmentForm.arcadeDelta),
                  comboRateDelta: Number(statsAdjustmentForm.comboRateDelta),
                }),
              });
              if (!response.ok) {
                throw new Error(
                  await parseError(response, "Failed to adjust stats."),
                );
              }
            });
          }}
        >
          <input
            type="number"
            value={statsAdjustmentForm.dailyCupsDelta}
            onChange={(event) =>
              setStatsAdjustmentForm((prev) => ({
                ...prev,
                dailyCupsDelta: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <input
            type="number"
            value={statsAdjustmentForm.vinylSpinsDelta}
            onChange={(event) =>
              setStatsAdjustmentForm((prev) => ({
                ...prev,
                vinylSpinsDelta: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <input
            type="number"
            value={statsAdjustmentForm.arcadeDelta}
            onChange={(event) =>
              setStatsAdjustmentForm((prev) => ({
                ...prev,
                arcadeDelta: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <input
            type="number"
            value={statsAdjustmentForm.comboRateDelta}
            onChange={(event) =>
              setStatsAdjustmentForm((prev) => ({
                ...prev,
                comboRateDelta: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
          />
          <button
            type="submit"
            disabled={isMutating}
            className="md:col-span-4 border-4 border-ink bg-cyan px-3 py-2 font-press-start text-[9px] leading-4 text-ink disabled:opacity-60"
          >
            APPLY DELTA
          </button>
        </form>
      </section>

      <section className="grid gap-3 border-4 border-ink bg-white p-4 shadow-retro-sm">
        <h2 className="font-press-start text-[11px] leading-5 text-ink">
          LOCATION / STORY CONTENT
        </h2>
        <form
          className="grid gap-2 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void performAction(async () => {
              const response = await fetch("/api/admin/site-content", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(siteForm),
              });
              if (!response.ok) {
                throw new Error(
                  await parseError(response, "Failed to update site content."),
                );
              }
            });
          }}
        >
          <input
            placeholder="Manga session label"
            value={siteForm.mangaSessionLabel}
            onChange={(event) =>
              setSiteForm((prev) => ({
                ...prev,
                mangaSessionLabel: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <input
            placeholder="Manga session headline"
            value={siteForm.mangaSessionHeadline}
            onChange={(event) =>
              setSiteForm((prev) => ({
                ...prev,
                mangaSessionHeadline: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <textarea
            placeholder="Manga session description"
            value={siteForm.mangaSessionDescription}
            onChange={(event) =>
              setSiteForm((prev) => ({
                ...prev,
                mangaSessionDescription: event.target.value,
              }))
            }
            className="md:col-span-2 border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <input
            placeholder="Location label"
            value={siteForm.locationLabel}
            onChange={(event) =>
              setSiteForm((prev) => ({
                ...prev,
                locationLabel: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <input
            placeholder="Location address"
            value={siteForm.locationAddress}
            onChange={(event) =>
              setSiteForm((prev) => ({
                ...prev,
                locationAddress: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <input
            placeholder="Hours line one"
            value={siteForm.hoursLineOne}
            onChange={(event) =>
              setSiteForm((prev) => ({
                ...prev,
                hoursLineOne: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <input
            placeholder="Hours line two"
            value={siteForm.hoursLineTwo}
            onChange={(event) =>
              setSiteForm((prev) => ({
                ...prev,
                hoursLineTwo: event.target.value,
              }))
            }
            className="border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <input
            placeholder="Directions URL"
            value={siteForm.directionsUrl}
            onChange={(event) =>
              setSiteForm((prev) => ({
                ...prev,
                directionsUrl: event.target.value,
              }))
            }
            className="md:col-span-2 border-2 border-ink px-2 py-2 font-press-start text-[9px] leading-4"
            required
          />
          <button
            type="submit"
            disabled={isMutating}
            className="md:col-span-2 border-4 border-ink bg-yellow px-3 py-2 font-press-start text-[9px] leading-4 text-ink disabled:opacity-60"
          >
            SAVE SITE CONTENT
          </button>
        </form>
      </section>
    </main>
  );
}
