import Link from "next/link";
import { aiFilmCta } from "@/data/ai-film";
import { siteConfig } from "@/data/site";

export function AiFilmCta() {
  return (
    <section className="bg-soft-black">
      <div className="container-editorial section-y text-center">
        <p className="label-editorial text-ivory/60">{aiFilmCta.label}</p>
        <h2 className="font-display mx-auto mt-4 max-w-3xl text-[clamp(1.75rem,4.5vw,3.25rem)] leading-snug text-ivory md:mt-6">
          {aiFilmCta.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ivory/75 md:mt-6 md:text-base">
          {aiFilmCta.body}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 md:mt-10">
          <Link
            href="/contact?service=ai-film"
            className="label-editorial inline-flex min-h-[3rem] w-full items-center justify-center bg-ivory px-8 py-3.5 text-soft-black transition-opacity duration-300 hover:opacity-90 sm:w-auto"
          >
            Start an AI Film
          </Link>
          <a
            href={`mailto:${siteConfig.email}?subject=AI%20Film%20Inquiry`}
            className="label-editorial inline-flex min-h-[3rem] w-full items-center justify-center border border-ivory/50 px-8 py-3.5 text-ivory transition-colors duration-300 hover:border-ivory hover:bg-ivory/10 sm:w-auto"
          >
            Email the studio
          </a>
        </div>
      </div>
    </section>
  );
}
