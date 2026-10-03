/**
 * Número de cotización provisional, generado en el navegador del cliente.
 * NO es un consecutivo garantizado ni se guarda en la base de datos todavía
 * (eso llega con el historial administrativo de cotizaciones, en una fase
 * posterior). Por ahora solo identifica la cotización en el PDF y el
 * mensaje de WhatsApp de esa visita.
 */
export function generateQuoteNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `COT-${yy}${mm}${dd}-${suffix}`;
}
