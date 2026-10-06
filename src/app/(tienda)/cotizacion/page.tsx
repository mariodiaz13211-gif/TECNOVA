"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { formatUSD, unitPriceForQty } from "@/lib/pricing";
import { shippingFor, SHIPPING_COST, SHIPPING_FREE_FROM } from "@/lib/shipping";
import type { ProductSummary } from "@/lib/catalog-types";
import type { StoreSettings } from "@/lib/settings";
import { getCotizacionProducts, getPublicSettings } from "./actions";
import { QuoteItem } from "./quote-item";
import { CustomerForm } from "./customer-form";
import { QuoteActions } from "./quote-actions";

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "TECNOVA",
  whatsappNumber: "",
  shippingCost: SHIPPING_COST,
  freeShippingFrom: SHIPPING_FREE_FROM,
};

export default function CotizacionPage() {
  const { items, removeItem, customer } = useCart();
  const [productsById, setProductsById] = useState<Record<string, ProductSummary>>({});
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const ids = useMemo(() => items.map((i) => i.productId).sort().join(","), [items]);

  useEffect(() => {
    getPublicSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (!ids) {
      // No hay productos que consultar: limpiamos sincrónicamente para
      // que la pantalla de "cotización vacía" aparezca de inmediato.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProductsById({});
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCotizacionProducts(ids.split(",")).then((found) => {
      if (cancelled) return;
      setProductsById(Object.fromEntries(found.map((p) => [p.id, p])));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const validItems = items.filter((i) => productsById[i.productId]);
  const unavailableItems = items.filter((i) => !loading && !productsById[i.productId]);

  const subtotal = validItems.reduce((sum, i) => {
    const product = productsById[i.productId];
    return sum + unitPriceForQty(product, product.tiers, i.qty) * i.qty;
  }, 0);
  const shipping =
    validItems.length > 0 ? shippingFor(subtotal, settings.shippingCost, settings.freeShippingFrom) : 0;
  const total = subtotal + shipping;

  if (!loading && items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-paper">Tu cotización está vacía</h1>
        <p className="mt-2 text-sm text-silver">
          Agrega productos desde el catálogo para armar tu cotización.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-block rounded-sm bg-paper px-6 py-3 text-sm font-medium text-ink"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl text-paper">Mi cotización</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {loading ? (
            <p className="text-sm text-silver">Cargando tu cotización...</p>
          ) : (
            <>
              {unavailableItems.length > 0 && (
                <div className="mb-4 space-y-2">
                  {unavailableItems.map((i) => (
                    <div
                      key={i.productId}
                      className="flex items-center justify-between border border-line bg-panel/40 px-4 py-3 text-sm"
                    >
                      <span className="text-silver">
                        &quot;{i.name}&quot; ya no está disponible.
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(i.productId)}
                        className="text-silver hover:text-red-400"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {validItems.length > 0 && (
                <ul className="border-t border-line">
                  {validItems.map((i) => (
                    <QuoteItem key={i.productId} product={productsById[i.productId]} qty={i.qty} />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div className="space-y-8">
          <div className="corner-cut border border-line bg-panel/60 p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-silver">
                <span>Subtotal</span>
                <span className="text-paper">{formatUSD(subtotal)}</span>
              </div>
              <div className="flex justify-between text-silver">
                <span>Envío</span>
                <span className="text-paper">
                  {shipping === 0 ? "Gratis" : formatUSD(shipping)}
                </span>
              </div>
              {subtotal > 0 && subtotal < settings.freeShippingFrom && (
                <p className="text-xs text-silver-dim">
                  Envío gratis en compras desde {formatUSD(settings.freeShippingFrom)}. Te faltan{" "}
                  {formatUSD(settings.freeShippingFrom - subtotal)}.
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-4">
              <span className="font-display text-paper">Total</span>
              <span className="font-display text-lg text-paper">{formatUSD(total)}</span>
            </div>
            <p className="mt-3 text-xs text-silver-dim">
              Envío {formatUSD(settings.shippingCost)} a nivel nacional, gratis desde{" "}
              {formatUSD(settings.freeShippingFrom)}.
            </p>
          </div>

          {!loading && validItems.length > 0 && (
            <QuoteActions
              customer={customer}
              items={validItems}
              total={total}
              whatsappNumber={settings.whatsappNumber}
            />
          )}

          <CustomerForm />
        </div>
      </div>
    </div>
  );
}
