"use client";

import Link from "next/link";
import { PortfolioDetailView } from "@/components/portfolio/portfolio-detail-view";
import { usePortfolioProject } from "@/hooks/use-portfolio-projects";

export function PortfolioDetailPageClient({ slug }: { slug: string }) {
  const { project, loading } = usePortfolioProject(slug);

  if (loading) {
    return (
      <div className="container-editorial section-y text-center text-sm text-soft-black-muted">
        Loading project…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container-editorial section-y text-center">
        <p className="text-soft-black-muted">This project could not be found.</p>
        <Link
          href="/portfolio"
          className="label-editorial link-underline mt-4 inline-flex text-soft-black"
        >
          Back to portfolio
        </Link>
      </div>
    );
  }

  return <PortfolioDetailView project={project} />;
}
