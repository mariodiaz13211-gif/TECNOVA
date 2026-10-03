import type { Customer } from "@/components/cart-context";

export const REQUIRED_CUSTOMER_FIELDS: readonly [keyof Customer, string][] = [
  ["nombre", "Nombre completo"],
  ["telefono", "Número de teléfono"],
  ["departamento", "Departamento"],
  ["municipio", "Municipio"],
  ["direccion", "Dirección de entrega"],
];

/** Etiquetas de los campos del cliente que todavía faltan por completar. */
export function missingCustomerFields(customer: Customer) {
  return REQUIRED_CUSTOMER_FIELDS.filter(([key]) => !customer[key].trim()).map(([, label]) => label);
}
