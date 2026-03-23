"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

export type CartLineItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
};

export type OfferLineItem = {
  menuItemId: string;
  title: string;
  quantity: number;
  priceMinor: number;
};

export type AppliedOffer = {
  id: string;
  name: string;
  description: string;
  items: OfferLineItem[];
  /** Matches Prisma `DiscountType` */
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
};

/** Mirrors discount logic in `src/server/routes/orders.ts` */
export const computeOfferDiscountMinor = (
  subtotalMinor: number,
  offer: AppliedOffer | null,
): number => {
  if (!offer || subtotalMinor <= 0) return 0;
  let discountMinor = 0;
  if (offer.discountType === "PERCENTAGE") {
    discountMinor = Math.floor((subtotalMinor * offer.discountValue) / 100);
  } else {
    discountMinor = offer.discountValue;
  }
  return Math.max(0, Math.min(discountMinor, subtotalMinor));
};

type CartState = {
  items: CartLineItem[];
  appliedOfferId: string | null;
  appliedOffer: AppliedOffer | null;
};

type CartContextValue = {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  appliedOfferId: string | null;
  appliedOffer: AppliedOffer | null;
  addItem: (item: Omit<CartLineItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyOffer: (offer: AppliedOffer) => void;
  setOfferSelection: (offerId: string | null) => void;
};

type CartAction =
  | { type: "hydrate"; payload: CartState }
  | {
      type: "add-item";
      payload: Omit<CartLineItem, "quantity"> & { quantity: number };
    }
  | { type: "remove-item"; payload: { id: string } }
  | { type: "set-quantity"; payload: { id: string; quantity: number } }
  | { type: "clear-cart" }
  | { type: "set-offer"; payload: { offerId: string | null } }
  | { type: "set-offer-meta"; payload: { offer: AppliedOffer | null } }
  | { type: "apply-offer-bundle"; payload: { offer: AppliedOffer } };

const CART_STORAGE_KEY = "retrograde-cart";
const OFFER_STORAGE_KEY = "retrograde-cart-offer-id";
const OFFER_META_STORAGE_KEY = "retrograde-cart-offer-meta";

const CartContext = createContext<CartContextValue | null>(null);

const sanitizeItems = (items: unknown): CartLineItem[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const maybe = item as Partial<CartLineItem>;
      if (
        typeof maybe.id !== "string" ||
        typeof maybe.title !== "string" ||
        typeof maybe.price !== "number" ||
        typeof maybe.quantity !== "number"
      ) {
        return null;
      }
      return {
        id: maybe.id,
        title: maybe.title,
        price: maybe.price,
        quantity: Math.max(1, Math.floor(maybe.quantity)),
      };
    })
    .filter((item): item is CartLineItem => item !== null);
};

const sanitizeOfferItems = (items: unknown): OfferLineItem[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const maybe = item as Partial<OfferLineItem>;
      if (
        typeof maybe.menuItemId !== "string" ||
        typeof maybe.title !== "string" ||
        typeof maybe.quantity !== "number" ||
        typeof maybe.priceMinor !== "number"
      ) {
        return null;
      }
      return {
        menuItemId: maybe.menuItemId,
        title: maybe.title,
        quantity: Math.max(1, Math.floor(maybe.quantity)),
        priceMinor: maybe.priceMinor,
      };
    })
    .filter((item): item is OfferLineItem => item !== null);
};

