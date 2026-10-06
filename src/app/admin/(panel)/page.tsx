import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, quotations } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [[cat], [prod], [pending]] = await Promise.all([
    db.select({ n: count() }).from(categories),
    db.select({ n: count() }).from(products),
    db.select({ n: count() }).from(quotations).where(eq(quotations.status, "PENDING")),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Inicio</h1>
      <p className="mt-2 text-sm text-silver">
        Desde aquí administras el contenido de la tienda.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/categorias"
          className="border border-line bg-panel/70 p-6 hover:border-electric/60"
        >
          <p className="text-3xl font-display text-paper">{cat.n}</p>
          <p className="mt-1 text-sm text-silver">Categorías</p>
        </Link>
        <Link
          href="/admin/productos"
          className="border border-line bg-panel/70 p-6 hover:border-electric/60"
        >
          <p className="text-3xl font-display text-paper">{prod.n}</p>
          <p className="mt-1 text-sm text-silver">Productos</p>
        </Link>
        <Link
          href="/admin/cotizaciones?estado=PENDING"
          className="border border-line bg-panel/70 p-6 hover:border-electric/60"
        >
          <p className="text-3xl font-display text-paper">{pending.n}</p>
          <p className="mt-1 text-sm text-silver">Cotizaciones pendientes</p>
        </Link>
      </div>
    </div>
  );
}
