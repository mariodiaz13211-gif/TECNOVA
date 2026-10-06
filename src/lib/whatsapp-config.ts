// El número de WhatsApp de TECNOVA ahora se configura desde
// /admin/configuracion (se guarda en PostgreSQL, ver src/lib/settings.ts).
// Esta función es solo el armador puro del enlace: recibe el número ya
// resuelto, sin leer nada por su cuenta, para que exista un único lugar
// (la pantalla de Configuración) donde cambiarlo.

/** Arma el enlace de WhatsApp con el mensaje ya redactado (el cliente debe pulsar Enviar). */
export function buildWhatsAppLink(message: string, rawNumber: string) {
  const number = rawNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
