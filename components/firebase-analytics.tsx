"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics, isFirebaseConfigured } from "@/lib/firebase";

export function FirebaseAnalytics() {
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    getFirebaseAnalytics().catch(() => {
      // Analytics blocked or unsupported — safe to ignore
    });
  }, []);

  return null;
}
