"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteImage } from "@/components/site-image";
import { PortfolioVideo } from "@/components/portfolio/portfolio-video";
import { useSectionDwell } from "@/components/home/use-section-dwell";
import { featuredGalleryPhotos } from "@/data/featured-gallery";
import { getPublishedPortfolioProjects } from "@/lib/firebase/portfolio";
import { isFirebaseConfigured } from "@/lib/firebase";
import { trackViewFullPortfolioClick } from "@/lib/analytics";
import { isDirectVideoFileUrl, isValidVideoEmbedUrl } from "@/lib/video-embed";

type PortfolioGridSectionProps = {
  showHeader?: boolean;
};

type GalleryTab = "photos" | "films";

/** A gallery video starred with "Show on homepage" in the dashboard. */
type HomepageFilm = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  poster: string;
  alt: string;
  duration?: string;
};

const PAGE_SIZE = 10;

export function PortfolioGridSection({
  showHeader = true,
}: PortfolioGridSectionProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [tab, setTab] = useState<GalleryTab>("photos");
  // `null` means "still loading"; resolves to [] when Firebase is absent.
  const [films, setFilms] = useState<HomepageFilm[] | null>(() =>
    isFirebaseConfigured() ? null : [],
  );
  // Homepage-only: measures interest in the gallery before the visitor leaves.
  const sectionRef = useSectionDwell({ sectionId: "featured_gallery" });

  useEffect(() => {
    if (films !== null) return;

    let cancelled = false;

    getPublishedPortfolioProjects()
      .then((projects) => {
        if (cancelled) return;

        const picked: HomepageFilm[] = [];
        for (const project of projects) {
          for (const item of project.media) {
            if (item.type !== "video" || item.featured !== true) continue;
            if (
              !isValidVideoEmbedUrl(item.src) &&
              !isDirectVideoFileUrl(item.src)
            ) {
              continue;
            }

            picked.push({
              id: `${project.slug}-${picked.length}`,
              title: item.title || project.title,
              subtitle: [project.location, item.duration]
                .filter(Boolean)
                .join(" · "),
              src: item.src,
              poster:
                item.poster ||
                (project.cover.type === "image" ? project.cover.src : ""),
              alt: item.alt || project.title,
              duration: item.duration,
            });
          }
        }

        setFilms(picked);
      })
      .catch(() => {
        if (!cancelled) setFilms([]);
      });

    return () => {
      cancelled = true;
    };
  }, [films]);

  const playableFilms = films ?? [];
  // Nothing starred in the dashboard yet → keep the gallery photo-only.
  const showTabs = playableFilms.length > 0;
  const activeTab: GalleryTab = showTabs ? tab : "photos";

  const frames = featuredGalleryPhotos;
  const visibleFrames = frames.slice(0, visibleCount);
  const hasMore = visibleCount < frames.length;

  if (frames.length === 0 && playableFilms.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="section-y-compact border-b border-taupe/40"
    >
      <div className="container-editorial">
        {showHeader && (
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
            <div>
              <p className="label-editorial">Curated</p>
              <h2 className="font-display mt-2 text-[clamp(1.375rem,4.5vw,3rem)] text-soft-black md:mt-4">
                Featured Gallery
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="label-editorial link-underline tap-link self-start text-soft-black-muted md:self-auto"
              onClick={trackViewFullPortfolioClick}
            >
              View Full Portfolio
            </Link>
          </div>
        )}

        {showTabs && (
          <div
            role="tablist"
            aria-label="Featured gallery media"
            className={`flex gap-6 border-b border-taupe/30 ${showHeader ? "mt-6 md:mt-10" : "mt-0"}`}
          >
            {(
              [
                { id: "photos", label: "Photos" },
                { id: "films", label: "Films" },
              ] as const
            ).map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={`label-editorial -mb-px border-b py-3 transition-colors duration-300 ${
                    active
                      ? "border-soft-black text-soft-black"
                      : "border-transparent text-soft-black-muted hover:text-soft-black"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {activeTab === "photos" && (
          <>
            <div className="mt-4 columns-2 gap-3 md:mt-8 md:columns-3 md:gap-5">
              {visibleFrames.map((frame, index) => (
                <Link
                  key={frame.src}
                  href="/portfolio"
                  className="group mb-3 block break-inside-avoid md:mb-5"
                >
                  <figure>
                    <div className="overflow-hidden bg-taupe/10">
                      <SiteImage
                        src={frame.src}
                        alt={frame.alt}
                        width={frame.width}
                        height={frame.height}
                        priority={index < 2}
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    </div>
                    <figcaption className="mt-2 flex items-baseline justify-between gap-3">
                      <span className="truncate font-display text-base text-soft-black md:text-lg">
                        {frame.alt}
                      </span>
                    </figcaption>
                  </figure>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex flex-col items-center gap-2 md:mt-12">
                <p className="text-xs text-soft-black-muted">
                  Showing {visibleFrames.length} of {frames.length}
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="label-editorial tap-link border border-soft-black px-8 py-3 text-soft-black transition-colors hover:bg-soft-black hover:text-ivory"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "films" && (
          <div className="mt-4 md:mt-8">
            <ul className="grid gap-4 sm:grid-cols-2 md:gap-6">
              {playableFilms.map((film) => (
                <li key={film.id}>
                  <PortfolioVideo
                    media={{
                      type: "video",
                      src: film.src,
                      poster: film.poster,
                      alt: film.alt || film.title,
                      title: film.title,
                      duration: film.duration,
                    }}
                    layout="facade"
                    className="border border-taupe/30"
                  />
                  <div className="mt-3 flex items-baseline justify-between gap-3">
                    <span className="font-display text-base text-soft-black md:text-lg">
                      {film.title}
                    </span>
                    {film.subtitle ? (
                      <span className="label-editorial shrink-0 text-taupe">
                        {film.subtitle}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-center gap-2 md:mt-10">
              <Link
                href="/weddings"
                className="label-editorial tap-link border border-soft-black px-8 py-3 text-soft-black transition-colors hover:bg-soft-black hover:text-ivory"
              >
                Browse Wedding Films
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
