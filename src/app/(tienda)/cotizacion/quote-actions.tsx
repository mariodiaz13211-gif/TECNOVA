"use client";

import { useState } from "react";
import { formatUSD } from "@/lib/pricing";
import { missingCustomerFields } from "@/lib/customer-validation";
import { buildWhatsAppLink } from "@/lib/whatsapp-config";
import { quoteSignature } from "@/lib/quote-signature";
import { useCart, type Customer } from "@/components/cart-context";
import { saveQuotation } from "./actions";

type ActionItem = { productId: string; name: string; qty: number };

export function QuoteActions({
  customer,
  items,
  total,
  whatsappNumber,
}: {
  customer: Customer;
  items: ActionItem[];
  total: number;
  whatsappNumber: string;
}) {
  const { savedQuotation, setSavedQuotation } = useCart();
  const [working, setWorking] = useState<"pdf" | "whatsapp" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const missing = missingCustomerFields(customer);
  const canAct = missing.length === 0 && items.length > 0;
  const currentSignature = quoteSignature(items, customer);

  /**
   * Garantiza que exista una cotización guardada en PostgreSQL para el
   * contenido ACTUAL del carrito. Si ya se guardó una con exactamente los
   * mismos productos y los mismos datos del cliente (p. ej. el usuario
   * pulsó "Generar PDF" y ahora pulsa "Enviar por WhatsApp" sin cambiar
   * nada), se reutiliza esa misma fila en vez de crear una segunda.
   */
  async function ensureSavedQuotation(): Promise<{ id: string; number: string } | { error: string }> {
    // Ya existe una cotización guardada con exactamente este mismo
    // contenido (mismo clic en PDF y luego en WhatsApp, por ejemplo): se
    // reutiliza su id/número en vez de guardar una segunda fila.
    if (savedQuotation && savedQuotation.signature === currentSignature) {
      return { id: savedQuotation.id, number: savedQuotation.number };
    }

    const result = await saveQuotation({
      customer,
      items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
    });
    if (!result.ok) return { error: result.error };

    setSavedQuotation({
      id: result.quotation.id,
      number: result.quotation.number,
      signature: currentSignature,
    });
    return { id: result.quotation.id, number: result.quotation.number };
  }

  async function handleDownloadPdf() {
    setError(null);
    if (!canAct) {
      setError(`Completa tus datos antes de continuar: ${missing.join(", ")}.`);
      return;
    }
    setWorking("pdf");
    try {
      const quoted = await ensureSavedQuotation();
      if ("error" in quoted) throw new Error(quoted.error);

      const res = await fetch("/api/cotizacion/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationId: quoted.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo generar el PDF.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${quoted.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el PDF.");
    } finally {
      setWorking(null);
    }
  }

  async function handleWhatsApp() {
    setError(null);
    if (!canAct) {
      setError(`Completa tus datos antes de continuar: ${missing.join(", ")}.`);
      return;
    }
    setWorking("whatsapp");
    try {
      const quoted = await ensureSavedQuotation();
      if ("error" in quoted) throw new Error(quoted.error);

      const lines = [
        `Hola TECNOVA, quiero solicitar la cotización ${quoted.number}.`,
        "",
        `Cliente: ${customer.nombre}`,
        "",
        "Productos:",
        ...items.map((i) => `- ${i.qty} x ${i.name}`),
        "",
        `Total: ${formatUSD(total)}`,
      ];
      window.open(buildWhatsAppLink(lines.join("\n"), whatsappNumber), "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo preparar el mensaje de WhatsApp.");
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={working !== null || !canAct}
          className="flex-1 rounded-sm bg-paper px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-50"
        >
          {working === "pdf" ? "Generando PDF..." : "Generar cotización PDF"}
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          disabled={working !== null || !canAct}
          className="flex-1 rounded-sm border border-electric/60 bg-electric/10 px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-50"
        >
          {working === "whatsapp" ? "Preparando..." : "Enviar por WhatsApp"}
        </button>
      </div>
      {!whatsappNumber && (
        <p className="text-xs text-silver-dim">
          El número de WhatsApp de TECNOVA todavía no está configurado en Administración.
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
