import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quotations } from "@/db/schema";
import { StatusForm } from "./status-form";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quote = await db.query.quotations.findFirst({
    where: eq(quotations.id, id),
    with: { items: true },
  });
  if (!quote) notFound();

  return (
    <div>
      <Link href="/admin/cotizaciones" className="text-sm text-silver hover:text-paper">
        ← Volver a cotizaciones
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-paper">{quote.number}</h1>
          <p className="mt-1 text-sm text-silver">
            {quote.createdAt.toLocaleDateString("es-SV", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <StatusForm id={quote.id} status={quote.status} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-sm font-medium text-paper">Productos</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {quote.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3 text-sm">
                <span className="flex-1 text-paper">{item.productName}</span>
                <span className="w-16 text-center text-silver">{item.qty}</span>
                <span className="w-20 text-right text-silver">${Number(item.unitPrice).toFixed(2)}</span>
                <span className="w-20 text-right text-paper">${Number(item.subtotal).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-end">
            <div className="w-56 space-y-1 text-sm">
              <div className="flex justify-between text-silver">
                <span>Subtotal</span>
                <span className="text-paper">${Number(quote.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-silver">
                <span>Envío</span>
                <span className="text-paper">
                  {Number(quote.shipping) === 0 ? "Gratis" : `$${Number(quote.shipping).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-1 font-display text-paper">
                <span>Total</span>
                <span>${Number(quote.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-paper">Datos del cliente</h2>
          <div className="mt-3 space-y-1 border border-line bg-panel/40 p-4 text-sm text-silver">
            <p className="text-paper">{quote.customerName}</p>
            <p>Tel: {quote.customerPhone}</p>
            <p>
              {quote.customerAddress}, {quote.customerMunicipio}, {quote.customerDepartamento}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
