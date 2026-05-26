interface SparklineProps {
  up?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ up = true, width = 72, height = 24, className }: SparklineProps) {
  const pts = up
    ? "0,18 8,16 16,17 24,12 32,14 40,9 48,11 56,6 64,8 72,3"
    : "0,6 8,8 16,7 24,12 32,10 40,15 48,13 56,18 64,16 72,21";
  const stroke = up ? "#B5E82F" : "#FF5B7A";
  const fill   = up ? "rgba(181,232,47,0.15)" : "rgba(255,91,122,0.15)";

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 72 24"
      aria-hidden
    >
      <polyline points={`${pts} 72,24 0,24`} fill={fill} stroke="none" />
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
