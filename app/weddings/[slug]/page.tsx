import { WeddingStoryPageClient } from "@/components/weddings/wedding-story-page-client";
import {
  getAllWeddingStorySlugs,
  getWeddingStoryBySlug,
} from "@/data/wedding-stories";
import { createPageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllWeddingStorySlugs().map((slug) => ({ slug }));
}

type WeddingStoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: WeddingStoryPageProps) {
  const { slug } = await params;
  const story = getWeddingStoryBySlug(slug);

  if (!story) {
    return createPageMetadata({
      title: "Story Not Found",
      description: "The requested wedding story could not be found.",
      path: `/weddings/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${story.couple} — ${story.title} | ${story.location} Wedding Photographer`,
    description: story.excerpt,
    path: `/weddings/${story.slug}`,
    ogImage: story.cover.src,
  });
}

export default async function WeddingStoryPage({ params }: WeddingStoryPageProps) {
  const { slug } = await params;

  return <WeddingStoryPageClient slug={slug} />;
}
