"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SELECT_CLASS =
  "rounded border border-line bg-surface px-2 py-1.5 text-sm text-fg focus:border-lego-yellow focus:outline-none";

export function CollectionFilters({
  availableThemes,
}: {
  availableThemes: string[];
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [query, setQuery] = useState(sp.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(sp.get("q") ?? "");
  }, [sp]);

  function pushParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    next.delete("copy");
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "" || v === "all") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  function onQueryChange(v: string) {
    setQuery(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => pushParams({ q: v || null }), 300);
  }

  const hasFilters =
    !!sp.get("q") ||
    !!sp.get("themes") ||
    !!sp.get("box") ||
    !!sp.get("pieces") ||
    !!sp.get("disc") ||
    !!sp.get("year_min") ||
    !!sp.get("year_max");

  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface-2 p-4">
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Buscar en mi colección por código o nombre…"
        className="w-full rounded border border-line bg-surface px-3 py-2 text-fg placeholder:text-fg-dim focus:border-lego-yellow focus:outline-none"
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <select
          value={sp.get("themes") ?? "all"}
          onChange={(e) => pushParams({ themes: e.target.value })}
          className={SELECT_CLASS}
        >
          <option value="all">Todos los temas</option>
          {availableThemes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={sp.get("box") ?? "all"}
          onChange={(e) => pushParams({ box: e.target.value })}
          className={SELECT_CLASS}
        >
          <option value="all">Caja: todas</option>
          <option value="open">Abierta</option>
          <option value="closed">Cerrada</option>
        </select>

        <select
          value={sp.get("pieces") ?? "all"}
          onChange={(e) => pushParams({ pieces: e.target.value })}
          className={SELECT_CLASS}
        >
          <option value="all">Piezas: todas</option>
          <option value="complete">Completo</option>
          <option value="missing_pieces">Faltan piezas</option>
          <option value="unknown">Sin verificar</option>
        </select>

        <select
          value={sp.get("disc") ?? "all"}
          onChange={(e) => pushParams({ disc: e.target.value })}
          className={SELECT_CLASS}
        >
          <option value="all">Catálogo: todos</option>
          <option value="yes">Descatalogado</option>
          <option value="no">Vigente</option>
        </select>

        <div className="flex gap-1">
          <input
            type="number"
            placeholder="Desde"
            min="1949"
            max="2099"
            value={sp.get("year_min") ?? ""}
            onChange={(e) => pushParams({ year_min: e.target.value })}
            className={`${SELECT_CLASS} w-1/2`}
          />
          <input
            type="number"
            placeholder="Hasta"
            min="1949"
            max="2099"
            value={sp.get("year_max") ?? ""}
            onChange={(e) => pushParams({ year_max: e.target.value })}
            className={`${SELECT_CLASS} w-1/2`}
          />
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-xs uppercase tracking-wide text-fg-muted underline hover:text-fg"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
