import { aiFilmUseCases } from "@/data/ai-film";

export function AiFilmUseCases() {
  return (
    <section className="section-y-compact border-b border-taupe/40 bg-ivory-dark md:section-y">
      <div className="container-editorial">
        <div className="max-w-2xl">
          <p className="label-editorial">{aiFilmUseCases.label}</p>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,4.5vw,3rem)] leading-snug text-soft-black md:mt-4">
            {aiFilmUseCases.heading}
          </h2>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-5 md:text-base">
            {aiFilmUseCases.body}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 md:gap-5 lg:grid-cols-3">
          {aiFilmUseCases.cases.map((useCase) => (
            <article
              key={useCase.id}
              className="group flex flex-col border border-taupe/40 bg-ivory p-5 transition-colors duration-300 hover:border-soft-black/40 md:p-7"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-xl leading-none text-taupe md:text-2xl">
                  {useCase.number}
                </span>
                <span
                  aria-hidden
                  className="h-px w-8 bg-taupe/50 transition-all duration-500 group-hover:w-12 group-hover:bg-soft-black/40"
                />
              </div>
              <h3 className="font-display mt-4 text-xl leading-snug text-soft-black md:text-2xl">
                {useCase.title}
              </h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-3 md:text-sm">
                {useCase.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
