import { ContactSection } from "@/components/home/contact-section";
import { CoverageSection } from "@/components/home/coverage-section";
import { HeroSection } from "@/components/home/hero-section";
import { IntroSection } from "@/components/home/intro-section";
import { PortfolioGridSection } from "@/components/home/portfolio-grid-section";
import { ServicesSection } from "@/components/home/services-section";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { createHomePageSchema } from "@/lib/schema";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Utah Budget-Friendly Documentary-Style Wedding Photo & Video",
  description:
    "J FILM STUDIO — candid, documentary-style wedding photography and videography in Utah. Real moments, true-to-color storytelling, photo + film coverage that stays budget-friendly. Park City, Salt Lake City, Moab, Zion & beyond.",
  path: "/",
  ogImage: "/og-home.jpg",
});

export default function HomePage() {
  return (
    <>
      <SeoJsonLd data={createHomePageSchema()} />

      <HeroSection />
      <IntroSection />
      <PortfolioGridSection />
      <CoverageSection />
      <ServicesSection />
      <ContactSection />
    </>
  );
}
