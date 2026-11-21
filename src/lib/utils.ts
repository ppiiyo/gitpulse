export function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export function formatDelta(delta: number | null): string {
  if (delta === null || delta === 0) return "—";
  return delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`;
}
