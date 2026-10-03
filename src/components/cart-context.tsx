"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { generateQuoteNumber } from "@/lib/quote-number";

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
  /**
   * Identificador provisional de esta cotización (ver src/lib/quote-number.ts).
   * Se genera una vez por cotización y se mantiene mientras haya productos.
   */
  quoteNumber: string;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tecnova_cotizacion";

/**
 * La Fase 3 guardaba solo el arreglo de productos en localStorage.
 * Esta función acepta esa forma antigua (un arreglo) además de la nueva
 * ({items, customer}), para no perder cotizaciones ya guardadas en el
 * navegador del cliente.
 */
function parseStored(raw: string): { items: CartItem[]; customer: Customer; quoteNumber: string } {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return { items: parsed, customer: EMPTY_CUSTOMER, quoteNumber: "" };
  return {
    items: Array.isArray(parsed?.items) ? parsed.items : [],
    customer: { ...EMPTY_CUSTOMER, ...(parsed?.customer ?? {}) },
    quoteNumber: typeof parsed?.quoteNumber === "string" ? parsed.quoteNumber : "",
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomerState] = useState<Customer>(EMPTY_CUSTOMER);
  const [quoteNumber, setQuoteNumber] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = parseStored(raw);
        // Hidratar desde localStorage al montar es uno de los pocos usos
        // legítimos de setState dentro de un efecto: no hay forma de leer
        // localStorage durante el render en el servidor.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(stored.items);
        setCustomerState(stored.customer);
        if (stored.items.length > 0) {
          setQuoteNumber(stored.quoteNumber || generateQuoteNumber());
        }
      }
    } catch {
      // Si el dato guardado está corrupto, empezamos con una cotización vacía.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, customer, quoteNumber }));
    } catch {
      // Sin espacio o sin almacenamiento disponible: la cotización sigue
      // funcionando en memoria durante esta visita.
    }
  }, [items, customer, quoteNumber, hydrated]);

  // Cuando la cotización pasa de vacía a tener productos (o viceversa), el
  // número de cotización se genera o se limpia en el mismo evento que
  // provoca el cambio — no en un efecto aparte — para no encadenar renders.
  const setQty = useCallback(
    (productId: string, name: string, qty: number) => {
      const next =
        qty <= 0
          ? items.filter((i) => i.productId !== productId)
          : items.some((i) => i.productId === productId)
            ? items.map((i) => (i.productId === productId ? { ...i, qty, name } : i))
            : [...items, { productId, name, qty }];
      setItems(next);
      if (next.length === 0) setQuoteNumber("");
      else if (!quoteNumber) setQuoteNumber(generateQuoteNumber());
    },
    [items, quoteNumber],
  );

  const removeItem = useCallback(
    (productId: string) => {
      const next = items.filter((i) => i.productId !== productId);
      setItems(next);
      if (next.length === 0) setQuoteNumber("");
    },
    [items],
  );

  const setCustomer = useCallback((patch: Partial<Customer>) => {
    setCustomerState((prev) => ({ ...prev, ...patch }));
  }, []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, totalCount, setQty, removeItem, customer, setCustomer, quoteNumber }),
    [items, totalCount, setQty, removeItem, customer, setCustomer, quoteNumber],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return ctx;
}
