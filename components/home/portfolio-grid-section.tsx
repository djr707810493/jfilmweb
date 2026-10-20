"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteImage } from "@/components/site-image";
import { useSectionDwell } from "@/components/home/use-section-dwell";
import { featuredGalleryPhotos } from "@/data/featured-gallery";
import { trackViewFullPortfolioClick } from "@/lib/analytics";

type PortfolioGridSectionProps = {
  showHeader?: boolean;
};

const PAGE_SIZE = 10;

export function PortfolioGridSection({
  showHeader = true,
}: PortfolioGridSectionProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Homepage-only: measures interest in the gallery before the visitor leaves.
  const sectionRef = useSectionDwell({ sectionId: "featured_gallery" });

  const frames = featuredGalleryPhotos;
  const visibleFrames = frames.slice(0, visibleCount);
  const hasMore = visibleCount < frames.length;

  if (frames.length === 0) {
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

        <div
          className={`columns-2 gap-3 md:columns-3 md:gap-5 ${showHeader ? "mt-6 md:mt-14" : ""}`}
        >
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
      </div>
    </section>
  );
}
