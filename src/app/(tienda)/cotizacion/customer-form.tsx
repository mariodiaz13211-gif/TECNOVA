"use client";

import { useState, type FormEvent } from "react";
import { useCart } from "@/components/cart-context";
import { missingCustomerFields } from "@/lib/customer-validation";

const input =
  "mt-1 w-full rounded-sm border border-line bg-panel px-3 py-2 text-sm text-paper outline-none focus:border-electric";
const label = "text-sm text-silver";

export function CustomerForm() {
  const { customer, setCustomer } = useCart();
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState(false);

  const missing = missingCustomerFields(customer);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    setSaved(false);
    if (missing.length === 0) setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="font-display text-lg text-paper">Tus datos</h2>

      <div>
        <label className={label} htmlFor="nombre">Nombre completo</label>
        <input
          id="nombre"
          value={customer.nombre}
          onChange={(e) => { setCustomer({ nombre: e.target.value }); setSaved(false); }}
          className={input}
        />
      </div>

      <div>
        <label className={label} htmlFor="telefono">Número de teléfono</label>
        <input
          id="telefono"
          type="tel"
          value={customer.telefono}
          onChange={(e) => { setCustomer({ telefono: e.target.value }); setSaved(false); }}
          className={input}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="departamento">Departamento</label>
          <input
            id="departamento"
            value={customer.departamento}
            onChange={(e) => { setCustomer({ departamento: e.target.value }); setSaved(false); }}
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="municipio">Municipio</label>
          <input
            id="municipio"
            value={customer.municipio}
            onChange={(e) => { setCustomer({ municipio: e.target.value }); setSaved(false); }}
            className={input}
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="direccion">Dirección de entrega</label>
        <textarea
          id="direccion"
          rows={3}
          value={customer.direccion}
          onChange={(e) => { setCustomer({ direccion: e.target.value }); setSaved(false); }}
          className={input}
        />
      </div>

      {touched && missing.length > 0 && (
        <p role="alert" className="text-sm text-red-400">
          Falta completar: {missing.join(", ")}.
        </p>
      )}
      {saved && (
        <p className="text-sm text-cyan">
          Datos guardados. El envío de la cotización se habilitará en el siguiente paso.
        </p>
      )}

      <button
        type="submit"
        className="rounded-sm bg-paper px-5 py-2.5 text-sm font-medium text-ink"
      >
        Guardar mis datos
      </button>
    </form>
  );
}
