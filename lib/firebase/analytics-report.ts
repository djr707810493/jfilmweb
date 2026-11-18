import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirebaseApp } from "@/lib/firebase";
import type { AnalyticsReport } from "@/types/analytics";

const FUNCTIONS_REGION = "us-central1";

export async function fetchAnalyticsReport(days: number): Promise<AnalyticsReport> {
  const callable = httpsCallable<{ days: number }, AnalyticsReport>(
    getFunctions(getFirebaseApp(), FUNCTIONS_REGION),
    "getAnalyticsReport",
  );

  const result = await callable({ days });
  return result.data;
}

export function formatAnalyticsDate(value: string): string {
  if (!/^\d{8}$/.test(value)) return value;
  const date = new Date(
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T12:00:00`,
  );
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatAnalyticsCount(value: number | undefined): string {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function formatAnalyticsPercent(value: number | undefined): string {
  return `${((value ?? 0) * 100).toFixed(1)}%`;
}

export function formatAnalyticsDuration(value: number | undefined): string {
  const seconds = Math.round(value ?? 0);
  if (seconds <= 0) return "0s";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
}

/** Percentage change from the previous period, `null` when there is no baseline. */
export function analyticsDelta(current: number, previous: number): number | null {
  if (!previous) return current > 0 ? null : 0;
  return (current - previous) / previous;
}
