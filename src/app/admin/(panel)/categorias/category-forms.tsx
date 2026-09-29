"use client";

import { useActionState, useRef } from "react";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryState,
} from "./actions";

const input =
  "rounded-sm border border-line bg-panel px-3 py-2 text-sm text-paper outline-none focus:border-electric";

export function CreateCategoryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<CategoryState, FormData>(
    async (prev, formData) => {
      const result = await createCategory(prev, formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    {},
  );

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-48">
        <label htmlFor="new-name" className="text-sm text-silver">
          Nueva categoría
        </label>
        <input
          id="new-name"
          name="name"
          required
          placeholder="Ej. Audífonos"
          className={`${input} mt-1 w-full`}
        />
      </div>
      <div className="w-24">
        <label htmlFor="new-pos" className="text-sm text-silver">
          Orden
        </label>
        <input
          id="new-pos"
          name="position"
          type="number"
          min={0}
          defaultValue={0}
          className={`${input} mt-1 w-full`}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-paper px-4 py-2 text-sm font-medium text-ink disabled:opacity-60"
      >
        {pending ? "Creando..." : "Crear categoría"}
      </button>
      {state.error && (
        <p role="alert" className="w-full text-sm text-red-400">
          {state.error}
        </p>
      )}
      {state.ok && <p className="w-full text-sm text-cyan">{state.ok}</p>}
    </form>
  );
}

export function CategoryRow({
  category,
  productCount,
}: {
  category: { id: string; name: string; position: number; active: boolean };
  productCount: number;
}) {
  const [state, formAction, pending] = useActionState<CategoryState, FormData>(
    updateCategory,
    {},
  );

  return (
    <li className="border border-line bg-panel/60 p-4">
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={category.id} />
        <input
          name="name"
          defaultValue={category.name}
          required
          aria-label="Nombre de la categoría"
          className={`${input} min-w-48 flex-1`}
        />
        <input
          name="position"
          type="number"
          min={0}
          defaultValue={category.position}
          aria-label="Orden"
          className={`${input} w-20`}
        />
        <label className="flex items-center gap-2 text-sm text-silver">
          <input
            type="checkbox"
            name="active"
            defaultChecked={category.active}
            className="h-4 w-4 accent-electric"
          />
          Visible
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm border border-electric/60 bg-electric/10 px-3 py-2 text-sm text-paper disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar"}
        </button>
      </form>

      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span className="text-silver-dim">
          {productCount} {productCount === 1 ? "producto" : "productos"}
        </span>
        <div className="flex items-center gap-4">
          {state.error && (
            <span role="alert" className="text-red-400">
              {state.error}
            </span>
          )}
          {state.ok && <span className="text-cyan">{state.ok}</span>}
          <form
            action={deleteCategory}
            onSubmit={(e) => {
              const msg =
                productCount > 0
                  ? `Se eliminará "${category.name}". Sus ${productCount} productos se conservarán, pero quedarán sin categoría. ¿Continuar?`
                  : `¿Eliminar la categoría "${category.name}"?`;
              if (!window.confirm(msg)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={category.id} />
            <button type="submit" className="text-silver hover:text-red-400">
              Eliminar
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}
