import { cn } from "@/lib/utils";

type Variant = "red" | "yellow" | "blue" | "green" | "stone" | "black";

const variantClasses: Record<Variant, string> = {
  red: "bg-lego-red text-white",
  yellow: "bg-lego-yellow text-lego-black",
  blue: "bg-lego-blue text-white",
  green: "bg-lego-green text-white",
  stone: "bg-lego-stone text-lego-black",
  black: "bg-lego-black text-lego-cream",
};

export function ChunkyBadge({
  variant = "stone",
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
        "inline-block rounded-md border-2 border-lego-black px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
