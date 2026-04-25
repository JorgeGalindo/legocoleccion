import { cn } from "@/lib/utils";

export function StudPattern({
  className,
  color = "var(--color-lego-yellow)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("h-3 w-full", className)}
      style={{
        backgroundImage: `radial-gradient(circle at 8px 6px, ${color} 3px, transparent 3.5px)`,
        backgroundSize: "16px 12px",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}
