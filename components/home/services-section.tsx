import { Fragment } from "react";
import { experienceSteps } from "@/data/homepage";

export function ServicesSection() {
  return (
    <section className="section-y-compact border-b border-taupe/40 bg-ivory-dark">
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

        {/* Mobile: vertical timeline */}
        <ol className="relative mt-6 md:hidden">
          {experienceSteps.map((step, index) => (
            <li key={step.number} className="relative flex gap-4">
              <div className="flex w-8 shrink-0 flex-col items-center">
                <span
                  aria-hidden
                  className="flex size-8 items-center justify-center border border-taupe/50 bg-ivory font-display text-sm text-taupe"
                >
                  {step.number}
                </span>
                {index < experienceSteps.length - 1 && (
                  <span
                    aria-hidden
                    className="my-1 w-px flex-1 bg-taupe/40"
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

        {/* Desktop: number rail + aligned content columns */}
        <div className="mt-10 hidden md:block">
          <div className="flex items-center" aria-hidden>
            {experienceSteps.map((step, index) => (
              <Fragment key={`rail-${step.number}`}>
                <span className="shrink-0 font-display text-2xl leading-none text-taupe lg:text-3xl">
                  {step.number}
                </span>
                {index < experienceSteps.length - 1 && (
                  <span className="mx-4 h-px flex-1 bg-taupe/40 lg:mx-6" />
                )}
              </Fragment>
            ))}
          </div>

          <ol className="mt-4 grid grid-cols-4 gap-6 lg:mt-5 lg:gap-8">
            {experienceSteps.map((step) => (
              <li key={step.number}>
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
