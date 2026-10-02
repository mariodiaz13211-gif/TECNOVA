"use server";

import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { toProductSummary, type ProductSummary } from "@/lib/catalog-types";

/**
 * Datos públicos (precio, imagen, categoría, niveles de precio) de los
 * productos que el cliente tiene en su cotización. Es de solo lectura: no
 * requiere sesión, igual que /catalogo, y no expone nada que /catalogo no
 * muestre ya. Un id que no exista o ya no esté activo simplemente no
 * aparece en el resultado.
 */
export async function getCotizacionProducts(ids: string[]): Promise<ProductSummary[]> {
  const cleanIds = Array.from(new Set(ids.filter((id) => typeof id === "string" && id.length > 0)));
  if (cleanIds.length === 0) return [];

  const rows = await db.query.products.findMany({
    where: (p, { and, eq }) => and(eq(p.active, true), inArray(p.id, cleanIds)),
    with: {
      category: true,
      images: { orderBy: (i, { asc: a }) => a(i.position) },
      priceTiers: true,
    },
  });

  return rows.map(toProductSummary);
}
