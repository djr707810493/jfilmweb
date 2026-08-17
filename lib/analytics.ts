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
