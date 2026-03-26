"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type AdminMenuItemCreateBody,
  type AdminOfferFormDraft,
  type AdminSiteContentPutBody,
  type AdminStatsAdjustPatchBody,
  type AdminStatsPutBody,
  adminMenuItemCreateBody,
  adminOfferFormDraftBody,
  adminSiteContentPutBody,
  adminStatsAdjustPatchBody,
  adminStatsPutBody,
} from "@/lib/form-schemas";
import {
  emptyMenuValues,
  emptyOfferDraftValues,
  emptySiteContentValues,
  type MenuItem,
  type Offer,
  type Order,
  parseError,
  type SiteContent,
  type Stats,
} from "./admin-dashboard-types";
import { AdminMenuSection } from "./admin-menu-section";
import { AdminOffersSection } from "./admin-offers-section";
import { AdminOrdersSection } from "./admin-orders-section";
import { AdminSiteSection } from "./admin-site-section";
import { AdminStatsSection } from "./admin-stats-section";

export default function AdminDashboard() {
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

  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "menu" | "offers" | "orders" | "stats" | "site"
  >("menu");

  const menu = useForm<AdminMenuItemCreateBody>({
    resolver: typeboxResolver(adminMenuItemCreateBody),
    defaultValues: emptyMenuValues(),
  });
  const offerDraft = useForm<AdminOfferFormDraft>({
    resolver: typeboxResolver(adminOfferFormDraftBody),
    defaultValues: emptyOfferDraftValues(),
  });
  const statsPut = useForm<AdminStatsPutBody>({
    resolver: typeboxResolver(adminStatsPutBody),
    defaultValues: {
      dailyCups: 0,
      vinylSpins: 0,
      arcade: 0,
      comboRate: 0,
    },
  });
  const statsAdjust = useForm<AdminStatsAdjustPatchBody>({
    resolver: typeboxResolver(adminStatsAdjustPatchBody),
    defaultValues: {
      dailyCupsDelta: 0,
      vinylSpinsDelta: 0,
      arcadeDelta: 0,
      comboRateDelta: 0,
    },
  });
  const siteContent = useForm<AdminSiteContentPutBody>({
    resolver: typeboxResolver(adminSiteContentPutBody),
    defaultValues: emptySiteContentValues(),
  });

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
      statsPut.reset({
        dailyCups: statsData.dailyCups,
        vinylSpins: statsData.vinylSpins,
        arcade: statsData.arcade,
        comboRate: statsData.comboRate,
      });
      siteContent.reset({
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
      const message =
        error instanceof Error ? error.message : "Failed to load dashboard.";
      setGlobalError(message);
      toast.error(message);
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

  const performAction = async (
    action: () => Promise<void>,
    options?: { successMessage?: string; errorMessage?: string },
  ) => {
    if (isMutating) return;
    setIsMutating(true);
    setGlobalError(null);

    try {
      await action();
      await loadAllData();
      toast.success(options?.successMessage ?? "Saved successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : (options?.errorMessage ?? "Action failed. Please retry.");
      setGlobalError(message);
      toast.error(message);
    } finally {
      setIsMutating(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      toast.success("Logged out.");
      router.replace("/admin/login");
    } catch {
      toast.error("Could not log out. Please try again.");
    }
  };

  const onSubmitMenu = menu.handleSubmit(async (values) => {
    await performAction(async () => {
      const payload = {
        slug: values.slug.trim(),
        title: values.title.trim(),
        description: values.description.trim(),
        priceMinor: values.priceMinor,
        category: values.category,
        cardColor: values.cardColor?.trim() || undefined,
        titleColor: values.titleColor?.trim() || undefined,
        isFeatured: values.isFeatured ?? false,
        isMostPopular: values.isMostPopular ?? false,
        isActive: values.isActive ?? true,
      };

      const response = await fetch("/api/admin/menu", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(
          await parseError(response, "Failed to save menu item."),
        );
      }

      menu.reset(emptyMenuValues());
    });
  });

  const onSubmitOffer = offerDraft.handleSubmit(async (values) => {
    await performAction(async () => {
      const rawItems = values.items
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
        name: values.name.trim(),
        description: values.description.trim(),
        image: values.image?.trim() || undefined,
        durationMode: values.durationMode,
        availabilityStart: new Date(values.availabilityStart).toISOString(),
        availabilityEnd: values.availabilityEnd?.trim()
          ? new Date(values.availabilityEnd).toISOString()
          : undefined,
        maxRedemptions:
          values.durationMode === "CAPACITY" && values.maxRedemptions?.trim()
            ? Number(values.maxRedemptions)
            : undefined,
        isActive: values.isActive,
        discountType: values.discountType,
        discountValue: values.discountValue,
        items,
      };

      const response = await fetch("/api/admin/offers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await parseError(response, "Failed to save offer."));
      }

      offerDraft.reset(emptyOfferDraftValues());
    });
  });

  const onSubmitStatsPut = statsPut.handleSubmit(async (values) => {
    await performAction(async () => {
      const response = await fetch("/api/admin/stats", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error(await parseError(response, "Failed to update stats."));
      }
    });
  });

  const onSubmitStatsAdjust = statsAdjust.handleSubmit(async (values) => {
    await performAction(async () => {
      const response = await fetch("/api/admin/stats/adjust", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error(await parseError(response, "Failed to adjust stats."));
      }
    });
  });

  const onSubmitSiteContent = siteContent.handleSubmit(async (values) => {
    await performAction(async () => {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error(
          await parseError(response, "Failed to update site content."),
        );
      }
    });
  });

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
          <Button
            type="button"
            variant="retro"
            onClick={() => void loadAllData()}
            className="border-4 bg-cyan px-3 py-2 font-press-start text-[9px] leading-4 text-ink"
          >
            REFRESH
          </Button>
          <Button
            type="button"
            variant="retro"
            onClick={() => void logout()}
            className="border-4 bg-yellow px-3 py-2 font-press-start text-[9px] leading-4 text-ink"
          >
            LOG OUT
          </Button>
        </div>
      </section>

      {loading ? (
        <p className="font-press-start text-[9px] leading-4 text-ink">
          Refreshing...
        </p>
      ) : null}
      {globalError ? (
        <p className="border-2 border-ink bg-red-100 px-2 py-2 font-press-start text-[9px] leading-4 text-red-800">
          {globalError}
        </p>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(tab) =>
          setActiveTab(tab as "menu" | "offers" | "orders" | "stats" | "site")
        }
        className="space-y-4"
      >
        <TabsList className="w-full border-4 border-ink bg-white p-3 shadow-retro-sm">
          <TabsTrigger value="menu">MENU</TabsTrigger>
          <TabsTrigger value="offers">OFFERS</TabsTrigger>
          <TabsTrigger value="orders">ORDERS</TabsTrigger>
          <TabsTrigger value="stats">STATS</TabsTrigger>
          <TabsTrigger value="site">SITE</TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <AdminMenuSection
            menu={menu}
            menuItems={menuItems}
            onSubmitMenu={onSubmitMenu}
            isMutating={isMutating}
            performAction={performAction}
          />
        </TabsContent>

        <TabsContent value="offers">
          <AdminOffersSection
            offerDraft={offerDraft}
            offers={offers}
            activeOfferId={activeOfferId}
            onSubmitOffer={onSubmitOffer}
            isMutating={isMutating}
            performAction={performAction}
          />
        </TabsContent>

        <TabsContent value="orders">
          <AdminOrdersSection
            orderStatusFilter={orderStatusFilter}
            setOrderStatusFilter={setOrderStatusFilter}
            orders={orders}
            expandedOrderId={expandedOrderId}
            setExpandedOrderId={setExpandedOrderId}
            loadAllData={loadAllData}
            performAction={performAction}
            isMutating={isMutating}
          />
        </TabsContent>

        <TabsContent value="stats">
          <AdminStatsSection
            stats={stats}
            statsPut={statsPut}
            statsAdjust={statsAdjust}
            onSubmitStatsPut={onSubmitStatsPut}
            onSubmitStatsAdjust={onSubmitStatsAdjust}
            isMutating={isMutating}
          />
        </TabsContent>

        <TabsContent value="site">
          <AdminSiteSection
            siteContent={siteContent}
            onSubmitSiteContent={onSubmitSiteContent}
            isMutating={isMutating}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
