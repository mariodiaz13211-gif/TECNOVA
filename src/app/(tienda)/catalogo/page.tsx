import Link from "next/link";
import { asc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { ProductCard } from "./product-card";
import { toProductSummary, type ProductSummary } from "@/lib/catalog-types";

export const dynamic = "force-dynamic";

function buildQuery(base: { categoria?: string; q?: string }, overrides: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  if (merged.categoria) params.set("categoria", merged.categoria);
  if (merged.q) params.set("q", merged.q);
  const qs = params.toString();
  return qs ? `/catalogo?${qs}` : "/catalogo";
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const { categoria, q } = await searchParams;

  const cats = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.position), asc(categories.name));

  const selectedCategory = categoria ? cats.find((c) => c.slug === categoria) : undefined;

  const rows = await db.query.products.findMany({
    where: (p, { eq: eqOp, and: andOp }) =>
      andOp(
        eqOp(p.active, true),
        selectedCategory ? eqOp(p.categoryId, selectedCategory.id) : undefined,
        q ? ilike(p.name, `%${q}%`) : undefined,
      ),
    orderBy: (p, { desc }) => [desc(p.featured), desc(p.createdAt)],
    with: {
      category: true,
      images: { orderBy: (i, { asc: a }) => a(i.position) },
      priceTiers: true,
    },
  });

  const products: ProductSummary[] = rows.map(toProductSummary);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-paper">Catálogo</h1>
          <p className="mt-1 text-sm text-silver">
            {products.length} {products.length === 1 ? "producto" : "productos"}
            {selectedCategory ? ` en ${selectedCategory.name}` : ""}
          </p>
        </div>

        <form action="/catalogo" method="GET" className="flex w-full max-w-sm gap-2 sm:w-auto">
          {categoria && <input type="hidden" name="categoria" value={categoria} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            className="w-full rounded-sm border border-line bg-panel px-3 py-2 text-sm text-paper outline-none focus:border-electric"
          />
          <button
            type="submit"
            className="rounded-sm border border-line px-4 py-2 text-sm text-paper hover:border-electric/60"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto">
        <Link
          href={buildQuery({ q }, { categoria: undefined })}
          className={`whitespace-nowrap rounded-sm border px-3 py-1.5 text-sm ${
            !selectedCategory
              ? "border-electric bg-electric/10 text-paper"
              : "border-line text-silver hover:text-paper"
          }`}
        >
          Todas
        </Link>
        {cats.map((c) => (
          <Link
            key={c.id}
            href={buildQuery({ q }, { categoria: c.slug })}
            className={`whitespace-nowrap rounded-sm border px-3 py-1.5 text-sm ${
              selectedCategory?.id === c.id
                ? "border-electric bg-electric/10 text-paper"
                : "border-line text-silver hover:text-paper"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-sm text-silver">
          No encontramos productos{q ? ` para "${q}"` : ""}
          {selectedCategory ? ` en ${selectedCategory.name}` : ""}.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
