import { PortfolioDetailPageClient } from "@/components/portfolio/portfolio-detail-page-client";
import { getAllPortfolioSlugs, getPortfolioItemBySlug } from "@/data/portfolio-slugs";
import { createPageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPortfolioSlugs().map((slug) => ({ slug }));
}

type PortfolioDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PortfolioDetailPageProps) {
  const { slug } = await params;
  const project = getPortfolioItemBySlug(slug);

  if (!project) {
    return createPageMetadata({
      title: "Project Not Found",
      description: "The requested portfolio project could not be found.",
      path: `/portfolio/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${project.title} | ${project.location} Wedding Photography`,
    description: project.description,
    path: `/portfolio/${slug}`,
    ogImage: project.cover.src,
  });
}

export default async function PortfolioDetailPage({
  params,
}: PortfolioDetailPageProps) {
  const { slug } = await params;

  return <PortfolioDetailPageClient slug={slug} />;
}
