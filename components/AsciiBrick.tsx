import { cn } from "@/lib/utils";

const BRICK = `   _________
  / o    o /|
 /________/ |
 |        |/
 '--------'`;

type Size = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  xs: "text-[7px] leading-[1]",
  sm: "text-[10px] leading-[1.05]",
  md: "text-sm leading-[1.1]",
  lg: "text-2xl leading-[1.1]",
};

export function AsciiBrick({
  size = "sm",
  className,
  color = "text-lego-yellow",
}: {
  size?: Size;
  className?: string;
  color?: string;
}) {
  return (
    <pre
      aria-hidden
      className={cn(
        "select-none whitespace-pre font-mono",
        sizeClasses[size],
        color,
        className,
      )}
    >
      {BRICK}
    </pre>
  );
}
