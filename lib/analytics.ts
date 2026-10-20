import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics, isFirebaseConfigured } from "@/lib/firebase";
import type { PortfolioProject } from "@/types/portfolio";

export type PortfolioListName = "home_featured" | "portfolio_gallery";

function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return;

  getFirebaseAnalytics()
    .then((analytics) => {
      if (!analytics) return;
      logEvent(analytics, eventName, params);
    })
    .catch(() => {
      // Analytics blocked or unsupported — safe to ignore
    });
}

export function trackPortfolioItemClick(
  project: PortfolioProject,
  listName: PortfolioListName,
  index: number,
): void {
  trackEvent("select_item", {
    item_list_id: listName,
    item_list_name:
      listName === "home_featured"
        ? "Home Featured Portfolio"
        : "Portfolio Gallery",
    item_id: project.slug,
    item_name: project.title,
    item_category: project.category,
    location_id: project.location,
    index,
  });
}

export function trackViewFullPortfolioClick(): void {
  trackEvent("select_content", {
    content_type: "portfolio",
    content_id: "view_full_portfolio",
    item_list_id: "home_featured",
  });
}

export function trackCoverageInquire(optionId: string, optionTitle: string): void {
  trackEvent("select_content", {
    content_type: "coverage",
    content_id: optionId,
    item_name: optionTitle,
  });
}

/* ---------------- Instant quote funnel ---------------- */

export function trackQuoteOpen(source: string): void {
  trackEvent("quote_open", { source });
}

export function trackQuoteStep(stepName: string, stepIndex: number): void {
  trackEvent("quote_step", {
    step_name: stepName,
    step_index: stepIndex,
  });
}

export function trackQuoteComplete(params: {
  categoryId: string;
  categoryLabel: string;
  hours: number;
  budget: number;
  packageCount: number;
  recommendedPrice: number;
  durationMs: number;
}): void {
  trackEvent("quote_complete", {
    category_id: params.categoryId,
    category_label: params.categoryLabel,
    hours: params.hours,
    budget: params.budget,
    package_count: params.packageCount,
    recommended_price: params.recommendedPrice,
    duration_ms: params.durationMs,
  });
}

export function trackQuoteBookClick(params: {
  categoryId: string;
  hours: number;
  budget: number;
  recommendedPrice: number;
}): void {
  trackEvent("quote_book_click", {
    category_id: params.categoryId,
    hours: params.hours,
    budget: params.budget,
    recommended_price: params.recommendedPrice,
  });
}

export function trackQuoteClose(params: {
  lastStep: string;
  lastStepIndex: number;
  completed: boolean;
  booked: boolean;
  durationMs: number;
}): void {
  trackEvent("quote_close", {
    last_step: params.lastStep,
    last_step_index: params.lastStepIndex,
    completed: params.completed,
    booked: params.booked,
    duration_ms: params.durationMs,
  });
}

/* ---------------- Section dwell / interest ---------------- */

/**
 * Fired once a visitor has actually looked at a section for `dwellMs`.
 * Everything after this event answers "what did they do next?".
 */
export function trackSectionDwell(params: {
  sectionId: string;
  dwellMs: number;
  viewportPercent: number;
}): void {
  trackEvent("section_dwell", {
    section_id: params.sectionId,
    dwell_ms: params.dwellMs,
    viewport_percent: Math.round(params.viewportPercent),
  });
}

/**
 * Fired when a visitor leaves or stops engaging with a section they had
 * dwelled on. `outcome` separates window-closers from browsers:
 * - bounce:   left the page / tab before any further engagement
 * - scroll:   kept scrolling past the section
 * - click:    clicked an item inside the section
 * - cta:      converted on a site CTA (quote, contact, ...)
 * - internal: navigated deeper into the site
 * - idle:     sat still until the page was closed much later
 */
export type SectionExitOutcome =
  | "bounce"
  | "scroll"
  | "click"
  | "cta"
  | "internal"
  | "idle";

export function trackSectionExit(params: {
  sectionId: string;
  outcome: SectionExitOutcome;
  timeOnSectionMs: number;
  timeSinceDwellMs: number;
}): void {
  trackEvent("section_exit", {
    section_id: params.sectionId,
    outcome: params.outcome,
    time_on_section_ms: params.timeOnSectionMs,
    time_since_dwell_ms: params.timeSinceDwellMs,
    bounced: params.outcome === "bounce",
    engaged: params.outcome !== "bounce",
  });
}
