"use client";

import { useEffect, useRef, useState } from "react";
import { searchSetsAction } from "@/app/add/actions";
import type { LegoSet } from "@/lib/db/schema";

export function SetTypeahead() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LegoSet[]>([]);
  const [selected, setSelected] = useState<LegoSet | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected || !query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await searchSetsAction(query);
        if (!cancelled) {
          setResults(r);
          setOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
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
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Busca por código o nombre…"
        autoComplete="off"
        className="mt-1 w-full rounded border border-line bg-surface-2 px-3 py-2 text-fg placeholder:text-fg-dim focus:border-lego-yellow focus:outline-none"
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
    </div>
  );
}
