"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart-context";
import { formatUSD, unitPriceForQty } from "@/lib/pricing";
import type { ProductSummary } from "@/lib/catalog-types";

export function ProductCard({ product }: { product: ProductSummary }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { setQty: setCartQty } = useCart();

  const available = product.status === "AVAILABLE";
  const unitPrice = useMemo(
    () => unitPriceForQty(product, product.tiers, Math.max(1, qty)),
    [product, qty],
  );
  const showStrike =
    !product.tiers.some(
      (t) => t.active && qty >= t.minQty && (t.maxQty == null || qty <= t.maxQty),
    ) &&
    product.onSale &&
    product.salePrice != null;

  function handleAdd() {
    setCartQty(product.id, product.name, Math.max(1, qty));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="corner-cut flex flex-col border border-line bg-panel/60">
      <div className="relative aspect-square bg-ink-soft">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-silver-dim">
            Sin foto
          </div>
        )}

        {product.onSale && (
          <span className="absolute left-3 top-3 rounded-sm bg-cyan px-2 py-1 text-xs font-medium text-ink">
            Oferta
          </span>
        )}
        <span
          className={`absolute right-3 top-3 rounded-sm px-2 py-1 text-xs font-medium ${
            available ? "bg-ink/80 text-cyan" : "bg-ink/80 text-silver-dim"
          }`}
        >
          {available ? "Disponible" : "Agotado"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.categoryName && (
          <p className="text-xs text-silver-dim">{product.categoryName}</p>
        )}
        <p className="mt-1 font-display text-base text-paper">{product.name}</p>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg text-paper">{formatUSD(unitPrice)}</span>
          {showStrike && (
            <span className="text-sm text-silver-dim line-through">
              {formatUSD(Number(product.basePrice))}
            </span>
          )}
          {qty > 1 && <span className="text-xs text-silver">c/u</span>}
        </div>

        <div className="mt-auto pt-4">
          {available ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                aria-label="Cantidad"
                className="w-16 rounded-sm border border-line bg-ink px-2 py-2 text-sm text-paper outline-none focus:border-electric"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 rounded-sm bg-paper px-3 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
              >
                {added ? "Agregado ✓" : "Agregar a cotización"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-sm border border-line px-3 py-2 text-sm text-silver-dim"
            >
              Agotado
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
