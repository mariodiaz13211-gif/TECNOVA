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

/** Cotización ya registrada en PostgreSQL (ver saveQuotation en el servidor). */
export type SavedQuotationRef = {
  id: string;
  number: string;
  /** Huella de los productos+datos del cliente con los que se guardó (ver src/lib/quote-signature.ts). */
  signature: string;
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
  savedQuotation: SavedQuotationRef | null;
  setSavedQuotation: (ref: SavedQuotationRef | null) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tecnova_cotizacion";

/**
 * Formas antiguas que ya pudieron quedar guardadas en el navegador de un
 * cliente: un arreglo plano (Fase 3) o {items, customer, quoteNumber}
 * (Fase 5, con un número generado en el navegador que ya no se usa). Ambas
 * se migran sin perder los productos ni los datos del cliente.
 */
function parseStored(raw: string): {
  items: CartItem[];
  customer: Customer;
  savedQuotation: SavedQuotationRef | null;
} {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return { items: parsed, customer: EMPTY_CUSTOMER, savedQuotation: null };
  const saved = parsed?.savedQuotation;
  return {
    items: Array.isArray(parsed?.items) ? parsed.items : [],
    customer: { ...EMPTY_CUSTOMER, ...(parsed?.customer ?? {}) },
    savedQuotation:
      saved && typeof saved.id === "string" && typeof saved.number === "string"
        ? { id: saved.id, number: saved.number, signature: saved.signature ?? "" }
        : null,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomerState] = useState<Customer>(EMPTY_CUSTOMER);
  const [savedQuotation, setSavedQuotationState] = useState<SavedQuotationRef | null>(null);
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
        setSavedQuotationState(stored.items.length > 0 ? stored.savedQuotation : null);
      }
    } catch {
      // Si el dato guardado está corrupto, empezamos con una cotización vacía.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, customer, savedQuotation }));
    } catch {
      // Sin espacio o sin almacenamiento disponible: la cotización sigue
      // funcionando en memoria durante esta visita.
    }
  }, [items, customer, savedQuotation, hydrated]);

  // Si la cotización se vacía, una referencia guardada previamente ya no
  // aplica — la próxima vez que se guarde será una cotización distinta.
  const setQty = useCallback(
    (productId: string, name: string, qty: number) => {
      const next =
        qty <= 0
          ? items.filter((i) => i.productId !== productId)
          : items.some((i) => i.productId === productId)
            ? items.map((i) => (i.productId === productId ? { ...i, qty, name } : i))
            : [...items, { productId, name, qty }];
      setItems(next);
      if (next.length === 0) setSavedQuotationState(null);
    },
    [items],
  );

  const removeItem = useCallback(
    (productId: string) => {
      const next = items.filter((i) => i.productId !== productId);
      setItems(next);
      if (next.length === 0) setSavedQuotationState(null);
    },
    [items],
  );

  const setCustomer = useCallback((patch: Partial<Customer>) => {
    setCustomerState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setSavedQuotation = useCallback((ref: SavedQuotationRef | null) => {
    setSavedQuotationState(ref);
  }, []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      totalCount,
      setQty,
      removeItem,
      customer,
      setCustomer,
      savedQuotation,
      setSavedQuotation,
    }),
    [items, totalCount, setQty, removeItem, customer, setCustomer, savedQuotation, setSavedQuotation],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return ctx;
}
