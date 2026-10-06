import { getSettings } from "@/lib/settings";
import { ConfiguracionForm } from "./configuracion-form";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Configuración</h1>
      <p className="mt-2 text-sm text-silver">
        Estos valores los usa toda la tienda: el catálogo, la cotización, el PDF y el mensaje de
        WhatsApp.
      </p>
      <div className="mt-8">
        <ConfiguracionForm initial={settings} />
      </div>
    </div>
  );
}
