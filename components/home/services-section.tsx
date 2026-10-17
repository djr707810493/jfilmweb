"use client";

import { useEffect, useRef, useState } from "react";
import { experienceSteps } from "@/data/homepage";

const STEP_DELAY_MS = 160;
const RAIL_DELAY_MS = 120;

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    // Only hide steps once JS is running, so content never disappears without it.
    setArmed(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-armed={armed ? "true" : "false"}
      data-inview={inView ? "true" : "false"}
      className="process section-y-compact border-b border-taupe/40 bg-ivory-dark"
    >
      <div className="container-editorial">
        <div className="max-w-2xl">
          <p className="label-editorial">The Process</p>
          <h2 className="font-display mt-2 text-[clamp(1.375rem,4.5vw,3rem)] leading-snug text-soft-black md:mt-4">
            How We Work With You
          </h2>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-5 md:text-base">
            A calm path from first hello to final gallery — designed so you stay
            present on your wedding day.
          </p>
        </div>

        {/* Mobile: vertical timeline with a line that draws downward */}
        <ol className="relative mt-6 md:hidden">
          {experienceSteps.map((step, index) => (
            <li
              key={step.number}
              className="process-step relative flex gap-4"
              style={{ animationDelay: `${index * STEP_DELAY_MS}ms` }}
            >
              <div className="flex w-8 shrink-0 flex-col items-center">
                <span
                  aria-hidden
                  className="process-badge flex size-8 items-center justify-center border border-taupe/50 bg-ivory font-display text-sm text-taupe"
                >
                  <span>{step.number}</span>
                </span>
                {index < experienceSteps.length - 1 && (
                  <span
                    aria-hidden
                    className="process-rail-v my-1 w-px flex-1 bg-taupe/40"
                    style={{ animationDelay: `${index * STEP_DELAY_MS + RAIL_DELAY_MS}ms` }}
                  />
                )}
              </div>

              <div
                className={`min-w-0 flex-1 ${index < experienceSteps.length - 1 ? "pb-5" : "pb-0"}`}
              >
                <h3 className="font-display text-lg leading-snug text-soft-black">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-soft-black-muted">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Desktop: number rail that draws across, content columns rise in turn */}
        <div className="mt-10 hidden md:block">
          <div className="flex items-center" aria-hidden>
            {experienceSteps.map((step, index) => (
              <div
                key={`rail-${step.number}`}
                className="process-step flex min-w-0 flex-1 items-center last:flex-none"
                style={{ animationDelay: `${index * STEP_DELAY_MS}ms` }}
              >
                <span className="process-badge flex size-10 shrink-0 items-center justify-center border border-taupe/50 bg-ivory font-display text-lg text-taupe lg:size-11 lg:text-xl">
                  <span>{step.number}</span>
                </span>
                {index < experienceSteps.length - 1 && (
                  <span
                    aria-hidden
                    className="process-rail mx-4 h-px flex-1 bg-taupe/40 lg:mx-6"
                    style={{ animationDelay: `${index * STEP_DELAY_MS + RAIL_DELAY_MS}ms` }}
                  />
                )}
              </div>
            ))}
          </div>

          <ol className="mt-4 grid grid-cols-4 gap-6 lg:mt-5 lg:gap-8">
            {experienceSteps.map((step, index) => (
              <li
                key={step.number}
                className="process-step"
                style={{ animationDelay: `${index * STEP_DELAY_MS + 120}ms` }}
              >
                <h3 className="font-display text-xl text-soft-black lg:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-soft-black-muted lg:mt-3 lg:text-base">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
