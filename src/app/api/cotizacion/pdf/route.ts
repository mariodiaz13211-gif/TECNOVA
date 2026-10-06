import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/db";
import { quotations } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { QuotePdfDocument, type QuotePdfItem } from "./document";

export const runtime = "nodejs";

/**
 * Genera el PDF a partir de una cotización YA GUARDADA (ver
 * saveQuotation en app/(tienda)/cotizacion/actions.ts). No recibe precios
 * ni totales del navegador: todo sale de la fila guardada en PostgreSQL,
 * que es exactamente la misma que usa el botón de WhatsApp.
 */
export async function POST(request: Request) {
  let body: { quotationId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const quotationId = typeof body.quotationId === "string" ? body.quotationId : null;
  if (!quotationId) {
    return NextResponse.json({ error: "Falta la cotización a generar." }, { status: 400 });
  }

  const quotation = await db.query.quotations.findFirst({
    where: eq(quotations.id, quotationId),
    with: { items: true },
  });
  if (!quotation) {
    return NextResponse.json({ error: "Esa cotización ya no existe." }, { status: 404 });
  }

  const settings = await getSettings();

  const items: QuotePdfItem[] = quotation.items.map((item) => ({
    name: item.productName,
    qty: item.qty,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.subtotal),
  }));

  const date = quotation.createdAt.toLocaleDateString("es-SV", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pdfBuffer = await renderToBuffer(
    QuotePdfDocument({
      storeName: settings.storeName,
      quoteNumber: quotation.number,
      date,
      customer: {
        nombre: quotation.customerName,
        telefono: quotation.customerPhone,
        direccion: quotation.customerAddress,
        departamento: quotation.customerDepartamento,
        municipio: quotation.customerMunicipio,
      },
      items,
      subtotal: Number(quotation.subtotal),
      shipping: Number(quotation.shipping),
      total: Number(quotation.total),
    }),
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${quotation.number}.pdf"`,
    },
  });
}
