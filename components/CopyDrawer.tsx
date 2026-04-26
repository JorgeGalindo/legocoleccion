"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
  deleteCopyAction,
  updateCopyAction,
  type UpdateCopyState,
} from "@/app/actions";
import type { LegoSet, OwnedCopy } from "@/lib/db/schema";

const BAD_CHECK_ROW =
  "flex items-center gap-2 rounded-md bg-lego-red/8 px-3 py-2 ring-1 ring-lego-red/25";

const initialState: UpdateCopyState = { ok: false };

export function CopyDrawer({
  copy,
  set,
}: {
  copy: OwnedCopy;
  set: LegoSet;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isDeleting, startDelete] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const action = updateCopyAction.bind(null, copy.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  function close() {
    const next = new URLSearchParams(sp.toString());
    next.delete("copy");
    const qs = next.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  function onDelete() {
    startDelete(async () => {
      await deleteCopyAction(copy.id);
      close();
    });
  }

  return (
    <div
      className="fixed inset-0 z-30 flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={close}
        className="absolute inset-0 bg-black/60"
      />
      <div className="relative h-full w-full max-w-md overflow-auto border-l border-line bg-surface-2 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="font-display text-lg text-fg">Editar copia</h3>
          <button
            type="button"
            onClick={close}
            className="text-xs uppercase tracking-wide text-fg-muted hover:text-fg"
          >
            Cerrar ✕
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex gap-3 rounded border border-line bg-surface p-3">
            {set.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={set.imageUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded bg-surface-2 object-contain"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded bg-surface-2" />
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-base leading-tight text-fg">
                {set.setName}
              </p>
              <p className="truncate text-xs text-fg-muted">
                {set.setCode} · {set.theme}
                {set.year ? ` · ${set.year}` : ""}
                {set.pieces ? ` · ${set.pieces} piezas` : ""}
              </p>
            </div>
          </div>

          <form action={formAction} className="space-y-5">
            <fieldset className="space-y-2">
              <label className={BAD_CHECK_ROW}>
                <input
                  type="checkbox"
                  name="box_opened"
                  defaultChecked={copy.boxOpened}
                  className="h-4 w-4 accent-lego-red"
                />
                <span className="text-sm">Caja abierta</span>
              </label>
              <label className={BAD_CHECK_ROW}>
                <input
                  type="checkbox"
                  name="missing_pieces"
                  defaultChecked={copy.complete === "missing_pieces"}
                  className="h-4 w-4 accent-lego-red"
                />
                <span className="text-sm">Faltan piezas</span>
              </label>
              <label className={BAD_CHECK_ROW}>
                <input
                  type="checkbox"
                  name="discontinued"
                  defaultChecked={copy.discontinued}
                  className="h-4 w-4 accent-lego-red"
                />
                <span className="text-sm">Descatalogado</span>
              </label>
            </fieldset>

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
                  defaultValue={copy.purchasePrice ?? ""}
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
                  defaultValue={copy.purchaseDate ? copy.purchaseDate.slice(0, 7) : ""}
                  className="w-full rounded-md border border-line bg-surface-3 px-3 py-2 text-fg focus:border-lego-yellow focus:outline-none"
                />
              </div>
            </div>

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
                defaultValue={copy.notes ?? ""}
                className="w-full rounded border border-line bg-surface px-3 py-2 text-fg focus:border-lego-yellow focus:outline-none"
              />
            </div>

            {state.error && (
              <p className="rounded border border-lego-red bg-lego-red/10 px-3 py-2 text-sm text-lego-red">
                {state.error}
              </p>
            )}
            {state.ok && (
              <p className="rounded border border-lego-green bg-lego-green/10 px-3 py-2 text-sm text-lego-green">
                Guardado.
              </p>
            )}

            <div className="flex items-center justify-between gap-2 pt-2">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="rounded bg-lego-red px-3 py-1.5 text-xs font-bold uppercase text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {isDeleting ? "Borrando…" : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs uppercase text-fg-muted underline hover:text-fg"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs uppercase tracking-wide text-lego-red underline hover:opacity-90"
                >
                  Borrar
                </button>
              )}
              <button
                type="submit"
                disabled={pending}
                className="rounded bg-lego-yellow px-4 py-2 font-bold uppercase tracking-wide text-surface hover:bg-lego-yellow-deep disabled:opacity-50"
              >
                {pending ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
