import type { PriceTierLike } from "@/lib/pricing";

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  status: "AVAILABLE" | "SOLD_OUT";
  onSale: boolean;
  salePrice: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  tiers: PriceTierLike[];
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  status: "AVAILABLE" | "SOLD_OUT";
  onSale: boolean;
  salePrice: string | null;
  category: { name: string } | null;
  images: { url: string }[];
  priceTiers: {
    minQty: number;
    maxQty: number | null;
    type: "FIXED_PRICE" | "PERCENT_OFF";
    value: string;
    active: boolean;
  }[];
};

/** Convierte una fila de la base de datos (con sus relaciones) a los datos públicos del producto. */
export function toProductSummary(p: ProductRow): ProductSummary {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    status: p.status,
    onSale: p.onSale,
    salePrice: p.salePrice,
    categoryName: p.category?.name ?? null,
    imageUrl: p.images[0]?.url ?? null,
    tiers: p.priceTiers.map((t) => ({
      minQty: t.minQty,
      maxQty: t.maxQty,
      type: t.type,
      value: t.value,
      active: t.active,
    })),
  };
}
