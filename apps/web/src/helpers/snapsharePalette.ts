/**
 * Shared SnapShare palette (builder / event landing / Save the Date tokens)
 * plus contrast helpers. Used by QR cards and the live screen.
 *
 * Hex values match packages/design/src/tokens.css. Derived --rose-ink / --rose-fill
 * / --gold-ink are text-safe companions (WCAG AA on ivory/paper, or light text on fill).
 */

export const SNAPSHARE = {
  espresso: "#12100e",
  ivory: "#f3eee6",
  gold: "#c9a36a",
  rose: "#dc5b66",
  bg: "#f3eee6",
  bg2: "#e8e0d4",
  paper: "#fffcfa",
  ink: "#161310",
  muted: "#5e564e",
  faint: "#8a8278",
  line: "rgba(22, 19, 16, 0.11)",
  deep: "#12100e",
  deep2: "#1c1814",
  live: "#2fbe6a",
  whatsapp: "#1fad4f",
  accent: "#c9a36a",
  accent2: "#dc5b66",
  /** Dark rose for text on ivory/paper (brand --rose is 3.17:1 on ivory). */
  roseInk: "#8a3540",
  /** Solid rose fill that supports light text at AA. */
  roseFill: "#8a3540",
  /** Dark gold/bronze for text on ivory/paper (brand --gold is 2.04:1). */
  goldInk: "#6e5228",
} as const;

export type SnapshareToken = keyof typeof SNAPSHARE;

/** Builder colour presets — same ids/values as hubWizardModel.PALETTES. */
export interface BuilderPalette {
  id: string;
  name: string;
  a: string | null;
  b: string | null;
}

export const BUILDER_PALETTES: BuilderPalette[] = [
  { id: "original", name: "של העיצוב", a: null, b: null },
  { id: "rose", name: "ורוד עתיק", a: "#A85A67", b: "#5C2F37" },
  { id: "olive", name: "זית", a: "#6E7D45", b: "#38401F" },
  { id: "navy", name: "כחול לילה", a: "#3E5F92", b: "#1C2B45" },
  { id: "terra", name: "טרקוטה", a: "#B8603A", b: "#5E2E19" },
  { id: "gold", name: "זהב", a: "#A97C3C", b: "#3A2A22" },
];

const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function isHex(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value.trim());
}

export function expandHex(value: string): string {
  const v = value.trim();
  if (v.length === 4) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`.toLowerCase();
  }
  return v.toLowerCase();
}

export function hexToRgb(value: string): [number, number, number] {
  const h = expandHex(value).slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function relativeLuminance(rgb: [number, number, number]): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}

export function contrastRatio(a: string, b: string): number {
  const L1 = relativeLuminance(hexToRgb(a));
  const L2 = relativeLuminance(hexToRgb(b));
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

export function isLightHex(color: string, threshold = 0.55): boolean {
  if (!isHex(color)) return false;
  return relativeLuminance(hexToRgb(color)) > threshold;
}

/** Light ink on dark surfaces, dark ink on light — always AA for normal text when possible. */
export function inkOn(background: string, minRatio = 4.5): string {
  const bg = isHex(background) ? expandHex(background) : SNAPSHARE.ivory;
  const light = SNAPSHARE.ivory;
  const dark = SNAPSHARE.ink;
  const lightRatio = contrastRatio(light, bg);
  const darkRatio = contrastRatio(dark, bg);
  if (darkRatio >= minRatio && lightRatio >= minRatio) {
    return relativeLuminance(hexToRgb(bg)) > 0.45 ? dark : light;
  }
  if (darkRatio >= lightRatio) return dark;
  return light;
}

export function passesAa(fg: string, bg: string, minRatio = 4.5): boolean {
  if (!isHex(fg) || !isHex(bg)) return false;
  return contrastRatio(fg, bg) >= minRatio;
}

export function resolveBuilderPalette(id: unknown): BuilderPalette | undefined {
  if (typeof id !== "string" || !id) return undefined;
  return BUILDER_PALETTES.find((p) => p.id === id);
}

export function accentFromPalette(id: unknown): { accent: string; accentInk: string; heading: string } {
  const pal = resolveBuilderPalette(id);
  const accent = pal?.a || SNAPSHARE.gold;
  const heading = pal?.b || SNAPSHARE.espresso;
  return { accent, accentInk: inkOn(accent), heading };
}

export function contrastIssues(
  pairs: Array<{ name: string; fg: string; bg: string; min?: number }>
): string[] {
  const errors: string[] = [];
  for (const p of pairs) {
    const min = p.min ?? 4.5;
    if (!passesAa(p.fg, p.bg, min)) {
      const ratio = isHex(p.fg) && isHex(p.bg) ? contrastRatio(p.fg, p.bg).toFixed(2) : "n/a";
      errors.push(`${p.name}: ${p.fg} on ${p.bg} is ${ratio}:1 (need ${min})`);
    }
  }
  return errors;
}

export function mixHex(a: string, b: string, amountB: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const t = Math.min(1, Math.max(0, amountB));
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${[r, g, bl].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** Fill + text pair that keeps the accent hue, meets WCAG AA, and respects polarity. */
export function contrastSafeFill(accent: string): { fill: string; ink: string } {
  const a = isHex(accent) ? expandHex(accent) : SNAPSHARE.gold;
  const lum = relativeLuminance(hexToRgb(a));
  if (lum <= 0.45 && passesAa(SNAPSHARE.ivory, a)) return { fill: a, ink: SNAPSHARE.ivory };
  if (lum >= 0.45 && passesAa(SNAPSHARE.ink, a)) return { fill: a, ink: SNAPSHARE.ink };
  if (lum <= 0.45) {
    for (let i = 1; i <= 12; i += 1) {
      const darker = mixHex(a, SNAPSHARE.espresso, i / 12);
      if (passesAa(SNAPSHARE.ivory, darker)) return { fill: darker, ink: SNAPSHARE.ivory };
    }
  } else {
    for (let i = 1; i <= 12; i += 1) {
      const lighter = mixHex(a, SNAPSHARE.ivory, i / 12);
      if (passesAa(SNAPSHARE.ink, lighter)) return { fill: lighter, ink: SNAPSHARE.ink };
    }
  }
  for (let i = 1; i <= 12; i += 1) {
    const darker = mixHex(a, SNAPSHARE.espresso, i / 12);
    if (passesAa(SNAPSHARE.ivory, darker)) return { fill: darker, ink: SNAPSHARE.ivory };
  }
  for (let i = 1; i <= 12; i += 1) {
    const lighter = mixHex(a, SNAPSHARE.ivory, i / 12);
    if (passesAa(SNAPSHARE.ink, lighter)) return { fill: lighter, ink: SNAPSHARE.ink };
  }
  return { fill: SNAPSHARE.espresso, ink: SNAPSHARE.ivory };
}
