import { siteConfig } from "@/data/site";
import { manualGoogleReviews } from "@/data/google-reviews";
import { ogImagePath } from "@/lib/seo";
import { getPublishedPortfolioProjects } from "@/lib/firebase/portfolio";
import { createVideoObjectSchema, parseDurationToIso } from "@/lib/schema-video";
import type { PortfolioProject } from "@/types/portfolio";

type SchemaGraph = Record<string, unknown>;

const CITIES = [
  "Park City",
  "Salt Lake City",
  "Moab",
  "Zion National Park",
  "Lehi",
  "Provo",
  "Heber Valley",
  "Ogden",
];

function cityNode(name: string): SchemaGraph {
  return { "@type": "City", "name": name };
}

export function createLocalBusinessSchema({
  aggregateRating,
  reviews,
}: {
  aggregateRating?: SchemaGraph;
  reviews?: SchemaGraph[];
} = {}): SchemaGraph {
  const { address, phone, email, url, name, description } = siteConfig;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}/#localbusiness`,
    name,
    description,
    url,
    email,
    telephone: phone,
    image: `${url}${ogImagePath}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry,
    },
    areaServed: CITIES.map(cityNode),
    sameAs: Object.values(siteConfig.social),
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(reviews ? { review: reviews } : {}),
  };
}

export function createAggregateRatingSchema(reviews: { rating: number }[]): SchemaGraph {
  const count = reviews.length;
  const average =
    count > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0;

  return {
    "@type": "AggregateRating",
    ratingValue: average,
    bestRating: 5,
    worstRating: 1,
    ratingCount: count,
    reviewCount: count,
  };
}

export function createReviewSchema(review: {
  id?: string;
  author: string;
  rating: number;
  text: string;
  publishedAt?: string;
  photoUrl?: string | null;
  reviewUrl?: string | null;
}): SchemaGraph {
  return {
    "@type": "Review",
    "@id": `${siteConfig.url}/#review-${review.id ?? review.author.replace(/\s+/g, "-").toLowerCase()}`,
    author: {
      "@type": "Person",
      name: review.author,
      ...(review.photoUrl ? { image: `${siteConfig.url}${review.photoUrl}` } : {}),
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.text,
    ...(review.publishedAt ? { datePublished: review.publishedAt } : {}),
    publisher: { "@type": "LocalBusiness", "@id": `${siteConfig.url}/#localbusiness` },
    ...(review.reviewUrl ? { url: review.reviewUrl } : {}),
  };
}

export function createProfessionalServiceSchema(): SchemaGraph {
  const { url, name, description, services } = siteConfig;

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${url}/#professionalservice`,
    name,
    description,
    url,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${url}/#localbusiness`,
    },
    areaServed: CITIES.map(cityNode),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Photography Services",
      itemListElement: services.map((service, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.description,
        },
      })),
    },
  };
}

export function createWebsiteSchema(): SchemaGraph {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#localbusiness`,
    },
  };
}

export async function createVideoObjectSchemas(): Promise<SchemaGraph[]> {
  let projects: PortfolioProject[];
  try {
    projects = await getPublishedPortfolioProjects();
  } catch {
    return [];
  }

  const videos: SchemaGraph[] = [];
  for (const project of projects) {
    for (const media of project.media) {
      if (media.type !== "video" || !media.src) continue;
      videos.push(
        createVideoObjectSchema({
          id: `${project.slug}-${videos.length}`,
          name: media.title ?? project.title,
          description: media.alt ?? project.description,
          embedUrl: media.src,
          thumbnailUrl: media.poster ? `${siteConfig.url}${media.poster}` : undefined,
          uploadDate: project.year ? `${project.year}-01-01` : undefined,
          duration: parseDurationToIso(media.duration) || undefined,
        }),
      );
    }
  }
  return videos;
}

export function createBreadcrumbListSchema(items: { label: string; href: string }[]): SchemaGraph {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${siteConfig.url}${item.href}`,
    })),
  };
}

export function createImageObjectSchema({
  src,
  alt,
}: { src: string; alt: string }): SchemaGraph {
  return {
    "@type": "ImageObject",
    url: `${siteConfig.url}${src}`,
    ...(alt ? { caption: alt } : {}),
  };
}

export async function createHomePageSchema(): Promise<SchemaGraph[]> {
  const videos = await createVideoObjectSchemas();
  const aggregateRating = createAggregateRatingSchema(manualGoogleReviews);
  const reviews = manualGoogleReviews.map(createReviewSchema);

  return [
    createLocalBusinessSchema({ aggregateRating, reviews }),
    createProfessionalServiceSchema(),
    createWebsiteSchema(),
    ...videos,
  ];
}
