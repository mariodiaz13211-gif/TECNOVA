import type { Customer } from "@/components/cart-context";

/**
 * "Huella" de una combinación de productos+datos del cliente. Si no cambia
 * entre un clic en "Generar PDF" y otro en "Enviar por WhatsApp", ambos
 * botones reutilizan la MISMA cotización ya guardada en vez de crear una
 * segunda fila en la base de datos.
 */
export function quoteSignature(items: { productId: string; qty: number }[], customer: Customer) {
  const itemsPart = items
    .map((i) => `${i.productId}:${i.qty}`)
    .sort()
    .join(",");
  const customerPart = [customer.nombre, customer.telefono, customer.direccion, customer.departamento, customer.municipio]
    .map((v) => v.trim())
    .join("|");
  return `${itemsPart}__${customerPart}`;
}
