"use client";

import Link from "next/link";
import { SiteImage } from "@/components/site-image";
import { PortfolioVideo } from "@/components/portfolio/portfolio-video";
import {
  trackPortfolioItemClick,
  type PortfolioListName,
} from "@/lib/analytics";
import { projectHasVideo } from "@/lib/firebase/portfolio";
import type { PortfolioMedia, PortfolioProject } from "@/types/portfolio";

type PortfolioProjectCardProps = {
  project: PortfolioProject;
  priority?: boolean;
  listName?: PortfolioListName;
  index?: number;
};

function resolveMediaAspectClass(project: PortfolioProject): string {
  if (project.cover.type === "video") {
    return "aspect-[16/10]";
  }

  return "aspect-[4/5]";
}

export function PortfolioProjectCard({
  project,
  priority = false,
  listName,
  index = 0,
}: PortfolioProjectCardProps) {
  const hasFilm = projectHasVideo(project);

  return (
    <Link
      href={`/portfolio/item/?slug=${project.slug}`}
      className="group block"
      onClick={() => {
        if (!listName) return;
        trackPortfolioItemClick(project, listName, index);
      }}
    >
      <div
        className={`relative overflow-hidden ${resolveMediaAspectClass(project)}`}
      >
        <PortfolioCover media={project.cover} priority={priority} />

        {hasFilm && project.cover.type === "image" && (
          <div className="absolute top-2 left-2 z-10 md:top-3 md:left-3">
            <span className="label-editorial border border-ivory/30 bg-soft-black/40 px-1.5 py-0.5 text-[0.5rem] md:text-[0.625rem] md:px-2.5 md:py-1 text-ivory backdrop-blur-sm">
              Includes Film
            </span>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex flex-col gap-1 border-t border-taupe/30 pt-2.5 sm:mt-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 sm:pt-3 md:mt-4 md:pt-4">
        <div className="min-w-0">
          <h2 className="font-display text-base leading-snug text-soft-black transition-colors duration-300 group-hover:text-soft-black-muted sm:text-lg md:text-xl lg:text-2xl">
            {project.title}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-[0.75rem] leading-relaxed text-soft-black-muted sm:mt-1 sm:text-[0.8125rem] md:text-sm">
            {project.description}
          </p>
        </div>
        <span className="label-editorial shrink-0 text-[0.5625rem] text-taupe sm:text-[0.625rem]">
          {project.location}
        </span>
      </div>
    </Link>
  );
}

export function PortfolioCover({
  media,
  priority,
}: {
  media: PortfolioMedia;
  priority?: boolean;
}) {
  if (media.type === "video") {
    return (
      <PortfolioVideo media={media} autoPlayOnClick={false} fit="fill" />
    );
  }

  return (
    <SiteImage
      src={media.src}
      alt={media.alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
    />
  );
}
