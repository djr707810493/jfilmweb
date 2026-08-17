import { PortfolioItemPageClient } from "@/components/portfolio/portfolio-item-page-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Portfolio Project",
  description: "Editorial wedding photography and film from J FILM STUDIO.",
  path: "/portfolio/item",
});

export default function PortfolioItemPage() {
  return <PortfolioItemPageClient />;
}
