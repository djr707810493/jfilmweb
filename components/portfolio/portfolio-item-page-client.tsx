"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PortfolioDetailView } from "@/components/portfolio/portfolio-detail-view";
import { usePortfolioProject } from "@/hooks/use-portfolio-projects";
import Link from "next/link";

function PortfolioItemContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const { project, loading } = usePortfolioProject(slug);

  if (!slug) {
    return (
      <div className="container-editorial section-y text-center">
        <p className="text-soft-black-muted">Project not found.</p>
        <Link href="/portfolio" className="label-editorial link-underline mt-4 inline-flex text-soft-black">
          Back to portfolio
        </Link>
      </div>
    );
  }

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
        <Link href="/portfolio" className="label-editorial link-underline mt-4 inline-flex text-soft-black">
          Back to portfolio
        </Link>
      </div>
    );
  }

  return <PortfolioDetailView project={project} />;
}

export function PortfolioItemPageClient() {
  return (
    <Suspense
      fallback={
        <div className="container-editorial section-y text-center text-sm text-soft-black-muted">
          Loading project…
        </div>
      }
    >
      <PortfolioItemContent />
    </Suspense>
  );
}
