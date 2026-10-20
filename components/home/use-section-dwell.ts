"use client";

import { useEffect, useRef } from "react";
import {
  trackSectionDwell,
  trackSectionExit,
  type SectionExitOutcome,
} from "@/lib/analytics";

const DEFAULT_DWELL_MS = 3000;
/** How long after leaving the page we still treat it as a "close" rather than idle. */
const BOUNCE_WINDOW_MS = 3000;

type SectionDwellOptions = {
  /** Must match the DOM id used for anchor links, e.g. "featured-gallery". */
  sectionId: string;
  dwellMs?: number;
  /** Fraction of the section that must be visible to count as "looking at it". */
  threshold?: number;
};

/**
 * Measures real interest in a section: waits until a visitor has kept it in
 * view for `dwellMs`, then reports what they did next — closed the page,
 * scrolled on, clicked in, or converted elsewhere on the site.
 *
 * Fires at most one `section_dwell` and one `section_exit` per page view.
 */
export function useSectionDwell({
  sectionId,
  dwellMs = DEFAULT_DWELL_MS,
  threshold = 0.5,
}: SectionDwellOptions) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    let dwellTimer: number | undefined;
    let inView = false;
    let dwelled = false;
    let exited = false;
    let enteredAt = 0;
    let dwelledAt = 0;
    let viewportPercent = 0;

    function finish(outcome: SectionExitOutcome) {
      if (exited || !dwelled) return;
      exited = true;
      const now = Date.now();
      trackSectionExit({
        sectionId,
        outcome,
        timeOnSectionMs: enteredAt ? now - enteredAt : 0,
        timeSinceDwellMs: now - dwelledAt,
      });
    }

    function clearDwellTimer() {
      if (dwellTimer !== undefined) {
        window.clearTimeout(dwellTimer);
        dwellTimer = undefined;
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          viewportPercent = entry.intersectionRatio;
          inView = entry.intersectionRatio >= threshold;

          if (inView && !dwelled && dwellTimer === undefined) {
            enteredAt = enteredAt || Date.now();
            dwellTimer = window.setTimeout(() => {
              dwelled = true;
              dwelledAt = Date.now();
              trackSectionDwell({
                sectionId,
                dwellMs,
                viewportPercent,
              });
            }, dwellMs);
          }

          if (!inView) {
            // Left before the timer finished — they were just passing through.
            if (!dwelled) {
              clearDwellTimer();
              enteredAt = 0;
            }
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    const onScroll = () => {
      if (!dwelled || exited) return;
      const rect = node.getBoundingClientRect();
      // Section fully above the viewport → visitor scrolled on down the page.
      if (rect.bottom <= 0) {
        finish("scroll");
      }
    };

    const onClick = (event: MouseEvent) => {
      if (!dwelled || exited) return;
      const target = event.target as HTMLElement | null;

      const button = target?.closest("button");
      if (button) {
        finish("click");
        return;
      }

      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      // In-section anchors stay on the page; internal links go deeper.
      finish(href.startsWith("/") ? "internal" : "click");
    };

    // Site CTAs (instant quote, contact form, phone) live outside this section.
    const onCta = () => {
      if (!dwelled || exited) return;
      finish("cta");
    };

    const onPageHide = () => {
      if (!dwelled || exited) return;
      // Closing the tab/window right after dwelling = they lost interest.
      finish("bounce");
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      if (!dwelled || exited) return;
      // Distinguish an immediate close from someone leaving the tab parked.
      const since = Date.now() - dwelledAt;
      finish(since <= BOUNCE_WINDOW_MS ? "bounce" : "idle");
    };

    observer.observe(node);
    window.addEventListener("scroll", onScroll, { passive: true });
    node.addEventListener("click", onClick);
    window.addEventListener("jfilm:quote-open-request", onCta);
    window.addEventListener("jfilm:quote-estimate", onCta);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearDwellTimer();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      node.removeEventListener("click", onClick);
      window.removeEventListener("jfilm:quote-open-request", onCta);
      window.removeEventListener("jfilm:quote-estimate", onCta);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [sectionId, dwellMs, threshold]);

  return sectionRef;
}
