import { cn } from "@/lib/utils";

export function PaaveWordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: "text-base tracking-[-0.8px]",
    md: "text-xl tracking-[-1px]",
    lg: "text-3xl tracking-[-1.5px]",
  };
  return (
    <span
      className={cn(
        "font-pretendard font-bold uppercase text-text-neo-primary leading-none",
        sizeMap[size],
        className,
      )}
    >
      PAAVE
    </span>
  );
}
