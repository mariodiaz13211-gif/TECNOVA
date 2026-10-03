// Único lugar donde vive el número de WhatsApp de TECNOVA. Para cambiarlo,
// edita la variable de entorno NEXT_PUBLIC_WHATSAPP_NUMBER en Vercel
// (Settings > Environment Variables) — no hace falta tocar código.
// Formato: código de país + número, sin "+" ni espacios. El Salvador: 503XXXXXXXX.
const RAW_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export function hasWhatsAppNumber() {
  return RAW_NUMBER.trim().length > 0;
}

/** Arma el enlace de WhatsApp con el mensaje ya redactado (el cliente debe pulsar Enviar). */
export function buildWhatsAppLink(message: string) {
  const number = RAW_NUMBER.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
