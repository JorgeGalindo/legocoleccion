"use client";

import { useActionState, useEffect, useState } from "react";
import { SetTypeahead } from "@/components/SetTypeahead";
import { createCopyAction, type CreateCopyState } from "./actions";

const initialState: CreateCopyState = { ok: false };

const currentMonth = () => new Date().toISOString().slice(0, 7);

const BAD_CHECK_ROW =
  "flex items-center gap-2 rounded-md bg-lego-red/8 px-3 py-2 ring-1 ring-lego-red/25";

export function AddCopyForm() {
  const [state, formAction, pending] = useActionState(
    createCopyAction,
    initialState,
  );
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.ok && state.resetToken) {
      setFormKey((k) => k + 1);
    }
  }, [state]);

  return (
    <form key={formKey} action={formAction} className="space-y-8">
      <SetTypeahead />

      <fieldset className="space-y-2">
        <label className={BAD_CHECK_ROW}>
          <input
            type="checkbox"
            name="box_opened"
            className="h-4 w-4 accent-lego-red"
          />
          <span className="text-sm">Caja abierta</span>
        </label>

        <label className={BAD_CHECK_ROW}>
          <input
            type="checkbox"
            name="missing_pieces"
            className="h-4 w-4 accent-lego-red"
          />
          <span className="text-sm">Faltan piezas</span>
        </label>

        <label className={BAD_CHECK_ROW}>
          <input
            type="checkbox"
            name="discontinued"
            className="h-4 w-4 accent-lego-red"
          />
          <span className="text-sm">Descatalogado</span>
        </label>
      </fieldset>

      <fieldset className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="purchase_price"
              className="mb-1 block text-sm text-fg-muted"
            >
              Precio
            </label>
            <input
              id="purchase_price"
              type="number"
              name="purchase_price"
              step="0.01"
              min="0"
              inputMode="decimal"
              className="w-full rounded-md border border-line bg-surface-3 px-3 py-2 text-fg focus:border-lego-yellow focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="purchase_date"
              className="mb-1 block text-sm text-fg-muted"
            >
              Mes de compra
            </label>
            <input
              id="purchase_date"
              type="month"
              name="purchase_date"
              defaultValue={currentMonth()}
              className="w-full rounded-md border border-line bg-surface-3 px-3 py-2 text-fg focus:border-lego-yellow focus:outline-none"
            />
          </div>
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="notes"
          className="mb-1 block text-sm font-bold uppercase tracking-wide text-fg-muted"
        >
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded border border-line bg-surface-2 px-3 py-2 text-fg focus:border-lego-yellow focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="rounded border border-lego-red bg-lego-red/10 px-3 py-2 text-sm text-lego-red">
          {state.error}
        </p>
      )}

      {state.ok && state.resetToken && (
        <p
          key={state.resetToken}
          className="rounded border border-lego-green bg-lego-green/10 px-3 py-2 text-sm text-lego-green"
        >
          Copia añadida. Mete la siguiente.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          name="_action"
          value="save"
          disabled={pending}
          className="rounded bg-lego-yellow px-4 py-2 font-bold uppercase tracking-wide text-surface hover:bg-lego-yellow-deep disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="submit"
          name="_action"
          value="save_and_add_another"
          disabled={pending}
          className="rounded border border-line bg-surface-2 px-4 py-2 font-bold uppercase tracking-wide text-fg hover:border-lego-yellow disabled:opacity-50"
        >
          Guardar y añadir otra
        </button>
      </div>
    </form>
  );
}
