"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/dal";
import { updateSettings } from "@/lib/settings";

export type SettingsState = { error?: string; ok?: string };

const schema = z.object({
  storeName: z.string().trim().min(2, "El nombre de la tienda es muy corto.").max(60),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^$|^[0-9]{8,15}$/, "El número debe tener solo dígitos (incluyendo el código de país)."),
  shippingCost: z.coerce.number().min(0, "El costo de envío no puede ser negativo."),
  freeShippingFrom: z.coerce.number().min(0, "El monto mínimo no puede ser negativo."),
});

export async function updateConfiguracion(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await assertAdmin();

  const parsed = schema.safeParse({
    storeName: formData.get("storeName"),
    whatsappNumber: formData.get("whatsappNumber"),
    shippingCost: formData.get("shippingCost"),
    freeShippingFrom: formData.get("freeShippingFrom"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await updateSettings(parsed.data);
  revalidatePath("/admin/configuracion");
  revalidatePath("/catalogo");
  revalidatePath("/cotizacion");
  return { ok: "Configuración guardada." };
}
