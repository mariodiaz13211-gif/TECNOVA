"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { priceTiers, productImages, products } from "@/db/schema";
import { assertAdmin } from "@/lib/dal";
import { deleteProductImage, ImageError, uploadProductImage } from "@/lib/images";
import { slugify } from "@/lib/slug";

export type ProductState = { error?: string };

const tierSchema = z
  .object({
    minQty: z.coerce.number().int().min(1, "La cantidad mínima debe ser 1 o más."),
    maxQty: z
      .union([z.coerce.number().int().min(1), z.null()])
      .optional()
      .transform((v) => (v === undefined ? null : v)),
    type: z.enum(["FIXED_PRICE", "PERCENT_OFF"]),
    value: z.coerce.number().positive("El valor del precio debe ser mayor a 0."),
  })
  .refine((t) => t.maxQty == null || t.maxQty >= t.minQty, {
    message: "La cantidad máxima no puede ser menor que la mínima.",
    path: ["maxQty"],
  })
  .refine((t) => t.type !== "PERCENT_OFF" || t.value <= 100, {
    message: "Un descuento por porcentaje no puede superar 100.",
    path: ["value"],
  });

const productSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 letras.").max(120),
  description: z.string().trim().max(2000).default(""),
  categoryId: z.string().trim().optional(),
  basePrice: z.coerce.number().positive("El precio normal debe ser mayor a 0."),
  status: z.enum(["AVAILABLE", "SOLD_OUT"]),
  onSale: z.boolean(),
  salePrice: z
    .union([z.coerce.number().positive(), z.null()])
    .optional()
    .transform((v) => (v === undefined ? null : v)),
  featured: z.boolean(),
  tiers: z.array(tierSchema).default([]),
});

function isDuplicateSlug(error: unknown) {
  const code =
    (error as { code?: string })?.code ??
    (error as { cause?: { code?: string } })?.cause?.code;
  return code === "23505";
}

function parseTiers(raw: FormDataEntryValue | null) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readCommon(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    categoryId: formData.get("categoryId") || undefined,
    basePrice: formData.get("basePrice"),
    status: formData.get("status"),
    onSale: formData.get("onSale") === "on",
    salePrice: formData.get("onSale") === "on" ? formData.get("salePrice") : null,
    featured: formData.get("featured") === "on",
    tiers: parseTiers(formData.get("tiers")),
  });
}

async function readImage(formData: FormData) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return null;
  return uploadProductImage(file);
}

export async function createProduct(
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  await assertAdmin();
  const parsed = readCommon(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  if (data.onSale && data.salePrice == null) {
    return { error: "Indica el precio de oferta o desactiva la oferta." };
  }
  if (data.onSale && data.salePrice! >= data.basePrice) {
    return { error: "El precio de oferta debe ser menor que el precio normal." };
  }

  let imageUrl: string | null = null;
  try {
    imageUrl = await readImage(formData);
  } catch (error) {
    if (error instanceof ImageError) return { error: error.message };
    throw error;
  }

  const slug = slugify(data.name);
  if (!slug) return { error: "El nombre debe incluir letras o números." };

  try {
    const [product] = await db
      .insert(products)
      .values({
        name: data.name,
        slug,
        description: data.description,
        categoryId: data.categoryId || null,
        basePrice: data.basePrice.toFixed(2),
        status: data.status,
        featured: data.featured,
        onSale: data.onSale,
        salePrice: data.onSale ? data.salePrice!.toFixed(2) : null,
      })
      .returning();

    if (imageUrl) {
      await db.insert(productImages).values({ productId: product.id, url: imageUrl, position: 0 });
    }
    if (data.tiers.length > 0) {
      await db.insert(priceTiers).values(
        data.tiers.map((t) => ({
          productId: product.id,
          minQty: t.minQty,
          maxQty: t.maxQty,
          type: t.type,
          value: t.value.toFixed(2),
        })),
      );
    }
  } catch (error) {
    await deleteProductImage(imageUrl);
    if (isDuplicateSlug(error)) return { error: "Ya existe un producto con ese nombre." };
    throw error;
  }

  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function updateProduct(
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el producto." };

  const parsed = readCommon(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  if (data.onSale && data.salePrice == null) {
    return { error: "Indica el precio de oferta o desactiva la oferta." };
  }
  if (data.onSale && data.salePrice! >= data.basePrice) {
    return { error: "El precio de oferta debe ser menor que el precio normal." };
  }

  const existing = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { images: true },
  });
  if (!existing) return { error: "El producto ya no existe." };

  let newImageUrl: string | null = null;
  const removeImage = formData.get("removeImage") === "on";
  try {
    newImageUrl = await readImage(formData);
  } catch (error) {
    if (error instanceof ImageError) return { error: error.message };
    throw error;
  }

  const slug = slugify(data.name);
  if (!slug) return { error: "El nombre debe incluir letras o números." };

  try {
    await db
      .update(products)
      .set({
        name: data.name,
        slug,
        description: data.description,
        categoryId: data.categoryId || null,
        basePrice: data.basePrice.toFixed(2),
        status: data.status,
        featured: data.featured,
        active: formData.get("active") === "on",
        onSale: data.onSale,
        salePrice: data.onSale ? data.salePrice!.toFixed(2) : null,
      })
      .where(eq(products.id, id));

    await db.delete(priceTiers).where(eq(priceTiers.productId, id));
    if (data.tiers.length > 0) {
      await db.insert(priceTiers).values(
        data.tiers.map((t) => ({
          productId: id,
          minQty: t.minQty,
          maxQty: t.maxQty,
          type: t.type,
          value: t.value.toFixed(2),
        })),
      );
    }

    if (newImageUrl || removeImage) {
      await db.delete(productImages).where(eq(productImages.productId, id));
      if (newImageUrl) {
        await db.insert(productImages).values({ productId: id, url: newImageUrl, position: 0 });
      }
      for (const img of existing.images) await deleteProductImage(img.url);
    }
  } catch (error) {
    await deleteProductImage(newImageUrl);
    if (isDuplicateSlug(error)) return { error: "Ya existe un producto con ese nombre." };
    throw error;
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}/editar`);
  redirect("/admin/productos");
}

export async function deleteProduct(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { images: true },
  });
  if (!existing) return;

  await db.delete(products).where(eq(products.id, id));
  for (const img of existing.images) await deleteProductImage(img.url);

  revalidatePath("/admin/productos");
}
