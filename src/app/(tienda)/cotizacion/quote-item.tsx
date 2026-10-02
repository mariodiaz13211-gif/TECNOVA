"use client";

import Image from "next/image";
import { useCart } from "@/components/cart-context";
import { formatUSD, unitPriceForQty } from "@/lib/pricing";
import type { ProductSummary } from "@/lib/catalog-types";

export function QuoteItem({ product, qty }: { product: ProductSummary; qty: number }) {
  const { setQty, removeItem } = useCart();
  const unitPrice = unitPriceForQty(product, product.tiers, qty);
  const subtotal = unitPrice * qty;
  const showStrike =
    !product.tiers.some(
      (t) => t.active && qty >= t.minQty && (t.maxQty == null || qty <= t.maxQty),
    ) &&
    product.onSale &&
    product.salePrice != null;

  function change(next: number) {
    setQty(product.id, product.name, Math.max(1, next));
  }

  return (
    <li className="flex gap-4 border-b border-line py-5 last:border-b-0">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm border border-line bg-ink-soft">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={80}
            height={80}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-silver-dim">
            Sin foto
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {product.categoryName && (
              <p className="text-xs text-silver-dim">{product.categoryName}</p>
            )}
            <p className="truncate font-display text-base text-paper">{product.name}</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            className="flex-shrink-0 text-sm text-silver hover:text-red-400"
          >
            Eliminar
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => change(qty - 1)}
              disabled={qty <= 1}
              aria-label="Disminuir cantidad"
              className="h-8 w-8 rounded-sm border border-line text-paper disabled:opacity-40"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => change(Number(e.target.value) || 1)}
              aria-label="Cantidad"
              className="w-14 rounded-sm border border-line bg-ink px-2 py-1.5 text-center text-sm text-paper outline-none focus:border-electric"
            />
            <button
              type="button"
              onClick={() => change(qty + 1)}
              aria-label="Aumentar cantidad"
              className="h-8 w-8 rounded-sm border border-line text-paper"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <div className="flex items-baseline justify-end gap-2">
              <span className="text-sm text-paper">{formatUSD(unitPrice)} c/u</span>
              {showStrike && (
                <span className="text-xs text-silver-dim line-through">
                  {formatUSD(Number(product.basePrice))}
                </span>
              )}
            </div>
            <p className="font-display text-base text-paper">{formatUSD(subtotal)}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
