/**
 * Instant quote pricing engine + default rates.
 *
 * Runtime rates live in Firestore (website/quote-config) and are edited from
 * Dashboard → Quote. These constants are the fallback used before the config
 * loads and when nothing has been saved yet.
 *
 * Pricing rules:
 * - The hourly minimum is a hard floor. Below that total we cannot serve.
 * - Packages are always built from real category rates, never from the floor.
 * - Only options near the selected budget are shown.
 */

import type { QuoteAddOnRow, QuoteConfig, QuoteRateRow } from "@/types/quote";

export type QuoteCategoryId = "photo" | "video" | "duo-1" | "duo-2";

/** Hard floor fallback: we cannot serve below this per hour of coverage. */
export const MIN_HOURLY_RATE = 80;

export const DEFAULT_QUOTE_CATEGORIES: QuoteRateRow[] = [
  { id: "photo", label: "Photo Only", blurb: "One photographer, edited gallery", hourlyRate: 150 },
  { id: "video", label: "Video Only", blurb: "One videographer, highlight film", hourlyRate: 180 },
  { id: "duo-1", label: "Photo + Video · 1 Operator", blurb: "One shooter covering both", hourlyRate: 220 },
  { id: "duo-2", label: "Photo + Video · 2 Operators", blurb: "Full crew, both crafts", hourlyRate: 300 },
];

export const DEFAULT_QUOTE_ADD_ONS: QuoteAddOnRow[] = [
  { id: "bridal", label: "Bridal Session", blurb: "Separate portrait shoot", flatPrice: 350 },
  { id: "drone", label: "Drone Coverage", blurb: "Aerial photo + video", flatPrice: 100 },
  { id: "nextday", label: "Next-Day Edit", blurb: "Highlight cut delivered the next day", flatPrice: 500 },
  { id: "rush", label: "Rush Delivery", blurb: "Full gallery in 7 days", flatPrice: 200 },
];

export const QUOTE_HOURS = [2, 4, 5, 8];

export type BuiltPackage = {
  id: string;
  name: string;
  tag: string;
  price: number;
  includes: string[];
  recommended: boolean;
  overBy: number;
};

export type QuoteOutcome =
  | { status: "below-minimum"; floorTotal: number; budget: number }
  | { status: "ok"; packages: BuiltPackage[]; floorTotal: number };

type Candidate = {
  id: string;
  name: string;
  price: number;
  includes: string[];
};

/** Rates used by the engine; defaults kick in when nothing is configured. */
export type QuoteRates = {
  minHourlyRate: number;
  categories: QuoteRateRow[];
  addOns: QuoteAddOnRow[];
};

export const DEFAULT_QUOTE_RATES: QuoteRates = {
  minHourlyRate: MIN_HOURLY_RATE,
  categories: DEFAULT_QUOTE_CATEGORIES,
  addOns: DEFAULT_QUOTE_ADD_ONS,
};

export function ratesFromConfig(config: QuoteConfig): QuoteRates {
  return {
    minHourlyRate:
      Number.isFinite(config.minHourlyRate) && config.minHourlyRate >= 0
        ? config.minHourlyRate
        : MIN_HOURLY_RATE,
    categories: config.categories.length > 0 ? config.categories : DEFAULT_QUOTE_CATEGORIES,
    addOns: config.addOns.length > 0 ? config.addOns : DEFAULT_QUOTE_ADD_ONS,
  };
}

function fullCrewRate(categoryId: string, baseRate: number): number {
  if (categoryId === "photo" || categoryId === "video" || categoryId === "duo-1") {
    return 300;
  }
  return baseRate + 60;
}

/**
 * Build package options for a budget.
 * Returns "below-minimum" when the budget cannot cover the hourly floor.
 * Otherwise returns only the real packages near the budget.
 */
export function buildPackagesForBudget(
  budget: number,
  categoryId: QuoteCategoryId,
  hours: number,
  addOnIds: string[],
  rates: QuoteRates = DEFAULT_QUOTE_RATES,
): QuoteOutcome {
  const floorTotal = Math.max(rates.minHourlyRate, 0) * hours;
  if (budget < floorTotal) {
    return { status: "below-minimum", floorTotal, budget };
  }

  const category =
    rates.categories.find((c) => c.id === categoryId) ?? rates.categories[0];
  const rate = Math.max(category.hourlyRate, rates.minHourlyRate);
  const addOns = rates.addOns.filter((a) => addOnIds.includes(a.id));
  const addOnTotal = addOns.reduce((sum, a) => sum + a.flatPrice, 0);
  const addOnNames = addOns.map((a) => a.label);
  const hasAddOns = addOnNames.length > 0;
  const dronePrice = rates.addOns.find((a) => a.id === "drone")?.flatPrice ?? 0;

  const candidates: Candidate[] = [
    {
      id: "base",
      name: "Signature",
      price: rate * hours + addOnTotal,
      includes: [
        `${category.label} · ${hours}h`,
        ...(hasAddOns ? addOnNames : ["Full photo coverage"]),
        "Edited gallery + highlight cut",
        "Print release included",
      ],
    },
    {
      id: "crew",
      name: "Full Crew",
      price: fullCrewRate(category.id, rate) * hours + addOnTotal + (hasAddOns ? 0 : dronePrice),
      includes: [
        `Photo + Video · 2 Operators · ${hours}h`,
        ...(hasAddOns ? addOnNames : [`Drone coverage (+${formatUSD(dronePrice)})`]),
        "Priority editing · preview in 72h",
        "Wedding album credit",
      ],
    },
  ];

  const sorted = [...candidates].sort((a, b) => a.price - b.price);
  const fitting = sorted.filter((c) => c.price <= budget);
  const recommended = fitting.length > 0 ? fitting[fitting.length - 1] : null;
  const nextUpgrade = sorted.find((c) => c.price > budget) ?? null;

  // Keep only options near the budget, always keeping the recommended pick and
  // one upgrade so the client still has a choice.
  const nearBudget = sorted.filter(
    (c) => c.price >= budget * 0.55 && c.price <= budget * 1.35,
  );
  const chosen = new Set<Candidate>(nearBudget);
  if (recommended) chosen.add(recommended);
  if (nextUpgrade) chosen.add(nextUpgrade);
  if (chosen.size === 0) chosen.add(sorted[0]);

  const packages = [...chosen]
    .sort((a, b) => a.price - b.price)
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      price: candidate.price,
      includes: candidate.includes,
      recommended: recommended?.id === candidate.id,
      overBy: Math.max(0, candidate.price - budget),
      tag:
        recommended?.id === candidate.id
          ? "Best fit for your budget"
          : candidate.price > budget
            ? "Upgrade option"
            : "Leaner option",
    }));

  return { status: "ok", packages, floorTotal };
}

export function formatUSD(value: number): string {
  if (!Number.isFinite(value)) return "$10,000+";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}
