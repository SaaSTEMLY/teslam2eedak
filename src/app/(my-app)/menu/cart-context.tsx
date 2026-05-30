"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  addToCart,
  removeLine,
  setLineQuantity,
  totalQuantity,
  subtotalQirsh,
  EMPTY_CART,
  type CartLineSelection,
  type CartState,
} from "@/lib/ordering/cart-store";

const STORAGE_PREFIX = "kk-cart-v1";

function storageKey(scope: string): string {
  return `${STORAGE_PREFIX}:${scope}`;
}

function readStored(scope: string): CartState {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    const raw = window.localStorage.getItem(storageKey(scope));
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || !Array.isArray(parsed.lines)) return EMPTY_CART;
    return parsed;
  } catch {
    return EMPTY_CART;
  }
}

interface CartContextValue {
  state: CartState;
  add: (selection: CartLineSelection) => void;
  remove: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  totalQty: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  /** Scope key (e.g. `dine-in:table-X` or `pickup:maadi`) so different
   * carts don't interfere when a guest opens both modes. */
  scope: string;
  children: ReactNode;
}

export function CartProvider({ scope, children }: CartProviderProps) {
  const [state, setState] = useState<CartState>(EMPTY_CART);

  // Hydrate from localStorage on mount AND when scope changes.
  useEffect(() => {
    setState(readStored(scope));
  }, [scope]);

  // Persist on every change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey(scope), JSON.stringify(state));
    } catch {
      // Quota or disabled storage — ignore.
    }
  }, [scope, state]);

  const add = useCallback((selection: CartLineSelection) => {
    setState((prev) => addToCart(prev, selection));
  }, []);

  const remove = useCallback((lineId: string) => {
    setState((prev) => removeLine(prev, lineId));
  }, []);

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    setState((prev) => setLineQuantity(prev, lineId, quantity));
  }, []);

  const clear = useCallback(() => setState(EMPTY_CART), []);

  const value: CartContextValue = useMemo(
    () => ({
      state,
      add,
      remove,
      setQuantity,
      clear,
      totalQty: totalQuantity(state),
      subtotal: subtotalQirsh(state),
    }),
    [state, add, remove, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
