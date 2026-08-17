"use client";

import { useMemo, useState } from "react";
import { PortfolioProjectCard } from "@/components/portfolio/portfolio-project-card";
import { usePortfolioProjects } from "@/hooks/use-portfolio-projects";
import { projectHasVideo, projectHasImage } from "@/lib/firebase/portfolio";

type PortfolioFilter = "all" | "stills" | "film";

const filters: { value: PortfolioFilter; label: string }[] = [
  { value: "all", label: "All Work" },
  { value: "stills", label: "Stills" },
  { value: "film", label: "Film" },
];

export function PortfolioGallery() {
  const { projects, loading } = usePortfolioProjects();
  const [activeFilter, setActiveFilter] = useState<PortfolioFilter>("all");

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return projects;
    if (activeFilter === "film") {
      return projects.filter((project) => projectHasVideo(project));
    }
    return projects.filter((project) => projectHasImage(project));
  }, [activeFilter, projects]);

  return (
    <div>
      <div className="container-editorial border-b border-taupe/30 pb-6">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`inline-flex min-h-[2.75rem] flex-col items-start justify-end whitespace-nowrap py-1 label-editorial transition-colors duration-300 ${
                activeFilter === filter.value
                  ? "text-soft-black"
                  : "text-soft-black-muted hover:text-soft-black"
              }`}
            >
              <span>{filter.label}</span>
              <span
                aria-hidden
                className={`mt-2 h-px w-full origin-left transition-transform duration-300 ${
                  activeFilter === filter.value
                    ? "scale-x-100 bg-soft-black"
                    : "scale-x-0 bg-transparent"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="container-editorial section-y-compact md:section-y">
        {loading ? (
          <p className="text-center text-sm text-soft-black-muted">
            Loading portfolio…
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 md:gap-x-6 lg:gap-x-8">
            {filteredProjects.map((project, index) => (
              <PortfolioProjectCard
                key={project.slug}
                project={project}
                priority={index === 0}
                listName="portfolio_gallery"
                index={index}
              />
            ))}
          </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <p className="text-center text-sm text-soft-black-muted">
            No projects in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}
