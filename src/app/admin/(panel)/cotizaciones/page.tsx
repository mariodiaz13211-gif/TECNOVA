import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { quotations } from "@/db/schema";
import { STATUS_COLOR, STATUS_LABELS, STATUS_OPTIONS } from "./status-labels";

export const dynamic = "force-dynamic";

const input =
  "rounded-sm border border-line bg-panel px-3 py-2 text-sm text-paper outline-none focus:border-electric";

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { q, estado } = await searchParams;
  const status = estado && estado in STATUS_LABELS ? (estado as keyof typeof STATUS_LABELS) : undefined;

  const rows = await db
    .select()
    .from(quotations)
    .where(
      and(
        status ? eq(quotations.status, status) : undefined,
        q
          ? or(
              ilike(quotations.number, `%${q}%`),
              ilike(quotations.customerName, `%${q}%`),
              ilike(quotations.customerPhone, `%${q}%`),
            )
          : undefined,
      ),
    )
    .orderBy(desc(quotations.createdAt));

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Cotizaciones</h1>
      <p className="mt-1 text-sm text-silver">
        {rows.length} {rows.length === 1 ? "resultado" : "resultados"}
      </p>

      <form action="/admin/cotizaciones" method="GET" className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por número, nombre o teléfono"
          className={`${input} flex-1 min-w-56`}
        />
        <select name="estado" defaultValue={estado ?? ""} className={input}>
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-sm border border-line px-4 py-2 text-sm text-paper hover:border-electric/60"
        >
          Buscar
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-silver">No hay cotizaciones con esos filtros.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {rows.map((quote) => (
            <li key={quote.id}>
              <Link
                href={`/admin/cotizaciones/${quote.id}`}
                className="flex flex-wrap items-center gap-3 py-4 hover:bg-panel/40"
              >
                <div className="w-32 flex-shrink-0">
                  <p className="font-display text-sm text-paper">{quote.number}</p>
                  <p className="text-xs text-silver-dim">
                    {quote.createdAt.toLocaleDateString("es-SV")}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-paper">{quote.customerName}</p>
                  <p className="text-xs text-silver">
                    {quote.customerPhone} · {quote.customerMunicipio}, {quote.customerDepartamento}
                  </p>
                </div>
                <div className="w-24 flex-shrink-0 text-right text-sm text-paper">
                  ${Number(quote.total).toFixed(2)}
                </div>
                <div className={`w-28 flex-shrink-0 text-right text-xs ${STATUS_COLOR[quote.status]}`}>
                  {STATUS_LABELS[quote.status]}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
