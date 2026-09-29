import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { CategoryRow, CreateCategoryForm } from "./category-forms";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      position: categories.position,
      active: categories.active,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.position), asc(categories.name));

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Categorías</h1>
      <p className="mt-2 text-sm text-silver">
        Las categorías con número de orden menor aparecen primero en la tienda.
      </p>

      <div className="mt-8 border border-line bg-panel/40 p-5">
        <CreateCategoryForm />
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-silver">
          Aún no hay categorías. Crea la primera con el formulario de arriba.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((row) => (
            <CategoryRow
              key={row.id}
              category={row}
              productCount={row.productCount}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
