import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .where(eq(categories.active, true))
    .groupBy(categories.id)
    .orderBy(asc(categories.position), asc(categories.name));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-paper md:text-4xl">Categorías</h1>
          <p className="mt-2 text-sm text-silver">
            Explora los accesorios tecnológicos de TECNOVA por categoría.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="text-sm text-silver transition-colors hover:text-paper"
        >
          Ver todo el catálogo
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-silver">Todavía no hay categorías disponibles.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((categoria, i) => (
            <Link
              key={categoria.id}
              href={`/catalogo?categoria=${categoria.slug}`}
              className="corner-cut group relative border border-line bg-panel/70 p-6 transition-colors hover:border-electric/60"
            >
              <div
                className={`h-1.5 w-10 rounded-full ${
                  i % 2 === 0 ? "bg-electric" : "bg-cyan"
                }`}
              />
              <p className="mt-5 font-display text-lg text-paper">{categoria.name}</p>
              <p className="mt-1 text-sm text-silver">
                {categoria.productCount}{" "}
                {categoria.productCount === 1 ? "producto" : "productos"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
