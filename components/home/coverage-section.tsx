"use client";

import Link from "next/link";
import { coverageContent, coverageOptions } from "@/data/homepage";
import { trackCoverageInquire } from "@/lib/analytics";

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
        </div>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4 md:mt-14 md:gap-6">
          {coverageOptions.map((option) => (
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
                ) : null}
              </div>

              <h3 className="font-display mt-3 text-[1.375rem] leading-snug text-soft-black md:text-2xl lg:text-[1.75rem]">
                {option.title}
              </h3>

              <p className="mt-1.5 flex items-center gap-2 text-[0.75rem] tracking-wide text-soft-black-muted uppercase md:text-[0.8125rem]">
                <CrewMarks count={option.operators} />
                {option.crew}
              </p>

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

              <Link
                href="#contact"
                onClick={() =>
                  trackCoverageInquire(option.id, `${option.title} · ${option.crew}`)
                }
                className="label-editorial link-underline tap-link mt-auto pt-6 text-soft-black md:pt-8"
              >
                Ask about this coverage
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 max-w-xl text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-10 md:text-sm">
          Not sure which fits? Tell us your date and budget — we&apos;ll recommend
          the right coverage. Same documentary approach across every option.
        </p>
      </div>
    </section>
  );
}
