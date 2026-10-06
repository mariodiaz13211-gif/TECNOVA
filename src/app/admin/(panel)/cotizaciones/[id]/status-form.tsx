"use client";

import { useActionState } from "react";
import { updateQuotationStatus, type UpdateStatusState } from "../actions";
import { STATUS_OPTIONS } from "../status-labels";

export function StatusForm({ id, status }: { id: string; status: string }) {
  const [state, formAction, pending] = useActionState<UpdateStatusState, FormData>(
    updateQuotationStatus,
    {},
  );

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        disabled={pending}
        className="rounded-sm border border-line bg-panel px-3 py-2 text-sm text-paper outline-none focus:border-electric disabled:opacity-60"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {STATUS_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {pending && <span className="text-xs text-silver-dim">Guardando...</span>}
      {state.ok && !pending && <span className="text-xs text-cyan">{state.ok}</span>}
      {state.error && !pending && <span className="text-xs text-red-400">{state.error}</span>}
    </form>
  );
}
