"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  createManualSetAction,
  searchSetsAction,
} from "@/app/add/actions";
import type { LegoSet } from "@/lib/db/schema";

export function SetTypeahead() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LegoSet[]>([]);
  const [selected, setSelected] = useState<LegoSet | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected || !query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await searchSetsAction(query);
        if (!cancelled) {
          setResults(r);
          setSearched(true);
          setOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, selected]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (selected) {
    return (
      <div>
        <input type="hidden" name="set_code" value={selected.setCode} />
        <label className="block text-sm font-bold uppercase tracking-wide text-fg-muted">
          Set
        </label>
        <div className="mt-1 flex items-center gap-3 rounded border border-line bg-surface-2 p-3">
          {selected.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.imageUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded bg-surface object-contain"
            />
          ) : (
            <div className="h-16 w-16 shrink-0 rounded bg-surface" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base leading-tight text-fg">
              {selected.setName}
            </p>
            <p className="truncate text-xs text-fg-muted">
              {selected.setCode} · {selected.theme}
              {selected.year ? ` · ${selected.year}` : ""}
              {selected.pieces ? ` · ${selected.pieces} piezas` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setQuery("");
              setResults([]);
              setSearched(false);
              setManualMode(false);
            }}
            className="shrink-0 text-xs uppercase text-fg-muted underline hover:text-fg"
          >
            Cambiar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-bold uppercase tracking-wide text-fg-muted">
        Set
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setManualMode(false);
        }}
        onFocus={() => (results.length > 0 || searched) && setOpen(true)}
        placeholder="Busca por código o nombre…"
        autoComplete="off"
        className="mt-1 w-full rounded border border-line bg-surface-3 px-3 py-2 text-fg placeholder:text-fg-dim focus:border-lego-yellow focus:outline-none"
      />

      {open && (loading || results.length > 0) && (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded border border-line bg-surface-2 shadow-lg">
          {loading && (
            <li className="px-3 py-2 text-sm text-fg-muted">Buscando…</li>
          )}
          {!loading &&
            results.map((set) => (
              <li
                key={set.setCode}
                className="border-t border-line/60 first:border-t-0"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelected(set);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 p-2 text-left hover:bg-surface-3"
                >
                  {set.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={set.imageUrl}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded bg-surface object-contain"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded bg-surface" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm leading-tight text-fg">
                      {set.setName}
                    </p>
                    <p className="truncate text-xs text-fg-dim">
                      {set.setCode} · {set.theme}
                      {set.year ? ` · ${set.year}` : ""}
                    </p>
                  </div>
                </button>
              </li>
            ))}
        </ul>
      )}

      {open &&
        !loading &&
        searched &&
        results.length === 0 &&
        !manualMode && (
          <div className="absolute z-10 mt-1 w-full rounded border border-line bg-surface-2 p-3 shadow-lg">
            <p className="text-sm text-fg-muted">
              Sin resultados para “{query}”. Probé también en Rebrickable.
            </p>
            <button
              type="button"
              onClick={() => setManualMode(true)}
              className="mt-2 text-xs font-bold uppercase tracking-wide text-lego-yellow hover:text-lego-yellow-deep"
            >
              Añadirlo a mano +
            </button>
          </div>
        )}

      {manualMode && (
        <ManualSetForm
          initialCode={query}
          onCreated={(set) => {
            setSelected(set);
            setManualMode(false);
            setOpen(false);
          }}
          onCancel={() => setManualMode(false)}
        />
      )}
    </div>
  );
}

function ManualSetForm({
  initialCode,
  onCreated,
  onCancel,
}: {
  initialCode: string;
  onCreated: (set: LegoSet) => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [year, setYear] = useState("");
  const [pieces, setPieces] = useState("");

  function submit() {
    setError(null);
    const codeT = code.trim();
    const nameT = name.trim();
    if (!codeT) {
      setError("El código es obligatorio.");
      return;
    }
    if (!nameT) {
      setError("El nombre es obligatorio.");
      return;
    }
    const yearN = year.trim() ? Number.parseInt(year.trim(), 10) : NaN;
    const piecesN = pieces.trim() ? Number.parseInt(pieces.trim(), 10) : NaN;

    startTransition(async () => {
      try {
        const set = await createManualSetAction({
          setCode: codeT,
          setName: nameT,
          theme: theme.trim(),
          year: Number.isFinite(yearN) ? yearN : null,
          pieces: Number.isFinite(piecesN) ? piecesN : null,
        });
        onCreated(set);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      }
    });
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  const inputClass =
    "w-full rounded-md border border-line bg-surface-3 px-3 py-2 text-sm text-fg placeholder:text-fg-dim focus:border-lego-yellow focus:outline-none";

  return (
    <div className="mt-2 space-y-3 rounded-md border border-line bg-surface-2 p-4">
      <p className="text-xs uppercase tracking-wide text-fg-muted">
        Añadir set a mano
      </p>

      <div>
        <label className="mb-1 block text-xs text-fg-muted">Código *</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={onKey}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-fg-muted">Nombre *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKey}
          placeholder="Mi MOC, set promo, etc."
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-fg-muted">Tema</label>
        <input
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          onKeyDown={onKey}
          placeholder="Sin clasificar"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs text-fg-muted">Año</label>
          <input
            type="number"
            min="1949"
            max="2099"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            onKeyDown={onKey}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-fg-muted">Piezas</label>
          <input
            type="number"
            min="0"
            value={pieces}
            onChange={(e) => setPieces(e.target.value)}
            onKeyDown={onKey}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p className="rounded border border-lego-red/40 bg-lego-red/10 px-3 py-2 text-sm text-lego-red">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded bg-lego-yellow px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-surface hover:bg-lego-yellow-deep disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Crear y usar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs uppercase tracking-wide text-fg-muted underline hover:text-fg"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
