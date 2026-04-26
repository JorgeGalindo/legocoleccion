import { cn } from "@/lib/utils";

type Variant =
  | "theme" // chunky yellow — categoría/tema
  | "good" // soft green — estado positivo
  | "bad" // soft red — estado negativo
  | "info" // chunky blue — informativo
  | "neutral"; // suave neutro

const variantClasses: Record<Variant, string> = {
  theme: "bg-lego-yellow text-surface",
  good: "bg-lego-green/15 text-lego-green",
  bad: "bg-lego-red/15 text-lego-red",
  info: "bg-lego-blue text-white",
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
