import { cn } from "@/lib/utils";

// Брендовые цвета O'LINE из логотипа
const DARK = "#1F5240"; // тёмно-зелёный (основной)
const LIGHT = "#7CB342"; // светло-зелёный (акцент)
const WHITE = "#FFFFFF";

type Variant = "default" | "on-dark";

export function LogoMark({
  size = 32,
  variant = "default",
  className,
}: {
  size?: number;
  variant?: Variant;
  className?: string;
}) {
  // Тёмный сегмент → белый на тёмном фоне, светлый сектор всегда sage
  const ringColor = variant === "on-dark" ? WHITE : DARK;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Кольцо с разрезом на правой стороне */}
      <circle
        cx="32"
        cy="32"
        r="20"
        stroke={ringColor}
        strokeWidth="12"
        strokeDasharray="105 21"
        strokeDashoffset="-22"
        transform="rotate(-90 32 32)"
      />
      {/* Светло-зелёный сектор сверху-слева */}
      <circle
        cx="32"
        cy="32"
        r="20"
        stroke={LIGHT}
        strokeWidth="12"
        strokeDasharray="34 200"
        strokeDashoffset="-92"
        transform="rotate(-90 32 32)"
      />
      {/* Точка-апостроф */}
      <circle cx="49" cy="10" r="4" fill={LIGHT} />
    </svg>
  );
}

export function Logo({
  size = 28,
  variant = "default",
  className,
  textClassName,
}: {
  size?: number;
  variant?: Variant;
  className?: string;
  textClassName?: string;
}) {
  const textColor = variant === "on-dark" ? WHITE : DARK;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} variant={variant} />
      <span
        className={cn("font-black tracking-tight", textClassName)}
        style={{ fontSize: size * 0.78, color: textColor, letterSpacing: "-0.02em" }}
      >
        LINE
      </span>
    </span>
  );
}
