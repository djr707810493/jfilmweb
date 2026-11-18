"use client";

import Link from "next/link";
import { useState } from "react";
import { CoverageVideoButton } from "@/components/quote/coverage-video-button";
import { QuoteModal } from "@/components/quote/quote-modal";
import { formatUSD } from "@/components/quote/quote-config";
import { useQuoteRates } from "@/components/quote/use-quote-rates";
import { coverageContent, coverageOptions } from "@/data/homepage";
import { trackCoverageInquire } from "@/lib/analytics";

function StartingPriceRow({
  option,
  rates,
}: {
  option: (typeof coverageOptions)[number];
  rates: ReturnType<typeof useQuoteRates>;
}) {
  if (!("priceIds" in option) || !option.priceIds) return null;

  const hours = "startingHours" in option ? Number(option.startingHours ?? 4) : 4;
  const rate = Math.min(
    ...option.priceIds.map(
      (id) =>
        rates.categories.find((category) => category.id === id)?.hourlyRate ??
        Number.POSITIVE_INFINITY,
    ),
  );

  if (!Number.isFinite(rate) || rate <= 0) return null;

  return (
    <p className="mt-3 flex items-baseline gap-2">
      <span className="font-display text-lg text-soft-black">
        From {formatUSD(rate * hours)}
      </span>
      <span className="text-[0.6875rem] tracking-wide uppercase text-taupe">
        {hours} hrs
      </span>
    </p>
  );
}

function CrewMarks({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="size-1.5 rounded-full bg-current"
        />
      ))}
    </span>
  );
}

export function CoverageSection() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const rates = useQuoteRates();

  return (
    <section
      id="coverage"
      className="section-y-compact border-b border-taupe/40"
    >
      <div className="container-editorial">
        <div className="max-w-2xl">
          <p className="label-editorial">{coverageContent.label}</p>
          <h2 className="font-display mt-2 text-[clamp(1.375rem,4.5vw,3rem)] leading-snug text-soft-black md:mt-4">
            {coverageContent.heading}
          </h2>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-5 md:text-base">
            {coverageContent.body}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
            <span className="text-[0.8125rem] text-soft-black-muted md:text-sm">
              Want the options explained in 60 seconds?
            </span>
            <CoverageVideoButton
              variant="inline"
              label="Watch coverage explainer"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 md:mt-14 md:gap-6 lg:grid-cols-4">
          {coverageOptions.map((option) => {
            const badge = "badge" in option ? option.badge : null;
            const href = "href" in option ? option.href : "#contact";
            const cta = "cta" in option ? option.cta : "Ask about this coverage";

            return (
            <article
              key={option.id}
              className={`flex flex-col border p-5 md:p-7 ${
                option.featured
                  ? "border-soft-black bg-ivory-dark"
                  : "border-taupe/40 bg-ivory"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-xl leading-none text-taupe md:text-2xl">
                  {option.number}
                </span>
                <span className="label-editorial text-right text-taupe">
                  {option.budgetLabel}
                </span>
              </div>

              <div className="mt-4 min-h-[1rem]">
                {option.featured ? (
                  <p className="label-editorial text-soft-black">Most requested</p>
                ) : badge ? (
                  <p className="label-editorial text-soft-black">{badge}</p>
                ) : null}
              </div>

              <h3 className="font-display mt-3 text-[1.375rem] leading-snug text-soft-black md:text-2xl lg:text-[1.75rem]">
                {option.title}
              </h3>

              <p className="mt-1.5 flex items-center gap-2 text-[0.75rem] tracking-wide text-soft-black-muted uppercase md:text-[0.8125rem]">
                <CrewMarks count={option.operators} />
                {option.crew}
              </p>

              {"fixedPriceLabel" in option ? (
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-lg text-soft-black">
                    {option.fixedPriceLabel}
                  </span>
                  <span className="text-[0.6875rem] tracking-wide uppercase text-taupe">
                    per service
                  </span>
                </p>
              ) : (
                <StartingPriceRow option={option} rates={rates} />
              )}

              <p className="mt-4 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-5 md:text-sm">
                {option.description}
              </p>

              <ul className="mt-5 space-y-2 border-t border-taupe/30 pt-5 md:mt-6 md:pt-6">
                {option.includes.map((item) => (
                  <li
                    key={item}
                    className="text-[0.8125rem] leading-relaxed text-soft-black-muted md:text-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              {"tradeoff" in option ? (
                <div className="mt-5 border-l-2 border-soft-black/30 pl-4">
                  <p className="label-editorial mb-1 text-soft-black">
                    The trade-off
                  </p>
                  <p className="text-[0.75rem] leading-relaxed text-soft-black-muted">
                    {option.tradeoff}
                  </p>
                </div>
              ) : null}

              <Link
                href={href}
                onClick={() =>
                  trackCoverageInquire(option.id, `${option.title} · ${option.crew}`)
                }
                className="label-editorial link-underline tap-link mt-auto pt-6 text-soft-black md:pt-8"
              >
                {cta}
              </Link>
            </article>
            );
          })}
        </div>

        <p className="mt-4 text-[0.75rem] leading-relaxed text-taupe md:mt-6">
          Starting prices reflect our shortest common booking. Final quotes vary
          with date, location, and hours — the instant quote tool is exact.
        </p>

        <p className="mt-8 max-w-xl text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-10 md:text-sm">
          Not sure which fits? Tell us your date and budget — we&apos;ll recommend
          the right coverage. Same documentary approach across every option.
        </p>

        <div className="mt-5 border border-soft-black bg-ivory-dark p-5 md:mt-6 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-soft-black">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-soft-black opacity-40" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-soft-black" />
                </span>
                Booking 2026 – 2027 · dates fill fast
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-soft-black-muted">
                Answer 4 quick questions, check availability, get your custom estimate.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="tap-link flex min-h-[3.75rem] shrink-0 items-center justify-center gap-2 bg-soft-black px-10 py-4 text-[0.9375rem] font-semibold tracking-[0.14em] text-white uppercase shadow-lg transition-transform hover:scale-[1.02]"
            >
              Get Instant Quote →
            </button>
          </div>
        </div>

        {quoteOpen ? (
          <QuoteModal source="coverage_section" onClose={() => setQuoteOpen(false)} />
        ) : null}
      </div>
    </section>
  );
}
