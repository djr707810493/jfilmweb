import type { MetadataRoute } from "next";
import { getPublishedPortfolioProjects } from "@/lib/firebase/portfolio";
import { getPublishedWeddingStories } from "@/lib/firebase/story";
import { portfolioProjects as staticPortfolioProjects } from "@/data/portfolio";
import { weddingStories as staticWeddingStories } from "@/data/wedding-stories";
import { siteConfig } from "@/data/site";

export const dynamic = "force-static";

function absoluteUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/weddings`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/portfolio`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/ai-film`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  let portfolioData = staticPortfolioProjects;
  let storyData = staticWeddingStories;

  try {
    const remotePortfolio = await getPublishedPortfolioProjects();
    if (remotePortfolio && remotePortfolio.length > 0) {
      portfolioData = remotePortfolio as typeof staticPortfolioProjects;
    }
  } catch {
    console.warn("Failed to fetch remote portfolio for sitemap, using static fallback.");
  }

  try {
    const remoteStories = await getPublishedWeddingStories();
    if (remoteStories && remoteStories.length > 0) {
      storyData = remoteStories as typeof staticWeddingStories;
    }
  } catch {
    console.warn("Failed to fetch remote stories for sitemap, using static fallback.");
  }

  const portfolioRoutes: MetadataRoute.Sitemap = portfolioData.map((item) => {
    const cover = item.cover;
    return {
      url: `${siteConfig.url}/portfolio/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      ...(cover?.src ? { images: [absoluteUrl(cover.src)] } : {}),
    };
  });

  const weddingStoryRoutes: MetadataRoute.Sitemap = storyData.map((story) => {
    const images = [story.cover?.src, ...(story.gallery ?? []).map((img) => img.src)]
      .filter((src): src is string => Boolean(src))
      .map(absoluteUrl);

    return {
      url: `${siteConfig.url}/weddings/${story.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      ...(images.length > 0 ? { images } : {}),
    };
  });

  return [...staticRoutes, ...portfolioRoutes, ...weddingStoryRoutes];
}
