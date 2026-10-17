import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import {
  DEFAULT_QUOTE_ADD_ONS,
  DEFAULT_QUOTE_CATEGORIES,
  MIN_HOURLY_RATE,
} from "@/components/quote/quote-config";
import type { QuoteAddOnRow, QuoteConfig, QuoteRateRow } from "@/types/quote";

const COLLECTION = "website";
const QUOTE_CONFIG_DOC = "quote-config";

export function createDefaultQuoteConfig(): QuoteConfig {
  return {
    minHourlyRate: MIN_HOURLY_RATE,
    categories: DEFAULT_QUOTE_CATEGORIES.map((row) => ({ ...row })),
    addOns: DEFAULT_QUOTE_ADD_ONS.map((row) => ({ ...row })),
  };
}

function timestampToDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function deserializeCategories(raw: unknown, fallback: QuoteRateRow[]): QuoteRateRow[] {
  if (!Array.isArray(raw)) return fallback;

  const rows = raw
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const fallbackRow = fallback.find((f) => f.id === row.id) ?? fallback[index];
      const id = String(row.id ?? fallbackRow?.id ?? `category-${index}`);
      const rate = Number(row.hourlyRate);
      return {
        id,
        label: String(row.label ?? fallbackRow?.label ?? id).trim(),
        blurb: String(row.blurb ?? fallbackRow?.blurb ?? "").trim(),
        hourlyRate: Number.isFinite(rate) && rate >= 0 ? rate : (fallbackRow?.hourlyRate ?? 0),
      };
    })
    .filter((row): row is QuoteRateRow => row !== null);

  return rows.length > 0 ? rows : fallback;
}

function deserializeAddOns(raw: unknown, fallback: QuoteAddOnRow[]): QuoteAddOnRow[] {
  if (!Array.isArray(raw)) return fallback;

  const rows = raw
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const fallbackRow = fallback.find((f) => f.id === row.id) ?? fallback[index];
      const id = String(row.id ?? fallbackRow?.id ?? `addon-${index}`);
      const price = Number(row.flatPrice);
      return {
        id,
        label: String(row.label ?? fallbackRow?.label ?? id).trim(),
        blurb: String(row.blurb ?? fallbackRow?.blurb ?? "").trim(),
        flatPrice: Number.isFinite(price) && price >= 0 ? price : (fallbackRow?.flatPrice ?? 0),
      };
    })
    .filter((row): row is QuoteAddOnRow => row !== null);

  return rows.length > 0 ? rows : fallback;
}

export async function getQuoteConfig(): Promise<QuoteConfig> {
  const fallback = createDefaultQuoteConfig();
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, COLLECTION, QUOTE_CONFIG_DOC));
  if (!snapshot.exists()) return fallback;

  const data = snapshot.data() as Record<string, unknown>;
  const min = Number(data.minHourlyRate);

  return {
    minHourlyRate: Number.isFinite(min) && min >= 0 ? min : fallback.minHourlyRate,
    categories: deserializeCategories(data.categories, fallback.categories),
    addOns: deserializeAddOns(data.addOns, fallback.addOns),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

export async function saveQuoteConfig(config: QuoteConfig): Promise<void> {
  const db = getFirestoreDb();

  await setDoc(
    doc(db, COLLECTION, QUOTE_CONFIG_DOC),
    {
      minHourlyRate: Number(config.minHourlyRate) || 0,
      categories: config.categories.map((row) => ({
        id: row.id,
        label: row.label.trim(),
        blurb: row.blurb.trim(),
        hourlyRate: Number(row.hourlyRate) || 0,
      })),
      addOns: config.addOns.map((row) => ({
        id: row.id,
        label: row.label.trim(),
        blurb: row.blurb.trim(),
        flatPrice: Number(row.flatPrice) || 0,
      })),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
