"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  name: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  setQty: (productId: string, name: string, qty: number) => void;
  removeItem: (productId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tecnova_cotizacion";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // Hidratar desde localStorage al montar es uno de los pocos usos
      // legítimos de setState dentro de un efecto: no hay forma de leer
      // localStorage durante el render en el servidor.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Si el dato guardado está corrupto, empezamos con una cotización vacía.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Sin espacio o sin almacenamiento disponible: la cotización sigue
      // funcionando en memoria durante esta visita.
    }
  }, [items, hydrated]);

  const setQty = useCallback((productId: string, name: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.productId !== productId);
      const exists = prev.some((i) => i.productId === productId);
      if (!exists) return [...prev, { productId, name, qty }];
      return prev.map((i) => (i.productId === productId ? { ...i, qty, name } : i));
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, totalCount, setQty, removeItem }),
    [items, totalCount, setQty, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return ctx;
}
