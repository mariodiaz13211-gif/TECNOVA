import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const cats = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.position), asc(categories.name));

  return (
    <div>
      <Link href="/admin/productos" className="text-sm text-silver hover:text-paper">
        ← Volver a productos
      </Link>
      <h1 className="mt-3 font-display text-2xl text-paper">Nuevo producto</h1>
      <div className="mt-6">
        <ProductForm categories={cats} />
      </div>
    </div>
  );
}
