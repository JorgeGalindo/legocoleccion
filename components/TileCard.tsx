import { cn } from "@/lib/utils";

export function TileCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface-2 p-4 transition-colors hover:border-fg-dim",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
