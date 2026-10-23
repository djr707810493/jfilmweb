"use client";

import { useEffect, useState } from "react";
import { SiteImage } from "@/components/site-image";
import { aiFilmShowcase } from "@/data/ai-film";
import { createDefaultAiFilmFilms, getAiFilmFilms } from "@/lib/firebase/website";
import {
  getVideoPosterUrl,
  isDirectVideoFileUrl,
  parseVideoEmbedUrl,
} from "@/lib/video-embed";
import type { AiFilmVideo } from "@/types/website";

export function AiFilmShowcase() {
  const [films, setFilms] = useState<AiFilmVideo[]>(createDefaultAiFilmFilms);
  const [active, setActive] = useState<AiFilmVideo | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAiFilmFilms()
      .then((next) => {
        if (!cancelled) setFilms(next);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  const hasPlayableFilm = films.some((film) => film.src.trim().length > 0);

  return (
    <section id="films" className="section-y border-b border-taupe/40">
      <div className="container-editorial">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="label-editorial">{aiFilmShowcase.label}</p>
            <h2 className="font-display mt-3 text-[clamp(1.75rem,4.5vw,3rem)] leading-snug text-soft-black md:mt-4">
              {aiFilmShowcase.heading}
            </h2>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-5 md:text-base">
              {aiFilmShowcase.body}
            </p>
          </div>
          <p className="label-editorial shrink-0 text-taupe">
            {hasPlayableFilm ? "Tap a card to watch" : "Preview coming soon"}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-12 md:gap-6">
          {films.map((film) => {
            const poster = getVideoPosterUrl(film.src, film.poster);
            return (
              <button
                key={film.id}
                type="button"
                onClick={() => setActive(film)}
                className="group relative block aspect-video w-full overflow-hidden bg-soft-black text-left"
                aria-label={`Preview ${film.title}`}
              >
                {poster ? (
                  <SiteImage
                    src={poster}
                    alt={film.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <span className="absolute inset-0 bg-soft-black" />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-soft-black/80 via-soft-black/10 to-soft-black/20" />
                <span className="label-editorial absolute top-3 left-3 border border-ivory/30 bg-soft-black/45 px-2.5 py-1 text-ivory backdrop-blur-sm">
                  {film.tag}
                </span>
                <span className="label-editorial absolute top-3 right-3 bg-soft-black/45 px-2 py-1 text-ivory/85 backdrop-blur-sm">
                  {film.duration}
                </span>

                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-14 items-center justify-center border border-ivory/70 bg-soft-black/30 backdrop-blur-sm transition-colors duration-300 group-hover:bg-soft-black/50 md:size-16">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden
                      className="ml-0.5 size-5 fill-ivory md:size-6"
                    >
                      <path d="M8 5.14v13.72L19 12 8 5.14z" />
                    </svg>
                  </span>
                </span>

                <span className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                  <span className="font-display block text-xl text-ivory md:text-2xl">
                    {film.title}
                  </span>
                  <span className="mt-0.5 block text-[0.75rem] text-ivory/70">
                    {film.subtitle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {active ? <FilmPreview film={active} onClose={() => setActive(null)} /> : null}
    </section>
  );
}

function FilmPreview({
  film,
  onClose,
}: {
  film: AiFilmVideo;
  onClose: () => void;
}) {
  const embed = parseVideoEmbedUrl(film.src);
  const directVideo = !embed && isDirectVideoFileUrl(film.src);
  const poster = getVideoPosterUrl(film.src, film.poster);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${film.title} preview`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-soft-black/90 p-4 backdrop-blur-sm md:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="tap-target absolute -top-1 right-0 z-10 text-ivory/80 transition-colors hover:text-ivory"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="size-6 stroke-current"
            fill="none"
            strokeWidth="1.5"
          >
            <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative aspect-video w-full overflow-hidden bg-soft-black">
          {embed ? (
            <iframe
              src={`${embed.embedUrl}?autoplay=1&rel=0`}
              title={film.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : directVideo ? (
            <video
              src={film.src}
              poster={poster || undefined}
              controls
              playsInline
              autoPlay
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              {film.poster ? (
                <SiteImage
                  src={film.poster}
                  alt={film.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover opacity-60"
                />
              ) : null}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <span className="label-editorial border border-ivory/40 px-3 py-1.5 text-ivory/80">
                  Placeholder
                </span>
                <p className="font-display mt-4 text-2xl text-ivory md:text-3xl">
                  {film.title}
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ivory/75">
                  The full AI film collection is being finished. This preview
                  marks where your film will play.
                </p>
              </div>
            </>
          )}
        </div>

        <p className="mt-3 text-center text-[0.75rem] text-ivory/60">
          {film.subtitle}
          {embed || directVideo ? "" : " · Preview coming soon"}
        </p>
      </div>
    </div>
  );
}
