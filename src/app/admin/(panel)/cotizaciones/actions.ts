"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { quotations } from "@/db/schema";
import { assertAdmin } from "@/lib/dal";

const statusSchema = z.enum(["PENDING", "CONTACTED", "CONFIRMED", "CANCELLED"]);

export type UpdateStatusState = { error?: string; ok?: string };

export async function updateQuotationStatus(
  _prev: UpdateStatusState,
  formData: FormData,
): Promise<UpdateStatusState> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!id || !parsed.success) return { error: "Datos inválidos." };

  await db.update(quotations).set({ status: parsed.data }).where(eq(quotations.id, id));

  revalidatePath("/admin/cotizaciones");
  revalidatePath(`/admin/cotizaciones/${id}`);
  return { ok: "Estado actualizado." };
}
