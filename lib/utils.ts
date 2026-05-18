export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPriceUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDimensions(d: {
  widthInches: number;
  heightInches: number;
  depthInches?: number | null;
}): string {
  const base = `${d.heightInches} × ${d.widthInches}`;
  return d.depthInches ? `${base} × ${d.depthInches} in` : `${base} in`;
}
