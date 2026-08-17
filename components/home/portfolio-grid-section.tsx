"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PortfolioProjectCard } from "@/components/portfolio/portfolio-project-card";
import { usePortfolioProjects } from "@/hooks/use-portfolio-projects";
import { trackViewFullPortfolioClick } from "@/lib/analytics";

type PortfolioGridSectionProps = {
  showHeader?: boolean;
};

export function PortfolioGridSection({
  showHeader = true,
}: PortfolioGridSectionProps) {
  const { projects } = usePortfolioProjects();

  const displayProjects = useMemo(() => {
    // 1. Get all featured projects
    const featured = projects.filter((p) => p.featured);
    
    // 2. If we have less than 6 featured, get the top unfeatured ones to fill the gap
    if (featured.length < 6) {
      const unfeatured = projects.filter((p) => !p.featured);
      const toAdd = unfeatured.slice(0, 6 - featured.length);
      return [...featured, ...toAdd].slice(0, 6);
    }
    
    return featured.slice(0, 6);
  }, [projects]);

  return (
    <section className="section-y-compact border-b border-taupe/40">
      <div className="container-editorial">
        {showHeader && (
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
            <div>
              <p className="label-editorial">Selected Work</p>
              <h2 className="font-display mt-2 text-[clamp(1.375rem,4.5vw,3rem)] text-soft-black md:mt-4">
                Featured Portfolio
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
          className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 md:gap-x-6 lg:gap-x-8 ${showHeader ? "mt-6 md:mt-14" : ""}`}
        >
          {displayProjects.map((project, index) => (
            <PortfolioProjectCard
              key={project.slug}
              project={project}
              priority={index === 0}
              listName="home_featured"
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
