import { SiteImage } from "@/components/site-image";
import { aiFilmIntro } from "@/data/ai-film";

export function AiFilmIntro() {
  return (
    <section className="section-y border-b border-taupe/40">
      <div className="container-editorial grid items-center gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-taupe/10 md:order-1">
          <SiteImage
            src={aiFilmIntro.image.src}
            alt={aiFilmIntro.image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="md:order-2">
          <p className="label-editorial">{aiFilmIntro.label}</p>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,4vw,3rem)] leading-snug text-soft-black md:mt-4">
            {aiFilmIntro.heading}
          </h2>

          <div className="mt-5 space-y-4 text-[0.9375rem] leading-relaxed text-soft-black-muted md:mt-6 md:text-base">
            {aiFilmIntro.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <ul className="mt-8 space-y-5 border-t border-taupe/40 pt-8 md:mt-10">
            {aiFilmIntro.points.map((point) => (
              <li key={point.title} className="flex gap-4">
                <span aria-hidden className="mt-2.5 h-px w-6 shrink-0 bg-taupe" />
                <div>
                  <h3 className="text-[0.9375rem] font-medium text-soft-black">
                    {point.title}
                  </h3>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-soft-black-muted md:text-sm">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
