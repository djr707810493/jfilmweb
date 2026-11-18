import { ContactSection } from "@/components/home/contact-section";
import { CoverageSection } from "@/components/home/coverage-section";
import { GoogleReviewsSection } from "@/components/home/google-reviews-section";
import { HeroSection } from "@/components/home/hero-section";
import { IntroSection } from "@/components/home/intro-section";
import { PortfolioGridSection } from "@/components/home/portfolio-grid-section";
import { ServicesSection } from "@/components/home/services-section";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { createHomePageSchema } from "@/lib/schema";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Utah Wedding Photographer & Videographer | Candid Documentary Film",
  description:
    "J FILM STUDIO — candid, documentary-style wedding photography and videography in Utah. Honest moments, true-to-color storytelling. Budget-friendly photo and film coverage for Park City, Salt Lake City, Moab, Zion, and beyond.",
  path: "/",
  ogImage: "/og-home.jpg",
});

export default async function HomePage() {
  const schema = await createHomePageSchema();

  return (
    <>
      <SeoJsonLd data={schema} />

      <HeroSection />
      <IntroSection />
      <PortfolioGridSection />
      <GoogleReviewsSection />
      <ServicesSection />
      <CoverageSection />
      <ContactSection />
    </>
  );
}
