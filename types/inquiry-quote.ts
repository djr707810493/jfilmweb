import type { ServiceType } from "@/types/submission";

export type InquiryQuoteStatus = "draft" | "published";

export interface InquiryQuotePackage {
  id: string;
  name: string;
  serviceType: ServiceType;
  price: string;
  duration: string;
  includes: string[];
  bonuses: string[];
  optionalAddons: string[];
  notes?: string | null;
  recommended?: boolean;
}

export interface InquiryQuote {
  introMessage?: string | null;
  packages: InquiryQuotePackage[];
  status: InquiryQuoteStatus;
  updatedAt?: string | null;
  publishedAt?: string | null;
}

export const MAX_QUOTE_PACKAGES = 10;
export const MAX_QUOTE_LIST_ITEMS = 20;
export const MAX_QUOTE_ITEM_LENGTH = 200;

export function createEmptyQuotePackage(
  serviceType: ServiceType = "photography",
): InquiryQuotePackage {
  return {
    id: crypto.randomUUID(),
    name: "",
    serviceType,
    price: "",
    duration: "",
    includes: [],
    bonuses: [],
    optionalAddons: [],
    notes: null,
    recommended: false,
  };
}

export function createEmptyQuote(): InquiryQuote {
  return {
    introMessage: "",
    packages: [],
    status: "draft",
  };
}

export function isQuoteVisibleToClient(
  quote: InquiryQuote | null | undefined,
): boolean {
  return (
    quote?.status === "published" &&
    Array.isArray(quote.packages) &&
    quote.packages.length > 0
  );
}

export function parseMultilineList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_QUOTE_LIST_ITEMS);
}

export function formatMultilineList(items: string[] | undefined): string {
  return (items ?? []).join("\n");
}

export function sanitizeQuotePackage(
  pkg: InquiryQuotePackage,
): InquiryQuotePackage {
  const trimList = (items: string[]) =>
    items
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_QUOTE_LIST_ITEMS)
      .map((item) => item.slice(0, MAX_QUOTE_ITEM_LENGTH));

  return {
    id: pkg.id || crypto.randomUUID(),
    name: pkg.name.trim().slice(0, 120),
    serviceType: pkg.serviceType,
    price: pkg.price.trim().slice(0, 40),
    duration: pkg.duration.trim().slice(0, 120),
    includes: trimList(pkg.includes),
    bonuses: trimList(pkg.bonuses),
    optionalAddons: trimList(pkg.optionalAddons),
    notes: pkg.notes?.trim().slice(0, 500) || null,
    recommended: Boolean(pkg.recommended),
  };
}

export function sanitizeQuote(quote: InquiryQuote): InquiryQuote {
  return {
    introMessage: quote.introMessage?.trim().slice(0, 2000) || null,
    packages: quote.packages
      .map(sanitizeQuotePackage)
      .filter((pkg) => pkg.name && pkg.price)
      .slice(0, MAX_QUOTE_PACKAGES),
    status: quote.status,
    updatedAt: quote.updatedAt ?? null,
    publishedAt: quote.publishedAt ?? null,
  };
}
