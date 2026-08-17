import {
  formatMultilineList,
  isQuoteVisibleToClient,
  type InquiryQuote,
  type InquiryQuotePackage,
} from "@/types/inquiry-quote";
import { serviceTypeLabel } from "@/types/submission";

type InquiryQuoteViewProps = {
  quote: InquiryQuote | null | undefined;
  mode: "admin" | "client";
  compact?: boolean;
};

export function InquiryQuoteView({
  quote,
  mode,
  compact = false,
}: InquiryQuoteViewProps) {
  if (!quote || quote.packages.length === 0) {
    return (
      <div
        className={`border border-dashed border-taupe/40 bg-ivory-dark text-center ${
          compact ? "px-4 py-5" : "px-5 py-8"
        }`}
      >
        <p className="text-sm text-soft-black-muted">
          {mode === "admin"
            ? "No quote packages yet. Create packages for the client to review."
            : "Your custom quote will appear here once the studio publishes it."}
        </p>
      </div>
    );
  }

  if (mode === "client" && !isQuoteVisibleToClient(quote)) {
    return (
      <div
        className={`border border-dashed border-taupe/40 bg-ivory-dark text-center ${
          compact ? "px-4 py-5" : "px-5 py-8"
        }`}
      >
        <p className="text-sm text-soft-black-muted">
          Your quote is being prepared. We&apos;ll notify you when it&apos;s ready
          to review.
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-6"}>
      {mode === "admin" && (
        <p className="label-editorial text-[0.625rem] text-muted">
          Status: {quote.status === "published" ? "Published" : "Draft"}
        </p>
      )}

      {quote.introMessage && (
        <div
          className={`border border-taupe/30 bg-ivory-dark ${
            compact ? "p-3" : "p-5"
          }`}
        >
          <p className="label-editorial text-[0.5625rem] text-muted sm:text-[0.625rem]">
            Message from the studio
          </p>
          <p
            className={`mt-2 whitespace-pre-wrap leading-relaxed text-soft-black ${
              compact ? "text-xs sm:text-sm" : "text-sm"
            }`}
          >
            {quote.introMessage}
          </p>
        </div>
      )}

      <div className={`grid gap-3 ${compact ? "" : "lg:grid-cols-2 lg:gap-4"}`}>
        {quote.packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function PackageCard({
  pkg,
  compact,
}: {
  pkg: InquiryQuotePackage;
  compact: boolean;
}) {
  return (
    <article
      className={`border bg-ivory ${
        compact ? "p-3 sm:p-4" : "p-5 md:p-6"
      } ${pkg.recommended ? "border-soft-black/40 ring-1 ring-soft-black/10" : "border-taupe/40"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="label-editorial text-[0.5625rem] text-muted sm:text-[0.625rem]">
            {serviceTypeLabel(pkg.serviceType)}
          </p>
          <h3
            className={`font-display text-soft-black ${
              compact ? "mt-0.5 text-base sm:text-lg" : "mt-1 text-xl"
            }`}
          >
            {pkg.name}
          </h3>
        </div>
        {pkg.recommended && (
          <span className="label-editorial shrink-0 border border-soft-black/20 px-1.5 py-0.5 text-[0.5625rem] sm:px-2 sm:py-1 sm:text-[0.625rem]">
            Recommended
          </span>
        )}
      </div>

      <p
        className={`font-display text-soft-black ${
          compact ? "mt-2 text-lg sm:text-xl" : "mt-4 text-2xl"
        }`}
      >
        {pkg.price}
      </p>
      {pkg.duration && (
        <p
          className={`text-soft-black-muted ${
            compact ? "mt-1 text-xs sm:text-sm" : "mt-2 text-sm"
          }`}
        >
          {pkg.duration}
        </p>
      )}

      {pkg.includes.length > 0 && (
        <QuoteList title="Includes" items={pkg.includes} compact={compact} />
      )}
      {pkg.bonuses.length > 0 && (
        <QuoteList title="Complimentary" items={pkg.bonuses} compact={compact} />
      )}
      {pkg.optionalAddons.length > 0 && (
        <QuoteList
          title="Optional add-ons"
          items={pkg.optionalAddons}
          compact={compact}
        />
      )}

      {pkg.notes && (
        <p
          className={`leading-relaxed text-soft-black-muted ${
            compact ? "mt-2 text-[0.6875rem] sm:text-xs" : "mt-4 text-xs"
          }`}
        >
          {pkg.notes}
        </p>
      )}
    </article>
  );
}

function QuoteList({
  title,
  items,
  compact,
}: {
  title: string;
  items: string[];
  compact: boolean;
}) {
  return (
    <div className={compact ? "mt-2.5 sm:mt-3" : "mt-5"}>
      <p className="label-editorial text-[0.5625rem] text-muted sm:text-[0.625rem]">
        {title}
      </p>
      <ul className={compact ? "mt-1 space-y-0.5" : "mt-2 space-y-1.5"}>
        {items.map((item) => (
          <li
            key={item}
            className={`text-soft-black before:mr-1.5 before:text-muted before:content-['·'] ${
              compact ? "text-xs leading-snug sm:text-sm" : "text-sm"
            }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { formatMultilineList };
