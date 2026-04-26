"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/Select";
import type { SortValue } from "@/lib/db/queries";

export function SortToggle({ current }: { current: SortValue }) {
  const router = useRouter();
  const sp = useSearchParams();

  function set(value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value === "recent") next.delete("sort");
    else next.set("sort", value);
    next.delete("copy");
    const qs = next.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  }

  return (
    <Select
      value={current}
      onChange={(e) => set(e.target.value)}
      className="w-44"
    >
      <option value="recent">Recién añadido</option>
      <option value="year_desc">Año LEGO ↓</option>
      <option value="year_asc">Año LEGO ↑</option>
      <option value="price_desc">Precio ↓</option>
      <option value="price_asc">Precio ↑</option>
      <option value="name_asc">Nombre A-Z</option>
    </Select>
  );
}
