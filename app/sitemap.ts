import type { MetadataRoute } from "next";
import { getPublishedPortfolioProjects } from "@/lib/firebase/portfolio";
import { getPublishedWeddingStories } from "@/lib/firebase/story";
import { portfolioProjects as staticPortfolioProjects } from "@/data/portfolio";
import { weddingStories as staticWeddingStories } from "@/data/wedding-stories";
import { siteConfig } from "@/data/site";

export const dynamic = "force-static";

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
      portfolioData = remotePortfolio as any;
    }
  } catch (err) {
    console.warn("Failed to fetch remote portfolio for sitemap, using static fallback.");
  }

  try {
    const remoteStories = await getPublishedWeddingStories();
    if (remoteStories && remoteStories.length > 0) {
      storyData = remoteStories as any;
    }
  } catch (err) {
    console.warn("Failed to fetch remote stories for sitemap, using static fallback.");
  }

  const portfolioRoutes: MetadataRoute.Sitemap = portfolioData.map(
    (item: any) => ({
      // Update to match the current routing used in project cards:
      url: `${siteConfig.url}/portfolio/item/?slug=${item.slug}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  const weddingStoryRoutes: MetadataRoute.Sitemap = storyData.map(
    (story: any) => ({
      url: `${siteConfig.url}/weddings/${story.slug}`,
      lastModified: story.updatedAt || new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  return [...staticRoutes, ...portfolioRoutes, ...weddingStoryRoutes];
}
