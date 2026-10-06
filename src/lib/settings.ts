import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

export type StoreSettings = {
  storeName: string;
  whatsappNumber: string;
  shippingCost: number;
  freeShippingFrom: number;
};

// Si todavía no se configuró nada en /admin/configuracion, se usan estos
// valores (los de la Fase 1), y el número de WhatsApp cae de vuelta a la
// variable de entorno de la Fase 5 mientras el administrador no lo cambie
// desde el panel.
const DEFAULTS: StoreSettings = {
  storeName: "TECNOVA",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  shippingCost: 3,
  freeShippingFrom: 30,
};

const KEYS = {
  storeName: "store_name",
  whatsappNumber: "whatsapp_number",
  shippingCost: "shipping_cost",
  freeShippingFrom: "free_shipping_from",
} as const;

// "quotation_seq" también vive en esta misma tabla (ver nextQuotationNumber
// más abajo), pero nunca se expone aquí: getSettings/updateSettings solo
// conocen las cuatro llaves de arriba.

export async function getSettings(): Promise<StoreSettings> {
  const rows = await db
    .select()
    .from(settings)
    .where(sql`${settings.key} in (${KEYS.storeName}, ${KEYS.whatsappNumber}, ${KEYS.shippingCost}, ${KEYS.freeShippingFrom})`);

  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const shippingCost = Number(byKey[KEYS.shippingCost]);
  const freeShippingFrom = Number(byKey[KEYS.freeShippingFrom]);

  return {
    storeName: byKey[KEYS.storeName]?.trim() || DEFAULTS.storeName,
    whatsappNumber: byKey[KEYS.whatsappNumber] ?? DEFAULTS.whatsappNumber,
    shippingCost: Number.isFinite(shippingCost) ? shippingCost : DEFAULTS.shippingCost,
    freeShippingFrom: Number.isFinite(freeShippingFrom) ? freeShippingFrom : DEFAULTS.freeShippingFrom,
  };
}

export async function updateSettings(patch: Partial<StoreSettings>) {
  const rows: { key: string; value: string }[] = [];
  if (patch.storeName !== undefined) rows.push({ key: KEYS.storeName, value: patch.storeName });
  if (patch.whatsappNumber !== undefined) rows.push({ key: KEYS.whatsappNumber, value: patch.whatsappNumber });
  if (patch.shippingCost !== undefined) rows.push({ key: KEYS.shippingCost, value: String(patch.shippingCost) });
  if (patch.freeShippingFrom !== undefined) rows.push({ key: KEYS.freeShippingFrom, value: String(patch.freeShippingFrom) });

  for (const row of rows) {
    await db
      .insert(settings)
      .values(row)
      .onConflictDoUpdate({ target: settings.key, set: { value: row.value, updatedAt: new Date() } });
  }
}

/**
 * Número de cotización único generado en el SERVIDOR, de forma atómica
 * (un único UPDATE/INSERT en PostgreSQL no puede ser "pisado" por otra
 * cotización que se esté creando al mismo tiempo). Usa un contador guardado
 * en la misma tabla "settings", bajo la llave "quotation_seq", que nunca
 * aparece en /admin/configuracion.
 */
export async function nextQuotationNumber(): Promise<string> {
  const result = await db.execute<{ value: string }>(sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES ('quotation_seq', '1', now())
    ON CONFLICT (key) DO UPDATE SET value = (settings.value::int + 1)::text, updated_at = now()
    RETURNING value
  `);
  const n = Number(result.rows[0]?.value ?? 1);
  return `COT-${String(n).padStart(6, "0")}`;
}
