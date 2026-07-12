import React from "react";

export type LottoBallDecade = "yellow" | "blue" | "red" | "gray" | "green";

const DECADE_STYLES: Record<
  LottoBallDecade,
  { bg: string; text: string; shadow: string }
> = {
  yellow: {
    bg: "radial-gradient(circle at 30% 28%, #fff7c2 0%, #facc15 42%, #ca8a04 100%)",
    text: "#1c1917",
    shadow: "0 2px 4px rgba(0,0,0,0.35), inset 0 -2px 3px rgba(0,0,0,0.15)",
  },
  blue: {
    bg: "radial-gradient(circle at 30% 28%, #bfdbfe 0%, #3b82f6 42%, #1d4ed8 100%)",
    text: "#ffffff",
    shadow: "0 2px 4px rgba(0,0,0,0.35), inset 0 -2px 3px rgba(0,0,0,0.2)",
  },
  red: {
    bg: "radial-gradient(circle at 30% 28%, #fecaca 0%, #ef4444 42%, #b91c1c 100%)",
    text: "#ffffff",
    shadow: "0 2px 4px rgba(0,0,0,0.35), inset 0 -2px 3px rgba(0,0,0,0.2)",
  },
  gray: {
    bg: "radial-gradient(circle at 30% 28%, #e2e8f0 0%, #94a3b8 42%, #64748b 100%)",
    text: "#0f172a",
    shadow: "0 2px 4px rgba(0,0,0,0.35), inset 0 -2px 3px rgba(0,0,0,0.18)",
  },
  green: {
    bg: "radial-gradient(circle at 30% 28%, #bbf7d0 0%, #22c55e 42%, #15803d 100%)",
    text: "#ffffff",
    shadow: "0 2px 4px rgba(0,0,0,0.35), inset 0 -2px 3px rgba(0,0,0,0.2)",
  },
};

export function lottoBallDecade(n: number): LottoBallDecade {
  if (n <= 10) return "yellow";
  if (n <= 20) return "blue";
  if (n <= 30) return "red";
  if (n <= 40) return "gray";
  return "green";
}

interface LottoBallProps {
  number: number;
  count?: number;
  size?: number;
  /** When false, renders a non-interactive span (display-only). Default true when onClick is set. */
  interactive?: boolean;
  onClick?: (number: number) => void;
  className?: string;
}

export default function LottoBall({
  number,
  count,
  size = 26,
  interactive,
  onClick,
  className = "",
}: LottoBallProps) {
  const decade = lottoBallDecade(number);
  const style = DECADE_STYLES[decade];
  const title = count !== undefined ? `${number}번 · ${count}회` : `${number}번`;
  const isInteractive = interactive ?? Boolean(onClick);

  const visual = (
    <>
      <span
        className="pointer-events-none absolute rounded-full opacity-70"
        style={{
          width: "38%",
          height: "22%",
          top: "14%",
          left: "18%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))",
        }}
      />
      <span className="relative z-10 leading-none">{number}</span>
    </>
  );

  const sharedStyle: React.CSSProperties = {
    width: size,
    height: size,
    fontSize: size * 0.38,
    background: style.bg,
    color: style.text,
    boxShadow: style.shadow,
  };

  if (!isInteractive) {
    return (
      <span
        title={title}
        aria-label={title}
        className={`relative shrink-0 rounded-full font-black inline-flex items-center justify-center ${className}`}
        style={sharedStyle}
      >
        {visual}
      </span>
    );
  }

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={() => onClick?.(number)}
      className={`relative shrink-0 rounded-full font-black flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer ${className}`}
      style={sharedStyle}
    >
      {visual}
    </button>
  );
}
