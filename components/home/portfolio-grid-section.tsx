"use client";

import Link from "next/link";
import { useMemo } from "react";
import { SiteImage } from "@/components/site-image";
import { usePortfolioProjects } from "@/hooks/use-portfolio-projects";
import { useWeddingStories } from "@/hooks/use-wedding-stories";
import { trackPortfolioItemClick, trackViewFullPortfolioClick } from "@/lib/analytics";
import type { PortfolioImageMedia, PortfolioProject } from "@/types/portfolio";
import type { WeddingStory, WeddingStoryImage } from "@/types/wedding-story";

type CuratedFrame = {
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  href: string;
  title: string;
  location: string;
  project?: PortfolioProject;
};

type PortfolioGridSectionProps = {
  showHeader?: boolean;
};

export function PortfolioGridSection({
  showHeader = true,
}: PortfolioGridSectionProps) {
  const { projects, loading: projectsLoading } = usePortfolioProjects();
  const { stories, loading: storiesLoading } = useWeddingStories();

  const frames = useMemo(
    () => collectCuratedFrames(projects, stories),
    [projects, stories],
  );

  const loading = projectsLoading || storiesLoading;

  if (!loading && frames.length === 0) {
    return null;
  }

  return (
    <section className="section-y-compact border-b border-taupe/40">
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

        {loading && frames.length === 0 ? (
          <p className={`text-sm text-soft-black-muted ${showHeader ? "mt-6 md:mt-14" : ""}`}>
            Loading gallery…
          </p>
        ) : (
          <div
            className={`columns-2 gap-3 md:columns-3 md:gap-5 ${showHeader ? "mt-6 md:mt-14" : ""}`}
          >
            {frames.map((frame, index) => (
              <Link
                key={frame.key}
                href={frame.href}
                className="group mb-3 block break-inside-avoid md:mb-5"
                onClick={() => {
                  if (!frame.project) return;
                  trackPortfolioItemClick(frame.project, "home_featured", index);
                }}
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
                      {frame.title}
                    </span>
                    <span className="label-editorial shrink-0 text-[0.5625rem] text-taupe">
                      {frame.location}
                    </span>
                  </figcaption>
                </figure>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function collectCuratedFrames(
  projects: PortfolioProject[],
  stories: WeddingStory[],
): CuratedFrame[] {
  const frames: CuratedFrame[] = [];
  const seen = new Set<string>();

  function add(frame: CuratedFrame) {
    if (!frame.src || seen.has(frame.src)) return;
    seen.add(frame.src);
    frames.push(frame);
  }

  for (const project of projects) {
    const images: PortfolioImageMedia[] = [];
    if (project.cover.type === "image" && project.cover.curated === true) {
      images.push(project.cover);
    }
    for (const item of project.media) {
      if (item.type === "image" && item.curated === true) {
        images.push(item);
      }
    }

    images.forEach((image, index) => {
      add({
        key: `${project.slug}-${image.src}-${index}`,
        src: image.src,
        alt: image.alt || project.title,
        width: image.width || 1600,
        height: image.height || 1200,
        href: `/portfolio/item/?slug=${project.slug}`,
        title: project.title,
        location: project.location,
        project,
      });
    });
  }

  for (const story of stories) {
    const images: WeddingStoryImage[] = [];
    if (story.cover?.curated === true) images.push(story.cover);
    for (const image of story.gallery) {
      if (image.curated === true) images.push(image);
    }

    images.forEach((image, index) => {
      add({
        key: `${story.slug}-${image.src}-${index}`,
        src: image.src,
        alt: image.alt || story.title,
        width: 1600,
        height: 1200,
        href: `/weddings/${story.slug}/`,
        title: story.title,
        location: story.location,
      });
    });
  }

  return frames;
}
