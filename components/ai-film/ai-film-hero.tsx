import Link from "next/link";
import { SiteImage } from "@/components/site-image";
import { aiFilmHero } from "@/data/ai-film";

export function AiFilmHero() {
  const { aside } = aiFilmHero;

  return (
    <section className="relative isolate overflow-hidden bg-soft-black">
      <div className="absolute inset-0">
        <SiteImage
          src={aiFilmHero.image.src}
          alt={aiFilmHero.image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-soft-black/90 via-soft-black/35 to-soft-black/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-soft-black/90 via-soft-black/55 to-soft-black/10" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="container-editorial flex justify-end pt-6 md:pt-10">
          <p className="text-right [text-shadow:0_1px_18px_rgba(0,0,0,0.55)]">
            <span className="font-display block text-base leading-tight text-ivory md:text-xl lg:text-2xl">
              {aside.title}
            </span>
            <span className="label-editorial mt-1.5 block text-[0.5rem] text-ivory/70 md:text-[0.5625rem]">
              {aside.caption}
            </span>
          </p>
        </div>
      </div>

      <div className="container-editorial relative z-10 flex min-h-[80svh] flex-col justify-end pt-24 pb-12 md:min-h-[92vh] md:justify-center md:pt-28 md:pb-16 lg:min-h-[95vh]">
        <div className="max-w-2xl">
          <p className="label-editorial inline-flex items-center gap-2 border border-ivory/30 bg-soft-black/30 px-3 py-1.5 text-ivory/85 backdrop-blur-sm">
            <span className="inline-block size-1.5 rounded-full bg-ivory/80" />
            {aiFilmHero.label}
          </p>

          <h1 className="font-display mt-6 text-[clamp(2.125rem,6.5vw,4.25rem)] leading-[1.08] tracking-[-0.02em] text-ivory">
            {aiFilmHero.headline}
          </h1>

          <p className="mt-5 max-w-lg text-[0.625rem] leading-[1.9] tracking-[0.18em] text-ivory/80 uppercase md:mt-6 md:text-[0.6875rem] md:tracking-[0.2em]">
            {aiFilmHero.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 md:mt-10">
            {aiFilmHero.actions.map((action) =>
              action.variant === "primary" ? (
                <Link
                  key={action.href}
                  href={action.href}
                  className="label-editorial inline-flex min-h-[3rem] items-center justify-center bg-ivory px-8 py-3.5 text-soft-black transition-opacity duration-300 hover:opacity-90"
                >
                  {action.label}
                </Link>
              ) : (
                <Link
                  key={action.href}
                  href={action.href}
                  className="label-editorial inline-flex min-h-[3rem] items-center justify-center border border-ivory/60 px-8 py-3.5 text-ivory backdrop-blur-[2px] transition-colors duration-300 hover:border-ivory hover:bg-ivory/10"
                >
                  {action.label}
                </Link>
              ),
            )}
          </div>
        </div>

        <ul className="mt-12 grid max-w-4xl grid-cols-2 gap-x-4 gap-y-4 border-t border-ivory/25 pt-6 md:mt-16 md:grid-cols-4 md:gap-6">
          {aiFilmHero.highlights.map((highlight, index) => (
            <li key={highlight} className="flex items-start gap-2">
              <span className="label-editorial mt-0.5 text-[0.5rem] text-ivory/45">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="label-editorial text-[0.5625rem] leading-relaxed text-ivory/85 md:text-[0.625rem]">
                {highlight}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
