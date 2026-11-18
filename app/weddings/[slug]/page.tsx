import { WeddingStoryPageClient } from "@/components/weddings/wedding-story-page-client";
import { SeoJsonLd } from "@/components/seo-json-ld";
import {
  getAllWeddingStorySlugs,
  getWeddingStoryBySlug,
} from "@/data/wedding-stories";
import { siteConfig } from "@/data/site";
import {
  createBreadcrumbListSchema,
  createImageObjectSchema,
} from "@/lib/schema";
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

function createStorySchema(slug: string) {
  const story = getWeddingStoryBySlug(slug);
  if (!story) return null;

  return [
    createBreadcrumbListSchema([
      { label: "Home", href: "/" },
      { label: "Stories", href: "/weddings" },
      { label: `${story.couple} — ${story.title}`, href: `/weddings/${story.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${story.couple} — ${story.title}`,
      description: story.excerpt,
      image: createImageObjectSchema({
        src: story.cover.src,
        alt: story.cover.alt,
      }),
      articleBody: story.story.join("\n\n"),
      contentLocation: {
        "@type": "Place",
        name: story.location,
      },
      author: {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#localbusiness`,
      },
    },
    ...story.gallery.map((image) =>
      createImageObjectSchema({ src: image.src, alt: image.alt }),
    ),
  ];
}

export default async function WeddingStoryPage({ params }: WeddingStoryPageProps) {
  const { slug } = await params;
  const schema = createStorySchema(slug);

  return (
    <>
      {schema ? <SeoJsonLd data={schema} /> : null}
      <WeddingStoryPageClient slug={slug} />
    </>
  );
}
