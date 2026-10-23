import { aiFilmProcess } from "@/data/ai-film";

export function AiFilmProcess() {
  return (
    <section id="process" className="section-y-compact border-b border-taupe/40 bg-ivory-dark md:section-y">
      <div className="container-editorial">
        <div className="max-w-2xl">
          <p className="label-editorial">{aiFilmProcess.label}</p>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,4.5vw,3rem)] leading-snug text-soft-black md:mt-4">
            {aiFilmProcess.heading}
          </h2>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-5 md:text-base">
            {aiFilmProcess.body}
          </p>
        </div>

        <ol className="mt-8 grid gap-6 sm:grid-cols-2 md:mt-14 lg:grid-cols-4 lg:gap-8">
          {aiFilmProcess.steps.map((step) => (
            <li
              key={step.number}
              className="group relative flex flex-col border-t border-taupe/50 pt-5 md:pt-6"
            >
              <span
                aria-hidden
                className="absolute -top-px left-0 h-px w-10 bg-soft-black transition-all duration-500 group-hover:w-16"
              />
              <span className="font-display text-2xl leading-none text-taupe md:text-3xl">
                {step.number}
              </span>
              <h3 className="font-display mt-4 text-xl leading-snug text-soft-black md:text-2xl">
                {step.title}
              </h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-3 md:text-sm">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
