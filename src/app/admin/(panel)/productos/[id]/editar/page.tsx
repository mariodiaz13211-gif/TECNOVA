import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { ProductForm, type ProductFormValues } from "../../product-form";
import type { Tier } from "../../price-tiers-editor";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, cats] = await Promise.all([
    db.query.products.findFirst({
      where: eq(products.id, id),
      with: { images: true, priceTiers: true },
    }),
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.position), asc(categories.name)),
  ]);

  if (!product) notFound();

  const initial: ProductFormValues = {
    id: product.id,
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    status: product.status,
    featured: product.featured,
    onSale: product.onSale,
    salePrice: product.salePrice,
    active: product.active,
    imageUrl: product.images[0]?.url ?? null,
    tiers: product.priceTiers.map(
      (t, i): Tier => ({
        key: `${i}-${t.id}`,
        minQty: String(t.minQty),
        maxQty: t.maxQty == null ? "" : String(t.maxQty),
        type: t.type,
        value: t.value,
      }),
    ),
  };

  return (
    <div>
      <Link href="/admin/productos" className="text-sm text-silver hover:text-paper">
        ← Volver a productos
      </Link>
      <h1 className="mt-3 font-display text-2xl text-paper">Editar producto</h1>
      <div className="mt-6">
        <ProductForm categories={cats} initial={initial} />
      </div>
    </div>
  );
}
