import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCotizacionProducts } from "@/app/(tienda)/cotizacion/actions";
import { unitPriceForQty } from "@/lib/pricing";
import { shippingFor } from "@/lib/shipping";
import { missingCustomerFields } from "@/lib/customer-validation";
import type { Customer } from "@/components/cart-context";
import { QuotePdfDocument, type QuotePdfItem } from "./document";

export const runtime = "nodejs";

type RequestBody = {
  quoteNumber?: unknown;
  customer?: Partial<Customer>;
  items?: { productId?: unknown; qty?: unknown }[];
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const quoteNumber = isNonEmptyString(body.quoteNumber) ? body.quoteNumber : null;
  if (!quoteNumber) {
    return NextResponse.json({ error: "Falta el número de cotización." }, { status: 400 });
  }

  const customer: Customer = {
    nombre: body.customer?.nombre ?? "",
    telefono: body.customer?.telefono ?? "",
    direccion: body.customer?.direccion ?? "",
    departamento: body.customer?.departamento ?? "",
    municipio: body.customer?.municipio ?? "",
  };
  const missing = missingCustomerFields(customer);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Faltan datos del cliente: ${missing.join(", ")}.` },
      { status: 400 },
    );
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const requestedQtyById = new Map<string, number>();
  for (const item of rawItems) {
    if (!isNonEmptyString(item.productId)) continue;
    const qty = Number(item.qty);
    if (!Number.isFinite(qty) || qty < 1) continue;
    requestedQtyById.set(item.productId, Math.floor(qty));
  }
  if (requestedQtyById.size === 0) {
    return NextResponse.json({ error: "La cotización no tiene productos." }, { status: 400 });
  }

  // Los precios NUNCA se confían del cliente: se recalculan aquí con los
  // mismos datos y la misma función que usa la página /cotizacion.
  const products = await getCotizacionProducts([...requestedQtyById.keys()]);

  const pdfItems: QuotePdfItem[] = products.map((product) => {
    const qty = requestedQtyById.get(product.id)!;
    const unitPrice = unitPriceForQty(product, product.tiers, qty);
    return { name: product.name, qty, unitPrice, subtotal: unitPrice * qty };
  });

  if (pdfItems.length === 0) {
    return NextResponse.json(
      { error: "Ninguno de los productos de tu cotización sigue disponible." },
      { status: 400 },
    );
  }

  const subtotal = pdfItems.reduce((sum, i) => sum + i.subtotal, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  const date = new Date().toLocaleDateString("es-SV", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pdfBuffer = await renderToBuffer(
    QuotePdfDocument({ quoteNumber, date, customer, items: pdfItems, subtotal, shipping, total }),
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${quoteNumber}.pdf"`,
    },
  });
}
