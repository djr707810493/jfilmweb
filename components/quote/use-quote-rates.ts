"use client";

import { useEffect, useState } from "react";
import { getQuoteConfig } from "@/lib/firebase/quote";
import {
  DEFAULT_QUOTE_RATES,
  ratesFromConfig,
  type QuoteRates,
} from "@/components/quote/quote-config";

let cachedRates: QuoteRates | null = null;
let ratesPromise: Promise<QuoteRates> | null = null;

function loadRates(): Promise<QuoteRates> {
  if (cachedRates) return Promise.resolve(cachedRates);
  if (!ratesPromise) {
    ratesPromise = getQuoteConfig()
      .then((config) => {
        cachedRates = ratesFromConfig(config);
        return cachedRates;
      })
      .catch(() => {
        cachedRates = DEFAULT_QUOTE_RATES;
        return cachedRates;
      })
      .finally(() => {
        ratesPromise = null;
      });
  }
  return ratesPromise;
}

/** Loads admin-managed rates once per session, falling back to defaults. */
export function useQuoteRates(): QuoteRates {
  const [rates, setRates] = useState<QuoteRates>(cachedRates ?? DEFAULT_QUOTE_RATES);

  useEffect(() => {
    let cancelled = false;
    loadRates().then((loaded) => {
      if (!cancelled) setRates(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return rates;
}
