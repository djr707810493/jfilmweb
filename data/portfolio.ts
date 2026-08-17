import { placeholderImages } from "@/data/images";
import type { PortfolioProject } from "@/types/portfolio";

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "park-city-alpine",
    title: "Alpine Vows",
    description:
      "An editorial wedding among Park City evergreens — golden light, quiet vows, and true-to-color film stills.",
    location: "Park City",
    category: "wedding",
    year: "2025",
    featured: true,
    cover: {
      type: "image",
      src: placeholderImages.coupleMountainEmbrace,
      alt: "Park City wedding couple portrait among mountain evergreens",
      width: 1600,
      height: 2000,
    },
    media: [
      {
        type: "image",
        src: placeholderImages.coupleMountainEmbrace,
        alt: "Park City wedding couple embrace in alpine meadow",
        width: 1600,
        height: 2000,
      },
      {
        type: "video",
        src: "",
        poster: placeholderImages.heroMountainWedding,
        alt: "Park City alpine wedding highlight film",
        title: "Alpine Vows — Highlight Film",
        duration: "1:12",
      },
      {
        type: "image",
        src: placeholderImages.brideGroomMountain,
        alt: "Park City bride and groom portrait in natural light",
        width: 1200,
        height: 1800,
      },
      {
        type: "image",
        src: placeholderImages.ceremonyAisle,
        alt: "Mountain wedding ceremony aisle with natural florals",
        width: 1800,
        height: 1200,
      },
    ],
  },
  {
    slug: "moab-desert",
    title: "Desert Horizon",
    description:
      "Red rock silhouettes and desert silence for an intimate Moab elopement at last light.",
    location: "Moab",
    category: "elopement",
    year: "2025",
    cover: {
      type: "image",
      src: placeholderImages.desertCanyon,
      alt: "Moab elopement couple against Utah desert red rock formations",
      width: 1600,
      height: 1200,
    },
    media: [
      {
        type: "image",
        src: placeholderImages.desertCanyon,
        alt: "Moab desert elopement couple at canyon overlook",
        width: 1600,
        height: 1200,
      },
      {
        type: "image",
        src: placeholderImages.coupleOutdoor,
        alt: "Utah desert couple portrait at sunset",
        width: 1600,
        height: 2000,
      },
    ],
  },
  {
    slug: "zion-ceremony",
    title: "Red Rock Ceremony",
    description:
      "An intimate Zion ceremony framed by canyon stone — documentary coverage with editorial restraint.",
    location: "Zion",
    category: "wedding",
    year: "2024",
    cover: {
      type: "video",
      src: "",
      poster: placeholderImages.weddingCouple,
      alt: "Zion wedding ceremony highlight film",
      title: "Red Rock Ceremony — Film",
      duration: "0:58",
    },
    media: [
      {
        type: "video",
        src: "",
        poster: placeholderImages.weddingCouple,
        alt: "Zion wedding ceremony highlight film",
        duration: "0:58",
      },
      {
        type: "image",
        src: placeholderImages.weddingCouple,
        alt: "Zion wedding couple during outdoor ceremony",
        width: 1800,
        height: 1125,
      },
      {
        type: "image",
        src: placeholderImages.forestTrail,
        alt: "Zion canyon landscape at golden hour",
        width: 1600,
        height: 1200,
      },
    ],
  },
  {
    slug: "detail-flat-lay",
    title: "The Details",
    description:
      "Invitation suites, rings, and quiet still lifes — the texture of a wedding day in true color.",
    location: "Salt Lake City",
    category: "editorial",
    year: "2025",
    cover: {
      type: "image",
      src: placeholderImages.weddingRings,
      alt: "Wedding detail flat lay with invitation suite and rings",
      width: 1200,
      height: 1200,
    },
    media: [
      {
        type: "image",
        src: placeholderImages.weddingRings,
        alt: "Wedding rings and invitation flat lay",
        width: 1200,
        height: 1200,
      },
      {
        type: "image",
        src: placeholderImages.bridePortrait,
        alt: "Editorial bride portrait with natural window light",
        width: 1200,
        height: 1800,
      },
    ],
  },
  {
    slug: "reception-celebration",
    title: "After Dark",
    description:
      "Reception energy captured on film and flash — honest celebration, never staged.",
    location: "Park City",
    category: "film",
    year: "2024",
    cover: {
      type: "video",
      src: "",
      poster: placeholderImages.receptionCelebration,
      alt: "Wedding reception celebration highlight film",
      title: "After Dark — Reception Film",
      duration: "1:30",
    },
    media: [
      {
        type: "video",
        src: "",
        poster: placeholderImages.receptionCelebration,
        alt: "Wedding reception celebration highlight film",
        duration: "1:30",
      },
      {
        type: "image",
        src: placeholderImages.receptionCelebration,
        alt: "Black and white wedding reception flash photography",
        width: 1800,
        height: 1200,
      },
    ],
  },
  {
    slug: "film-process",
    title: "On Film",
    description:
      "Medium-format film paired with digital — texture, grain, and the craft behind every gallery.",
    location: "Studio",
    category: "film",
    year: "2025",
    cover: {
      type: "image",
      src: placeholderImages.filmCamera,
      alt: "Film camera used for wedding photography",
      width: 1200,
      height: 1600,
    },
    media: [
      {
        type: "image",
        src: placeholderImages.filmCamera,
        alt: "Medium-format film camera on set",
        width: 1200,
        height: 1600,
      },
      {
        type: "video",
        src: "",
        poster: placeholderImages.editorialPortrait,
        alt: "Behind the scenes film photography process",
        duration: "0:42",
      },
      {
        type: "image",
        src: placeholderImages.editorialPortrait,
        alt: "Editorial portrait shot on film",
        width: 1200,
        height: 1800,
      },
    ],
  },
  {
    slug: "ceremony-aisle",
    title: "The Aisle",
    description:
      "Processional light, floral architecture, and the hush before vows begin.",
    location: "Park City",
    category: "wedding",
    year: "2025",
    cover: {
      type: "image",
      src: placeholderImages.ceremonyAisle,
      alt: "Elegant wedding ceremony aisle with natural floral arrangements",
      width: 2100,
      height: 900,
    },
    media: [
      {
        type: "image",
        src: placeholderImages.ceremonyAisle,
        alt: "Wedding ceremony aisle with florals and mountain views",
        width: 2100,
        height: 900,
      },
      {
        type: "image",
        src: placeholderImages.mistyMountains,
        alt: "Park City mountain landscape at ceremony golden hour",
        width: 1800,
        height: 1200,
      },
    ],
  },
];

export function getFeaturedPortfolioProjects(): PortfolioProject[] {
  return portfolioProjects.filter((project) => project.featured);
}

export function getPortfolioProjectBySlug(slug: string) {
  return portfolioProjects.find((project) => project.slug === slug);
}

export function getAllPortfolioProjectSlugs() {
  return portfolioProjects.map((project) => project.slug);
}

export function projectHasVideo(project: {
  media: PortfolioProject["media"];
  cover: PortfolioProject["cover"];
}) {
  return (
    project.cover.type === "video" ||
    project.media.some((item) => item.type === "video")
  );
}

/** @deprecated Use portfolioProjects */
export const portfolioItems = portfolioProjects.map((project) => ({
  slug: project.slug,
  title: project.title,
  description: project.description,
  location: project.location,
  category: project.category as "wedding",
  featured: project.featured,
  publishedAt: `${project.year}-01-01`,
  images: project.media
    .filter((item) => item.type === "image")
    .map((item) => ({
      src: item.src,
      alt: item.alt,
      title: item.title ?? project.title,
      width: item.width,
      height: item.height,
    })),
}));

/** @deprecated Use getFeaturedPortfolioProjects */
export function getFeaturedPortfolioItems() {
  return portfolioItems.filter((item) => item.featured);
}