const sanitizeAppliedOffer = (offer: unknown): AppliedOffer | null => {
  if (!offer || typeof offer !== "object") return null;
  const maybe = offer as Partial<AppliedOffer>;
  if (
    typeof maybe.id !== "string" ||
    typeof maybe.name !== "string" ||
    typeof maybe.description !== "string"
  ) {
    return null;
  }
  const discountType =
    maybe.discountType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE";
  const discountValue =
    typeof maybe.discountValue === "number" &&
    Number.isFinite(maybe.discountValue)
      ? Math.max(0, Math.floor(maybe.discountValue))
      : 0;
  return {
    id: maybe.id,
    name: maybe.name,
    description: maybe.description,
    items: sanitizeOfferItems(maybe.items),
    discountType,
    discountValue,
  };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "add-item": {
      const { id, quantity, price, title } = action.payload;
      const existing = state.items.find((item) => item.id === id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { id, title, price, quantity }],
      };
    }
    case "remove-item":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    case "set-quantity":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload.id
              ? {
                  ...item,
                  quantity: Math.max(0, Math.floor(action.payload.quantity)),
                }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };
    case "clear-cart":
      return { items: [], appliedOfferId: null, appliedOffer: null };
    case "set-offer":
      return {
        ...state,
        appliedOfferId: action.payload.offerId,
        appliedOffer:
          action.payload.offerId &&
          state.appliedOffer?.id === action.payload.offerId
            ? state.appliedOffer
            : null,
      };
    case "set-offer-meta":
      return {
        ...state,
        appliedOffer: action.payload.offer,
        appliedOfferId: action.payload.offer?.id ?? null,
      };
    case "apply-offer-bundle": {
      const { offer } = action.payload;
      const bundleIds = new Set(offer.items.map((line) => line.menuItemId));
      const withoutBundle = state.items.filter(
        (item) => !bundleIds.has(item.id),
      );
      const nextItems = [...withoutBundle];
      for (const line of offer.items) {
        nextItems.push({
          id: line.menuItemId,
          title: line.title,
          price: line.priceMinor,
          quantity: line.quantity,
        });
      }
      return {
        ...state,
        items: nextItems,
        appliedOffer: offer,
        appliedOfferId: offer.id,
      };
    }
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  appliedOfferId: null,
  appliedOffer: null,
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const storedItemsRaw = window.localStorage.getItem(CART_STORAGE_KEY);
    const storedOfferId = window.localStorage.getItem(OFFER_STORAGE_KEY);
    const storedOfferMetaRaw = window.localStorage.getItem(
      OFFER_META_STORAGE_KEY,
    );
    if (!storedItemsRaw && !storedOfferId) return;

    try {
      const parsedItems = storedItemsRaw
        ? (JSON.parse(storedItemsRaw) as unknown)
        : [];
      const parsedOfferMeta = storedOfferMetaRaw
        ? sanitizeAppliedOffer(JSON.parse(storedOfferMetaRaw) as unknown)
        : null;
      dispatch({
        type: "hydrate",
        payload: {
          items: sanitizeItems(parsedItems),
          appliedOfferId: storedOfferId ?? null,
          appliedOffer:
            parsedOfferMeta && parsedOfferMeta.id === storedOfferId
              ? parsedOfferMeta
              : null,
        },
      });
    } catch {
      dispatch({
        type: "hydrate",
        payload: {
          items: [],
          appliedOfferId: storedOfferId ?? null,
          appliedOffer: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  useEffect(() => {
    if (!state.appliedOfferId) {
      window.localStorage.removeItem(OFFER_STORAGE_KEY);
      window.localStorage.removeItem(OFFER_META_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(OFFER_STORAGE_KEY, state.appliedOfferId);
    if (state.appliedOffer && state.appliedOffer.id === state.appliedOfferId) {
      window.localStorage.setItem(
        OFFER_META_STORAGE_KEY,
        JSON.stringify(state.appliedOffer),
      );
    }
  }, [state.appliedOfferId, state.appliedOffer]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    const subtotal = state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    return {
      items: state.items,
      itemCount,
      subtotal,
      appliedOfferId: state.appliedOfferId,
      appliedOffer: state.appliedOffer,
      addItem: (item, quantity = 1) => {
        dispatch({
          type: "add-item",
          payload: {
            ...item,
            quantity: Math.max(1, Math.floor(quantity)),
          },
        });
      },
      removeItem: (id) => dispatch({ type: "remove-item", payload: { id } }),
      setQuantity: (id, quantity) =>
        dispatch({ type: "set-quantity", payload: { id, quantity } }),
      clearCart: () => dispatch({ type: "clear-cart" }),
      setOfferSelection: (offerId) =>
        dispatch({ type: "set-offer", payload: { offerId } }),
      applyOffer: (offer) => {
        dispatch({ type: "apply-offer-bundle", payload: { offer } });
      },
    };
  }, [state.appliedOffer, state.appliedOfferId, state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
