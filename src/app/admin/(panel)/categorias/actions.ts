"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { assertAdmin } from "@/lib/dal";
import { slugify } from "@/lib/slug";

export type CategoryState = { error?: string; ok?: string };

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 letras.")
    .max(60, "El nombre es demasiado largo."),
  position: z.coerce.number().int().min(0).max(9999).default(0),
});

function isDuplicate(error: unknown) {
  const code =
    (error as { code?: string; cause?: { code?: string } })?.code ??
    (error as { cause?: { code?: string } })?.cause?.code;
  return code === "23505";
}

export async function createCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  await assertAdmin();
  const parsed = schema.safeParse({
    name: formData.get("name"),
    position: formData.get("position") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const slug = slugify(parsed.data.name);
  if (!slug) return { error: "El nombre debe incluir letras o números." };

  try {
    await db.insert(categories).values({ ...parsed.data, slug });
  } catch (error) {
    if (isDuplicate(error)) return { error: "Ya existe una categoría con ese nombre." };
    throw error;
  }
  revalidatePath("/admin/categorias");
  return { ok: "Categoría creada." };
}

export async function updateCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse({
    name: formData.get("name"),
    position: formData.get("position") || 0,
  });
  if (!id) return { error: "Falta la categoría." };
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const slug = slugify(parsed.data.name);
  if (!slug) return { error: "El nombre debe incluir letras o números." };

  try {
    await db
      .update(categories)
      .set({
        ...parsed.data,
        slug,
        active: formData.get("active") === "on",
      })
      .where(eq(categories.id, id));
  } catch (error) {
    if (isDuplicate(error)) return { error: "Ya existe una categoría con ese nombre." };
    throw error;
  }
  revalidatePath("/admin/categorias");
  return { ok: "Guardado." };
}

export async function deleteCategory(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categorias");
}
