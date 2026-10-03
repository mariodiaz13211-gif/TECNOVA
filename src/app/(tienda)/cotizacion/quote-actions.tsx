"use client";

import { useState } from "react";
import { formatUSD } from "@/lib/pricing";
import { missingCustomerFields } from "@/lib/customer-validation";
import { buildWhatsAppLink, hasWhatsAppNumber } from "@/lib/whatsapp-config";
import type { Customer } from "@/components/cart-context";

type ActionItem = { productId: string; name: string; qty: number };

export function QuoteActions({
  quoteNumber,
  customer,
  items,
  total,
}: {
  quoteNumber: string;
  customer: Customer;
  items: ActionItem[];
  total: number;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missing = missingCustomerFields(customer);
  const canAct = missing.length === 0 && items.length > 0;

  async function handleDownloadPdf() {
    setError(null);
    if (!canAct) {
      setError(`Completa tus datos antes de continuar: ${missing.join(", ")}.`);
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch("/api/cotizacion/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteNumber,
          customer,
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo generar el PDF.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${quoteNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el PDF.");
    } finally {
      setDownloading(false);
    }
  }

  function handleWhatsApp() {
    setError(null);
    if (!canAct) {
      setError(`Completa tus datos antes de continuar: ${missing.join(", ")}.`);
      return;
    }
    const lines = [
      `Hola TECNOVA, quiero solicitar la cotización ${quoteNumber}.`,
      "",
      `Cliente: ${customer.nombre}`,
      "",
      "Productos:",
      ...items.map((i) => `- ${i.qty} x ${i.name}`),
      "",
      `Total: ${formatUSD(total)}`,
    ];
    window.open(buildWhatsAppLink(lines.join("\n")), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading || !canAct}
          className="flex-1 rounded-sm bg-paper px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-50"
        >
          {downloading ? "Generando PDF..." : "Generar cotización PDF"}
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          disabled={!canAct}
          className="flex-1 rounded-sm border border-electric/60 bg-electric/10 px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-50"
        >
          Enviar por WhatsApp
        </button>
      </div>
      {!hasWhatsAppNumber() && (
        <p className="text-xs text-silver-dim">
          El número de WhatsApp de TECNOVA todavía no está configurado.
        </p>
      )}
      {!canAct && missing.length > 0 && (
        <p className="text-xs text-silver-dim">
          Completa tus datos abajo para habilitar estos botones.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
