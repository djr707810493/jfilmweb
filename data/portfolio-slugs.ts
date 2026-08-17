import {
  getAllPortfolioProjectSlugs,
  getPortfolioProjectBySlug,
} from "@/data/portfolio";

export function getAllPortfolioSlugs(): string[] {
  return getAllPortfolioProjectSlugs();
}

export function getPortfolioItemBySlug(slug: string) {
  return getPortfolioProjectBySlug(slug);
}
