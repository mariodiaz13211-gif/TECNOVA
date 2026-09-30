"use client";

import { useId, useState } from "react";

export type Tier = {
  key: string;
  minQty: string;
  maxQty: string;
  type: "FIXED_PRICE" | "PERCENT_OFF";
  value: string;
};

const input =
  "rounded-sm border border-line bg-panel px-2 py-1.5 text-sm text-paper outline-none focus:border-electric";

export function PriceTiersEditor({ initial }: { initial: Tier[] }) {
  const [tiers, setTiers] = useState<Tier[]>(initial);
  const reactId = useId();

  function update(key: string, patch: Partial<Tier>) {
    setTiers((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setTiers((rows) => [
      ...rows,
      { key: `${reactId}-${rows.length}-${Date.now()}`, minQty: "", maxQty: "", type: "FIXED_PRICE", value: "" },
    ]);
  }

  function removeRow(key: string) {
    setTiers((rows) => rows.filter((r) => r.key !== key));
  }

  const payload = tiers
    .filter((t) => t.minQty !== "" && t.value !== "")
    .map((t) => ({
      minQty: Number(t.minQty),
      maxQty: t.maxQty === "" ? null : Number(t.maxQty),
      type: t.type,
      value: Number(t.value),
    }));

  return (
    <div>
      <input type="hidden" name="tiers" value={JSON.stringify(payload)} />

      {tiers.length === 0 && (
        <p className="text-sm text-silver">
          Sin precios por cantidad: se usará siempre el precio normal.
        </p>
      )}

      <div className="space-y-2">
        {tiers.map((tier) => (
          <div key={tier.key} className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={1}
              placeholder="Desde"
              aria-label="Cantidad mínima"
              value={tier.minQty}
              onChange={(e) => update(tier.key, { minQty: e.target.value })}
              className={`${input} w-24`}
            />
            <span className="text-silver-dim">a</span>
            <input
              type="number"
              min={1}
              placeholder="Sin límite"
              aria-label="Cantidad máxima (opcional)"
              value={tier.maxQty}
              onChange={(e) => update(tier.key, { maxQty: e.target.value })}
              className={`${input} w-28`}
            />
            <select
              aria-label="Tipo"
              value={tier.type}
              onChange={(e) => update(tier.key, { type: e.target.value as Tier["type"] })}
              className={input}
            >
              <option value="FIXED_PRICE">Precio por unidad ($)</option>
              <option value="PERCENT_OFF">Descuento (%)</option>
            </select>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder={tier.type === "PERCENT_OFF" ? "% off" : "$ c/u"}
              aria-label="Valor"
              value={tier.value}
              onChange={(e) => update(tier.key, { value: e.target.value })}
              className={`${input} w-28`}
            />
            <button
              type="button"
              onClick={() => removeRow(tier.key)}
              className="text-sm text-silver hover:text-red-400"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 rounded-sm border border-line px-3 py-1.5 text-sm text-paper hover:border-electric/60"
      >
        + Agregar nivel de precio
      </button>
    </div>
  );
}
