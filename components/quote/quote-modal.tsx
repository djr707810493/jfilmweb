"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CoverageVideoButton } from "@/components/quote/coverage-video-button";
import { useQuoteRates } from "@/components/quote/use-quote-rates";
import {
  trackQuoteBookClick,
  trackQuoteClose,
  trackQuoteComplete,
  trackQuoteOpen,
  trackQuoteStep,
} from "@/lib/analytics";
import {
  QUOTE_ESTIMATE_EVENT,
  saveQuoteEstimate,
  type QuoteEstimate,
} from "@/components/quote/quote-session";
import {
  QUOTE_HOURS,
  buildPackagesForBudget,
  formatUSD,
  type QuoteCategoryId,
} from "@/components/quote/quote-config";

const STEPS = ["Date", "Coverage", "Hours", "Budget", "Result"] as const;

/** Slider bounds and step. */
export const BUDGET_MIN = 0;
export const BUDGET_MAX = 10000;
const BUDGET_STEP = 100;

type QuoteModalProps = {
  onClose: () => void;
  /** Where the tool was opened from, for funnel attribution in GA4. */
  source?: string;
};

export function QuoteModal({ onClose, source = "unknown" }: QuoteModalProps) {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [checking, setChecking] = useState<"idle" | "checking" | "available">("idle");
  const [category, setCategory] = useState<QuoteCategoryId>("photo");
  const [hours, setHours] = useState(5);
  const [budget, setBudget] = useState(2200);
  const [addOns, setAddOns] = useState<string[]>([]);
  const rates = useQuoteRates();
  const openedAt = useRef(Date.now());
  const bookedRef = useRef(false);
  const completedTrackedRef = useRef(false);
  // -1 so the very first step (index 0) is reported too.
  const stepTrackedRef = useRef(-1);

  const outcome = useMemo(
    () => buildPackagesForBudget(budget, category, hours, addOns, rates),
    [budget, category, hours, addOns, rates],
  );

  // Open event + step funnel (every step change is reported once).
  useEffect(() => {
    trackQuoteOpen(source);
    // Lets other sections know a site CTA was used (see useSectionDwell).
    window.dispatchEvent(new CustomEvent("jfilm:quote-open-request"));
  }, [source]);

  useEffect(() => {
    if (stepTrackedRef.current === step) return;
    stepTrackedRef.current = step;
    trackQuoteStep(STEPS[step] ?? "unknown", step);
  }, [step]);

  const recommendedPrice =
    outcome.status === "ok"
      ? (outcome.packages.find((pkg) => pkg.recommended)?.price ?? 0)
      : 0;

  // Reaching the result step counts as a generated quote — report once.
  useEffect(() => {
    if (step !== 4 || outcome.status !== "ok" || completedTrackedRef.current) return;
    completedTrackedRef.current = true;
    trackQuoteComplete({
      categoryId: category,
      categoryLabel:
        rates.categories.find((c) => c.id === category)?.label ?? category,
      hours,
      budget,
      packageCount: outcome.packages.length,
      recommendedPrice,
      durationMs: Date.now() - openedAt.current,
    });
  }, [step, outcome, category, hours, budget, rates.categories, recommendedPrice]);

  function handleClose() {
    trackQuoteClose({
      lastStep: STEPS[step] ?? "unknown",
      lastStepIndex: step,
      completed: completedTrackedRef.current,
      booked: bookedRef.current,
      durationMs: Date.now() - openedAt.current,
    });
    onClose();
  }

  function toggleAddOn(id: string) {
    setAddOns((current) =>
      current.includes(id) ? current.filter((a) => a !== id) : [...current, id],
    );
  }

  /** Hand the estimate to the contact form, then close and scroll down to it. */
  function bookWithEstimate() {
    const categoryLabel =
      rates.categories.find((c) => c.id === category)?.label ?? "Coverage";
    bookedRef.current = true;
    trackQuoteBookClick({ categoryId: category, hours, budget, recommendedPrice });
    const estimate: QuoteEstimate = {
      categoryId: category,
      categoryLabel,
      hours,
      budget,
      date,
      location,
      addOnLabels: rates.addOns
        .filter((a) => addOns.includes(a.id))
        .map((a) => a.label),
      packages:
        outcome.status === "ok"
          ? outcome.packages.map((pkg) => ({
              name: pkg.name,
              price: pkg.price,
              recommended: pkg.recommended,
              includes: pkg.includes,
            }))
          : [],
      savedAt: Date.now(),
    };

    saveQuoteEstimate(estimate);
    handleClose();
    window.dispatchEvent(new CustomEvent(QUOTE_ESTIMATE_EVENT));

    window.setTimeout(() => {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  function startAvailabilityCheck() {
    if (!date) {
      setStep(1);
      return;
    }
    setChecking("checking");
    window.setTimeout(() => setChecking("available"), 1600);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-soft-black/60 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Instant quote"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden bg-ivory shadow-2xl sm:rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-taupe/40 px-5 py-4">
          <div>
            <p className="label-editorial text-taupe">Instant Quote · estimate only</p>
            <p className="font-display mt-1 text-lg text-soft-black">
              {step < 4 ? STEPS[step] : "Your Packages"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close quote tool"
            className="flex size-10 items-center justify-center text-soft-black-muted hover:text-soft-black"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex gap-1.5 px-5 pt-4" aria-hidden>
          {STEPS.map((label, index) => (
            <span
              key={label}
              className={`h-1 flex-1 rounded-full ${index <= step ? "bg-soft-black" : "bg-taupe/30"}`}
            />
          ))}
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {step === 0 && checking !== "available" && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-soft-black-muted">
                First, tell us your wedding date — we&apos;ll check our calendar live.
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="block text-sm text-soft-black">
                  <span className="label-editorial text-soft-black">Wedding date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full border border-taupe/40 bg-ivory px-3 py-3 text-base text-soft-black"
                  />
                </label>
                <label className="block text-sm text-soft-black">
                  <span className="label-editorial text-soft-black">Location</span>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Park City, Moab…"
                    className="mt-1 w-full border border-taupe/40 bg-ivory px-3 py-3 text-base text-soft-black"
                  />
                </label>
              </div>
              {checking === "checking" && (
                <div className="flex items-center gap-3 border border-taupe/40 bg-ivory-dark p-4" aria-live="polite">
                  <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-taupe/40 border-t-soft-black" />
                  <span className="text-sm text-soft-black">
                    Checking availability for {date}…
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={startAvailabilityCheck}
                disabled={checking === "checking"}
                className="label-editorial tap-link flex min-h-[3.5rem] w-full items-center justify-center gap-2 bg-soft-black px-8 py-4 text-base text-ivory disabled:opacity-60"
              >
                {checking === "checking" ? "Checking…" : "Check availability →"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="label-editorial tap-link w-full py-1 text-center text-soft-black-muted"
              >
                I&apos;m flexible on dates — skip
              </button>
            </div>
          )}

          {step === 0 && checking === "available" && (
            <div className="space-y-4 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-soft-black text-ivory">
                <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div>
                <p className="font-display text-2xl text-soft-black">We&apos;re available!</p>
                <p className="mt-2 text-sm leading-relaxed text-soft-black-muted">
                  {date} {location ? `in ${location} ` : ""}is open on our calendar.
                  Let&apos;s build your package.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="label-editorial tap-link flex min-h-[3.5rem] w-full items-center justify-center gap-2 bg-soft-black px-8 py-4 text-base text-ivory"
              >
                Build my package →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-2.5">
              {rates.categories.map((option) => {
                const showVideoHelp = option.id === "duo-1" || option.id === "duo-2";
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setCategory(option.id as QuoteCategoryId);
                      setStep(2);
                    }}
                    className={`relative border p-4 text-left transition-colors ${
                      category === option.id
                        ? "border-soft-black bg-ivory-dark"
                        : "border-taupe/40 bg-ivory hover:border-soft-black/50"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-display text-lg text-soft-black">{option.label}</span>
                      {showVideoHelp ? <CoverageVideoButton label={option.label} /> : null}
                    </span>
                    <span className="mt-1 block text-sm text-soft-black-muted">{option.blurb}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-2.5">
              {QUOTE_HOURS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setHours(option)}
                  className={`border p-5 text-center transition-colors ${
                    hours === option
                      ? "border-soft-black bg-soft-black text-ivory"
                      : "border-taupe/40 bg-ivory hover:border-soft-black/50"
                  }`}
                >
                  <span className="font-display text-2xl">{option}h</span>
                  <span className={`mt-1 block text-xs ${hours === option ? "text-ivory/70" : "text-soft-black-muted"}`}>
                    {option <= 2 ? "Ceremony essentials" : option <= 5 ? "Half-day story" : "Full-day coverage"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <BudgetSlider
              value={budget}
              onChange={setBudget}
              hours={hours}
              minHourlyRate={rates.minHourlyRate}
            />
          )}

          {step === 4 && (
            <div className="space-y-4">
              {outcome.status === "below-minimum" ? (
                <div className="space-y-4">
                  <div className="border border-soft-black bg-ivory-dark p-5">
                    <p className="label-editorial text-taupe">Coverage at {formatUSD(budget)}</p>
                    <p className="font-display mt-2 text-xl leading-snug text-soft-black">
                      We can&apos;t cover {hours} hours at this budget.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-soft-black-muted">
                      Our minimum is {formatUSD(rates.minHourlyRate)} per hour, so {hours} hours
                      starts at {formatUSD(outcome.floorTotal)}. Tell us what matters most and
                      we&apos;ll suggest a shorter duration or a custom plan that fits.
                    </p>
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="label-editorial flex min-h-[3.5rem] items-center justify-center border border-soft-black px-6 py-3 text-soft-black"
                    >
                      ← Change hours
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="label-editorial flex min-h-[3.5rem] items-center justify-center border border-soft-black px-6 py-3 text-soft-black"
                    >
                      ← Change budget
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={bookWithEstimate}
                    className="label-editorial tap-link flex min-h-[3.5rem] w-full items-center justify-center gap-2 bg-soft-black px-8 py-4 text-base text-ivory"
                  >
                    Talk to us about a custom plan →
                  </button>                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between border border-soft-black bg-ivory-dark px-5 py-4">
                    <span className="label-editorial text-taupe">Your budget</span>
                    <span className="font-display text-3xl text-soft-black">{formatUSD(budget)}</span>
                  </div>

                  <ul className="space-y-3">
                    {outcome.packages.map((pkg) => (
                      <li
                        key={pkg.id}
                        className={`border p-4 ${
                          pkg.recommended
                            ? "border-soft-black bg-ivory-dark"
                            : "border-taupe/40 bg-ivory"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="label-editorial text-taupe">{pkg.tag}</p>
                            <p className="font-display mt-1 text-lg text-soft-black">{pkg.name}</p>
                          </div>
                          <span className="font-display shrink-0 text-xl text-soft-black">
                            {formatUSD(pkg.price)}
                          </span>
                        </div>
                        <ul className="mt-3 space-y-1 border-t border-taupe/30 pt-3">
                          {pkg.includes.map((line) => (
                            <li key={line} className="text-[0.8125rem] leading-relaxed text-soft-black-muted">
                              · {line}
                            </li>
                          ))}
                        </ul>
                        {pkg.overBy > 0 && (
                          <p className="mt-2 text-xs text-soft-black-muted">
                            {formatUSD(pkg.overBy)} above your budget — shorten hours or drop extras to fit.
                          </p>
                        )}
                        {pkg.recommended && (
                          <span className="label-editorial mt-3 inline-block bg-soft-black px-3 py-1 text-[11px] text-ivory">
                            ✓ Recommended for you
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2.5 border border-taupe/40 bg-ivory p-4">
                    <p className="label-editorial text-soft-black">Add extras</p>
                    {rates.addOns.map((option) => {
                      const active = addOns.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleAddOn(option.id)}
                          aria-pressed={active}
                          className={`flex w-full items-center justify-between gap-3 border px-3 py-2.5 text-left transition-colors ${
                            active ? "border-soft-black bg-ivory-dark" : "border-taupe/40 bg-ivory"
                          }`}
                        >
                          <span className="text-sm text-soft-black">
                            {active ? "✓ " : ""}{option.label}
                          </span>
                          <span className="label-editorial shrink-0 text-taupe">+{formatUSD(option.flatPrice)}</span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs leading-relaxed text-soft-black-muted">
                    Estimates only, not a final price. Final quote depends on date, location and exact needs
                    {date ? ` (${date}${location ? ` · ${location}` : ""})` : ""}.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-taupe/40 px-5 py-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="label-editorial tap-link min-h-[3.5rem] px-2 text-soft-black"
            >
              ← Back
            </button>
          ) : (
            <span />
          )}
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(3)}
              className="label-editorial tap-link flex min-h-[3.5rem] flex-1 items-center justify-center gap-2 bg-soft-black px-8 py-4 text-base text-ivory"
            >
              Set my budget →
            </button>
          ) : step === 3 ? (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="label-editorial tap-link flex min-h-[3.5rem] flex-1 items-center justify-center gap-2 bg-soft-black px-8 py-4 text-base text-ivory"
            >
              Show my packages →
            </button>
          ) : step === 4 ? (
            outcome.status === "ok" ? (
              <button
                type="button"
                onClick={bookWithEstimate}
                className="label-editorial tap-link flex min-h-[3.5rem] flex-1 items-center justify-center gap-2 bg-soft-black px-8 py-4 text-base text-ivory"
              >
                Book with this estimate →
              </button>
            ) : (
              <span />
            )
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}

function BudgetSlider({
  value,
  onChange,
  hours,
  minHourlyRate,
}: {
  value: number;
  onChange: (next: number) => void;
  hours: number;
  minHourlyRate: number;
}) {
  const floor = minHourlyRate * hours;
  const belowFloor = value < floor;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="label-editorial text-taupe">Your budget</span>
        <span className="font-display text-3xl text-soft-black">{formatUSD(value)}</span>
      </div>

      <input
        type="range"
        min={BUDGET_MIN}
        max={BUDGET_MAX}
        step={BUDGET_STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Budget"
        aria-valuetext={formatUSD(value)}
        className="quote-range w-full cursor-pointer"
      />

      <div className="flex justify-between text-[11px] text-soft-black-muted">
        <span>{formatUSD(BUDGET_MIN)}</span>
        <span className={belowFloor ? "text-soft-black" : ""}>
          {belowFloor ? `min for ${hours}h is ${formatUSD(floor)}` : `${hours}h coverage`}
        </span>
        <span>{formatUSD(BUDGET_MAX)}</span>
      </div>
    </div>
  );
}
