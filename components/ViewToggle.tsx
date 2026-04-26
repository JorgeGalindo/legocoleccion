"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function ViewToggle({ current }: { current: "grid" | "list" }) {
  const router = useRouter();
  const sp = useSearchParams();

  function set(view: "grid" | "list") {
    const next = new URLSearchParams(sp.toString());
    if (view === "grid") next.delete("view");
    else next.set("view", view);
    const qs = next.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  }

  return (
    <div className="inline-flex overflow-hidden rounded border border-line text-xs uppercase tracking-wide">
      <button
        type="button"
        onClick={() => set("grid")}
        className={cn(
          "px-3 py-1.5",
          current === "grid"
            ? "bg-lego-yellow text-surface"
            : "bg-surface-2 text-fg-muted hover:text-fg",
        )}
      >
        Grid
      </button>
      <button
        type="button"
        onClick={() => set("list")}
        className={cn(
          "px-3 py-1.5",
          current === "list"
            ? "bg-lego-yellow text-surface"
            : "bg-surface-2 text-fg-muted hover:text-fg",
        )}
      >
        Lista
      </button>
    </div>
  );
}
