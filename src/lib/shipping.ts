// Política de envío de TECNOVA. Hoy son constantes; cuando exista una
// pantalla de Configuración, estos valores pasarán a leerse de la tabla
// "settings" en vez de estar fijos aquí.
export const SHIPPING_COST = 3;
export const SHIPPING_FREE_FROM = 30;

export function shippingFor(subtotal: number) {
  return subtotal >= SHIPPING_FREE_FROM ? 0 : SHIPPING_COST;
}
