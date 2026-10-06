// Valores de respaldo, solo para el primer instante antes de que la
// configuración cargue desde /admin/configuracion (tabla "settings"). La
// fuente de verdad ahora es esa tabla — ver src/lib/settings.ts.
export const SHIPPING_COST = 3;
export const SHIPPING_FREE_FROM = 30;

export function shippingFor(subtotal: number, cost: number, freeFrom: number) {
  return subtotal >= freeFrom ? 0 : cost;
}
