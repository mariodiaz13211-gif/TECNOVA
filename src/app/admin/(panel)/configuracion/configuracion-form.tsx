"use client";

import { useActionState } from "react";
import { updateConfiguracion, type SettingsState } from "./actions";
import type { StoreSettings } from "@/lib/settings";

const input =
  "mt-1 w-full rounded-sm border border-line bg-panel px-3 py-2 text-sm text-paper outline-none focus:border-electric";
const label = "text-sm text-silver";

export function ConfiguracionForm({ initial }: { initial: StoreSettings }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateConfiguracion,
    {},
  );

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <div>
        <label className={label} htmlFor="storeName">Nombre de la tienda</label>
        <input id="storeName" name="storeName" required defaultValue={initial.storeName} className={input} />
      </div>

      <div>
        <label className={label} htmlFor="whatsappNumber">Número de WhatsApp</label>
        <input
          id="whatsappNumber"
          name="whatsappNumber"
          defaultValue={initial.whatsappNumber}
          placeholder="50370001234"
          className={input}
        />
        <p className="mt-1 text-xs text-silver-dim">
          Solo dígitos, con el código de país adelante (El Salvador: 503). Sin &quot;+&quot; ni espacios.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="shippingCost">Costo de envío nacional (USD)</label>
          <input
            id="shippingCost"
            name="shippingCost"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={initial.shippingCost}
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="freeShippingFrom">Envío gratis desde (USD)</label>
          <input
            id="freeShippingFrom"
            name="freeShippingFrom"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={initial.freeShippingFrom}
            className={input}
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-400">{state.error}</p>
      )}
      {state.ok && <p className="text-sm text-cyan">{state.ok}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-paper px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}
