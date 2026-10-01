export type PriceTierLike = {
  minQty: number;
  maxQty: number | null;
  type: "FIXED_PRICE" | "PERCENT_OFF";
  value: string | number;
  active: boolean;
};

export type PriceableProduct = {
  basePrice: string | number;
  onSale: boolean;
  salePrice: string | number | null;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Precio unitario aplicable para una cantidad dada.
 * Prioridad: nivel de precio por cantidad que coincida > oferta > precio normal.
 * (Los niveles por cantidad se definen sobre el precio normal, así que cuando
 * aplican, mandan sobre la oferta general del producto.)
 */
export function unitPriceForQty(
  product: PriceableProduct,
  tiers: PriceTierLike[],
  qty: number,
) {
  const base = Number(product.basePrice);

  const applicable = tiers
    .filter((t) => t.active)
    .filter((t) => qty >= t.minQty && (t.maxQty == null || qty <= t.maxQty))
    .sort((a, b) => b.minQty - a.minQty)[0];

  if (applicable) {
    return applicable.type === "FIXED_PRICE"
      ? round2(Number(applicable.value))
      : round2(base * (1 - Number(applicable.value) / 100));
  }

  if (product.onSale && product.salePrice != null) {
    return round2(Number(product.salePrice));
  }

  return round2(base);
}

export function formatUSD(n: number) {
  return `$${n.toFixed(2)}`;
}
