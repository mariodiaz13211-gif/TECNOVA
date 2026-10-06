"use server";

import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { quotationItems, quotations } from "@/db/schema";
import { toProductSummary, type ProductSummary } from "@/lib/catalog-types";
import { unitPriceForQty } from "@/lib/pricing";
import { shippingFor } from "@/lib/shipping";
import { getSettings, nextQuotationNumber, type StoreSettings } from "@/lib/settings";
import { missingCustomerFields } from "@/lib/customer-validation";
import type { Customer } from "@/components/cart-context";

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

/**
 * Configuración pública de la tienda (nombre, número de WhatsApp, costo y
 * umbral de envío). Son datos pensados para mostrarse al cliente — nada
 * sensible — por eso esta acción no requiere sesión.
 */
export async function getPublicSettings(): Promise<StoreSettings> {
  return getSettings();
}

export type SavedQuotationItem = {
  productId: string | null;
  name: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
};

export type SavedQuotation = {
  id: string;
  number: string;
  createdAt: string;
  customer: Customer;
  items: SavedQuotationItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

export type SaveQuotationInput = {
  customer: Customer;
  items: { productId: string; qty: number }[];
};

export type SaveQuotationResult = { ok: true; quotation: SavedQuotation } | { ok: false; error: string };

/**
 * Registra una cotización REAL en PostgreSQL: recalcula todo en el
 * servidor (nunca a partir de precios que mande el navegador) y guarda una
 * copia fija de nombre/precio de cada producto, para que si el producto
 * cambia después, esta cotización histórica no cambie.
 *
 * Se llama solo cuando el cliente pulsa "Generar PDF" o "Enviar por
 * WhatsApp" — nunca solo por agregar algo al carrito.
 */
export async function saveQuotation(input: SaveQuotationInput): Promise<SaveQuotationResult> {
  const customer: Customer = {
    nombre: input.customer?.nombre ?? "",
    telefono: input.customer?.telefono ?? "",
    direccion: input.customer?.direccion ?? "",
    departamento: input.customer?.departamento ?? "",
    municipio: input.customer?.municipio ?? "",
  };
  const missing = missingCustomerFields(customer);
  if (missing.length > 0) {
    return { ok: false, error: `Completa tus datos antes de continuar: ${missing.join(", ")}.` };
  }

  const requestedQtyById = new Map<string, number>();
  for (const item of Array.isArray(input.items) ? input.items : []) {
    if (typeof item.productId !== "string" || !item.productId) continue;
    const qty = Number(item.qty);
    if (!Number.isFinite(qty) || qty < 1) continue;
    requestedQtyById.set(item.productId, Math.floor(qty));
  }
  if (requestedQtyById.size === 0) {
    return { ok: false, error: "Tu cotización no tiene productos." };
  }

  const products = await getCotizacionProducts([...requestedQtyById.keys()]);
  const items: SavedQuotationItem[] = products.map((product) => {
    const qty = requestedQtyById.get(product.id)!;
    const unitPrice = unitPriceForQty(product, product.tiers, qty);
    return { productId: product.id, name: product.name, qty, unitPrice, subtotal: unitPrice * qty };
  });
  if (items.length === 0) {
    return { ok: false, error: "Ninguno de los productos de tu cotización sigue disponible." };
  }

  const settings = await getSettings();
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const shipping = shippingFor(subtotal, settings.shippingCost, settings.freeShippingFrom);
  const total = subtotal + shipping;
  const number = await nextQuotationNumber();

  const saved = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(quotations)
      .values({
        number,
        customerName: customer.nombre,
        customerPhone: customer.telefono,
        customerAddress: customer.direccion,
        customerDepartamento: customer.departamento,
        customerMunicipio: customer.municipio,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
      })
      .returning();

    await tx.insert(quotationItems).values(
      items.map((item) => ({
        quotationId: row.id,
        productId: item.productId,
        productName: item.name,
        qty: item.qty,
        unitPrice: item.unitPrice.toFixed(2),
        subtotal: item.subtotal.toFixed(2),
      })),
    );

    return row;
  });

  return {
    ok: true,
    quotation: {
      id: saved.id,
      number: saved.number,
      createdAt: saved.createdAt.toISOString(),
      customer,
      items,
      subtotal,
      shipping,
      total,
    },
  };
}
