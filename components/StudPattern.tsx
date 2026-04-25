import { cn } from "@/lib/utils";

export function StudPattern({
  className,
  color = "var(--color-lego-black)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("h-4 w-full", className)}
      style={{
        backgroundImage: `radial-gradient(circle at 8px 8px, ${color} 4px, transparent 4.5px)`,
        backgroundSize: "16px 16px",
        backgroundRepeat: "repeat",
      }}
    />
  );
}
