import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn("relative", className)}>
      <select
        {...props}
        className={cn(
          "w-full appearance-none rounded-md border border-line bg-surface-3 px-3 py-2 pr-8 text-sm text-fg transition-colors hover:border-fg-dim focus:border-lego-yellow focus:outline-none",
        )}
      >
        {children}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-fg-muted"
      >
        ▾
      </span>
    </div>
  );
}
