import { cn } from "@/lib/utils";

type Variant = "red" | "yellow" | "blue" | "green" | "neutral";

const variantClasses: Record<Variant, string> = {
  red: "bg-lego-red text-white",
  yellow: "bg-lego-yellow text-surface",
  blue: "bg-lego-blue text-white",
  green: "bg-lego-green text-white",
  neutral: "bg-surface-3 text-fg-muted",
};

export function ChunkyBadge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
