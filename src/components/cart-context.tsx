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

export type Customer = {
  nombre: string;
  telefono: string;
  direccion: string;
  departamento: string;
  municipio: string;
};

const EMPTY_CUSTOMER: Customer = {
  nombre: "",
  telefono: "",
  direccion: "",
  departamento: "",
  municipio: "",
};

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  setQty: (productId: string, name: string, qty: number) => void;
  removeItem: (productId: string) => void;
  customer: Customer;
  setCustomer: (patch: Partial<Customer>) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tecnova_cotizacion";

/**
 * La Fase 3 guardaba solo el arreglo de productos en localStorage.
 * Esta función acepta esa forma antigua (un arreglo) además de la nueva
 * ({items, customer}), para no perder cotizaciones ya guardadas en el
 * navegador del cliente.
 */
function parseStored(raw: string): { items: CartItem[]; customer: Customer } {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return { items: parsed, customer: EMPTY_CUSTOMER };
  return {
    items: Array.isArray(parsed?.items) ? parsed.items : [],
    customer: { ...EMPTY_CUSTOMER, ...(parsed?.customer ?? {}) },
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomerState] = useState<Customer>(EMPTY_CUSTOMER);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { items: storedItems, customer: storedCustomer } = parseStored(raw);
        // Hidratar desde localStorage al montar es uno de los pocos usos
        // legítimos de setState dentro de un efecto: no hay forma de leer
        // localStorage durante el render en el servidor.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(storedItems);
        setCustomerState(storedCustomer);
      }
    } catch {
      // Si el dato guardado está corrupto, empezamos con una cotización vacía.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, customer }));
    } catch {
      // Sin espacio o sin almacenamiento disponible: la cotización sigue
      // funcionando en memoria durante esta visita.
    }
  }, [items, customer, hydrated]);

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

  const setCustomer = useCallback((patch: Partial<Customer>) => {
    setCustomerState((prev) => ({ ...prev, ...patch }));
  }, []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, totalCount, setQty, removeItem, customer, setCustomer }),
    [items, totalCount, setQty, removeItem, customer, setCustomer],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return ctx;
}
