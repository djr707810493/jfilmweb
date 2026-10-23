import { aiFilmFaq } from "@/data/ai-film";

export function AiFilmFaq() {
  return (
    <section className="section-y-compact border-b border-taupe/40 md:section-y">
      <div className="container-editorial grid gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-16 lg:gap-24">
        <div className="md:sticky md:top-28 md:self-start">
          <p className="label-editorial">Questions</p>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,4.5vw,3rem)] leading-snug text-soft-black md:mt-4">
            Good things to know.
          </h2>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-5 md:text-base">
            Everything you might ask before sending us your photos.
          </p>
        </div>

        <div className="border-t border-taupe/40">
          {aiFilmFaq.map((item, index) => (
            <details
              key={item.question}
              className="group border-b border-taupe/40"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left md:py-6 [&::-webkit-details-marker]:hidden">
                <span className="text-[0.9375rem] font-medium text-soft-black md:text-lg">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className="relative flex size-6 shrink-0 items-center justify-center text-taupe"
                >
                  <span className="absolute h-px w-3.5 bg-current" />
                  <span className="absolute h-3.5 w-px bg-current transition-transform duration-300 group-open:scale-y-0" />
                </span>
              </summary>
              <p className="max-w-prose pb-5 text-[0.8125rem] leading-relaxed text-soft-black-muted md:pb-6 md:text-[0.9375rem]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
