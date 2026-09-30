import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { DeleteProductButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const rows = await db.query.products.findMany({
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    with: { category: true, images: { orderBy: (i, { asc: a }) => a(i.position) } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-paper">Productos</h1>
          <p className="mt-1 text-sm text-silver">
            {rows.length} {rows.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-sm bg-paper px-4 py-2 text-sm font-medium text-ink"
        >
          + Nuevo producto
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-silver">
          Aún no hay productos. Crea el primero con el botón de arriba.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {rows.map((p) => {
            const image = p.images[0]?.url ?? null;
            return (
              <li key={p.id} className="flex items-center gap-4 py-4">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm border border-line bg-panel">
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      width={56}
                      height={56}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-silver-dim">
                      Sin foto
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-paper">
                    {p.name}
                    {!p.active && (
                      <span className="ml-2 text-xs text-silver-dim">(oculto)</span>
                    )}
                  </p>
                  <p className="text-xs text-silver">
                    {p.category?.name ?? "Sin categoría"}
                  </p>
                </div>

                <div className="w-28 text-right text-sm">
                  {p.onSale && p.salePrice ? (
                    <>
                      <span className="block text-cyan">${Number(p.salePrice).toFixed(2)}</span>
                      <span className="block text-xs text-silver-dim line-through">
                        ${Number(p.basePrice).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-paper">${Number(p.basePrice).toFixed(2)}</span>
                  )}
                </div>

                <span
                  className={`w-24 flex-shrink-0 text-center text-xs ${
                    p.status === "AVAILABLE" ? "text-cyan" : "text-silver-dim"
                  }`}
                >
                  {p.status === "AVAILABLE" ? "Disponible" : "Agotado"}
                </span>

                <div className="flex flex-shrink-0 items-center gap-4 text-sm">
                  <Link href={`/admin/productos/${p.id}/editar`} className="text-silver hover:text-paper">
                    Editar
                  </Link>
                  <DeleteProductButton id={p.id} name={p.name} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
