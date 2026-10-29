"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics, isFirebaseConfigured } from "@/lib/firebase";
import {
  isStaffPath,
  trackContactClick,
  trackInquiryCtaClick,
} from "@/lib/analytics";

/** Where on the page the click happened — a section id, the header or the footer. */
function clickSurface(element: HTMLElement): string {
  if (element.closest("footer")) return "footer";
  if (element.closest("header")) return "header";
  const section = element.closest("section[id]");
  if (section?.id) return section.id;
  return window.location.pathname;
}

export function FirebaseAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);
  const search = searchParams.toString();
  const routeKey = search ? `${pathname}?${search}` : pathname;

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    // Staff browsing the dashboard must not land in acquisition reports.
    if (isStaffPath()) return;

    getFirebaseAnalytics().catch(() => {
      // Analytics blocked or unsupported — safe to ignore
    });
  }, []);

  /**
   * The site is a static export: every client-side navigation keeps the same
   * page alive, so gtag's automatic page_view only ever fires on the first
   * load. Without this, every other page looks like an entry of (not set).
   */
  useEffect(() => {
    if (lastKey.current === null) {
      // First render is already reported by the gtag config call.
      lastKey.current = routeKey;
      return;
    }
    if (lastKey.current === routeKey) return;
    lastKey.current = routeKey;

    if (!isFirebaseConfigured() || isStaffPath()) return;

    getFirebaseAnalytics()
      .then((analytics) => {
        if (!analytics) return;
        logEvent(analytics, "page_view", {
          page_location: window.location.href,
          page_title: document.title,
          page_path: window.location.pathname + window.location.search,
        });
      })
      .catch(() => {
        // Analytics blocked or unsupported — safe to ignore
      });
  }, [routeKey]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      if (!href) return;

      const surface = clickSurface(anchor);

      if (href.startsWith("mailto:")) {
        trackContactClick({ method: "email", surface, target: "mailto" });
        return;
      }

      if (href.startsWith("tel:")) {
        trackContactClick({ method: "phone", surface, target: "tel" });
        return;
      }

      if (href.startsWith("/contact") || href.endsWith("#contact")) {
        trackInquiryCtaClick({ surface, href });
        return;
      }

      if (anchor.hostname === "instagram.com" || anchor.hostname === "www.instagram.com") {
        trackContactClick({ method: "social", surface, target: "instagram" });
      }
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
