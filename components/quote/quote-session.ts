import { formatUSD } from "@/components/quote/quote-config";

export type QuoteEstimate = {
  categoryId: string;
  categoryLabel: string;
  hours: number;
  budget: number;
  date: string;
  location: string;
  addOnLabels: string[];
  packages: { name: string; price: number; recommended: boolean; includes: string[] }[];
  savedAt: number;
};

const STORAGE_KEY = "jfilm:instant-quote";

export function saveQuoteEstimate(estimate: QuoteEstimate): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(estimate));
  } catch {
    // storage unavailable — the form simply won't be prefilled
  }
}

export function readQuoteEstimate(): QuoteEstimate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuoteEstimate;
    if (!parsed || typeof parsed.hours !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearQuoteEstimate(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Multi-line summary appended to the inquiry message field. */
export function formatQuoteMessage(estimate: QuoteEstimate): string {
  const lines = [
    "— Instant quote details —",
    `Coverage: ${estimate.categoryLabel} · ${estimate.hours}h`,
    `Budget: ${formatUSD(estimate.budget)}`,
  ];

  if (estimate.packages.length > 0) {
    lines.push("Options shown:");
    estimate.packages.forEach((pkg) => {
      lines.push(
        `  · ${pkg.name} — ${formatUSD(pkg.price)}${pkg.recommended ? " (recommended)" : ""}`,
      );
    });
  }

  if (estimate.addOnLabels.length > 0) {
    lines.push(`Add-ons: ${estimate.addOnLabels.join(", ")}`);
  }

  if (estimate.date) lines.push(`Wedding date: ${estimate.date}`);
  if (estimate.location) lines.push(`Location: ${estimate.location}`);

  return lines.join("\n");
}

export const QUOTE_ESTIMATE_EVENT = "jfilm:quote-estimate";
