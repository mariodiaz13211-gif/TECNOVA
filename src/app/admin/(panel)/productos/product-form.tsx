"use client";

import { useActionState } from "react";
import Image from "next/image";
import { createProduct, updateProduct, type ProductState } from "./actions";
import { PriceTiersEditor, type Tier } from "./price-tiers-editor";

const input =
  "mt-1 w-full rounded-sm border border-line bg-panel px-3 py-2 text-sm text-paper outline-none focus:border-electric";
const label = "text-sm text-silver";

type Category = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  description: string;
  categoryId: string | null;
  basePrice: string;
  status: "AVAILABLE" | "SOLD_OUT";
  featured: boolean;
  onSale: boolean;
  salePrice: string | null;
  active: boolean;
  imageUrl: string | null;
  tiers: Tier[];
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormValues;
}) {
  const isEdit = Boolean(initial?.id);
  const action = isEdit ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState<ProductState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}

      <div>
        <label className={label} htmlFor="name">Nombre del producto</label>
        <input
          id="name"
          name="name"
          required
          defaultValue={initial?.name}
          className={input}
        />
      </div>

      <div>
        <label className={label} htmlFor="description">Descripción</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initial?.description}
          className={input}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="categoryId">Categoría</label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={initial?.categoryId ?? ""}
            className={input}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="basePrice">Precio normal (USD)</label>
          <input
            id="basePrice"
            name="basePrice"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={initial?.basePrice}
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="status">Disponibilidad</label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "AVAILABLE"}
            className={input}
          >
            <option value="AVAILABLE">Disponible</option>
            <option value="SOLD_OUT">Agotado</option>
          </select>
          <p className="mt-1 text-xs text-silver-dim">
            El cliente solo ve este estado, nunca una cantidad en inventario.
          </p>
        </div>

        <div className="flex flex-col justify-end gap-2 pb-1">
          <label className="flex items-center gap-2 text-sm text-silver">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={initial?.featured}
              className="h-4 w-4 accent-electric"
            />
            Producto destacado
          </label>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-silver">
              <input
                type="checkbox"
                name="active"
                defaultChecked={initial?.active ?? true}
                className="h-4 w-4 accent-electric"
              />
              Visible en la tienda
            </label>
          )}
        </div>
      </div>

      <div className="corner-cut border border-line bg-panel/40 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-paper">
          <input
            type="checkbox"
            name="onSale"
            defaultChecked={initial?.onSale}
            className="h-4 w-4 accent-cyan"
          />
          Producto en oferta
        </label>
        <div className="mt-3">
          <label className={label} htmlFor="salePrice">Precio de oferta (USD)</label>
          <input
            id="salePrice"
            name="salePrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initial?.salePrice ?? ""}
            className={`${input} max-w-40`}
          />
        </div>
      </div>

      <div>
        <p className={label}>Imagen principal</p>
        {initial?.imageUrl && (
          <div className="mt-2 flex items-center gap-3">
            <Image
              src={initial.imageUrl}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 rounded-sm border border-line object-cover"
              unoptimized
            />
            <label className="flex items-center gap-2 text-sm text-silver">
              <input type="checkbox" name="removeImage" className="h-4 w-4 accent-electric" />
              Quitar imagen actual
            </label>
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="mt-2 block w-full text-sm text-silver file:mr-3 file:rounded-sm file:border file:border-line file:bg-panel file:px-3 file:py-1.5 file:text-paper"
        />
        <p className="mt-1 text-xs text-silver-dim">JPG, PNG, WEBP o GIF, máximo 4 MB.</p>
      </div>

      <div>
        <p className={label}>Precios por cantidad</p>
        <div className="mt-2">
          <PriceTiersEditor initial={initial?.tiers ?? []} />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-paper px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
      >
        {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}
