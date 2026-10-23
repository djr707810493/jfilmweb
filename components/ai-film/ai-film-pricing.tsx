import Link from "next/link";
import { aiFilmPricing } from "@/data/ai-film";

function Check({ inverted }: { inverted?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className={`mt-0.5 size-4 shrink-0 ${inverted ? "text-ivory/70" : "text-taupe"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="m4 10.5 3.5 3.5L16 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AiFilmPricing() {
  return (
    <section id="pricing" className="section-y border-b border-taupe/40">
      <div className="container-editorial">
        <div className="max-w-2xl">
          <p className="label-editorial">{aiFilmPricing.label}</p>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,4.5vw,3rem)] leading-snug text-soft-black md:mt-4">
            {aiFilmPricing.heading}
          </h2>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-5 md:text-base">
            {aiFilmPricing.body}
          </p>

          <ul className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            {aiFilmPricing.meta.map((item) => (
              <li
                key={item}
                className="label-editorial flex items-center gap-2 text-[0.5625rem] text-soft-black-muted md:text-[0.625rem]"
              >
                <span aria-hidden className="size-1 rounded-full bg-taupe" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 grid gap-4 md:mt-12 md:gap-6 lg:grid-cols-3">
          {aiFilmPricing.packages.map((pkg) => {
            const featured = pkg.featured;

            return (
              <article
                key={pkg.id}
                className={`flex flex-col border p-5 md:p-7 ${
                  featured
                    ? "border-soft-black bg-soft-black text-ivory"
                    : "border-taupe/50 bg-ivory"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className={`font-display text-2xl leading-snug md:text-[1.75rem] ${
                      featured ? "text-ivory" : "text-soft-black"
                    }`}
                  >
                    {pkg.name}
                  </h3>
                  {featured ? (
                    <span className="label-editorial shrink-0 border border-ivory/40 px-2.5 py-1 text-ivory/85">
                      Most popular
                    </span>
                  ) : null}
                </div>

                <p
                  className={`mt-1.5 text-[0.8125rem] ${
                    featured ? "text-ivory/65" : "text-soft-black-muted"
                  }`}
                >
                  {pkg.tagline}
                </p>

                <div
                  className={`mt-5 flex flex-wrap items-baseline gap-2 border-b pb-5 ${
                    featured ? "border-ivory/20" : "border-taupe/30"
                  }`}
                >
                  <span
                    className={`font-display text-4xl leading-none md:text-5xl ${
                      featured ? "text-ivory" : "text-soft-black"
                    }`}
                  >
                    {pkg.price}
                  </span>
                  <span
                    className={`label-editorial ${
                      featured ? "text-ivory/60" : "text-taupe"
                    }`}
                  >
                    {pkg.priceNote}
                  </span>
                  <span
                    className={`ml-auto text-[0.8125rem] line-through md:text-sm ${
                      featured ? "text-ivory/45" : "text-soft-black-muted/70"
                    }`}
                  >
                    <span className="sr-only">Regular price </span>
                    {pkg.compareAt}
                  </span>
                </div>

                <ul className="mt-5 flex-1 space-y-2.5 md:mt-6">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex gap-2.5 text-[0.8125rem] leading-relaxed md:text-sm ${
                        featured ? "text-ivory/80" : "text-soft-black-muted"
                      }`}
                    >
                      <Check inverted={featured} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact?service=ai-film"
                  className={`label-editorial mt-7 inline-flex min-h-[3rem] items-center justify-center px-6 py-3.5 transition-colors duration-300 md:mt-8 ${
                    featured
                      ? "bg-ivory text-soft-black hover:bg-ivory-dark"
                      : "border border-soft-black bg-soft-black text-ivory hover:bg-soft-black-muted"
                  }`}
                >
                  {pkg.cta}
                </Link>
              </article>
            );
          })}
        </div>

        <p className="mt-6 max-w-2xl text-[0.75rem] leading-relaxed text-soft-black-muted md:mt-8 md:text-[0.8125rem]">
          {aiFilmPricing.note}
        </p>
      </div>
    </section>
  );
}
