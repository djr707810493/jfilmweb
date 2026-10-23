import { AiFilmCta } from "@/components/ai-film/ai-film-cta";
import { AiFilmFaq } from "@/components/ai-film/ai-film-faq";
import { AiFilmHero } from "@/components/ai-film/ai-film-hero";
import { AiFilmIntro } from "@/components/ai-film/ai-film-intro";
import { AiFilmPricing } from "@/components/ai-film/ai-film-pricing";
import { AiFilmProcess } from "@/components/ai-film/ai-film-process";
import { AiFilmShowcase } from "@/components/ai-film/ai-film-showcase";
import { AiFilmUseCases } from "@/components/ai-film/ai-film-use-cases";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { aiFilmFaq, aiFilmHero, aiFilmPricing } from "@/data/ai-film";
import { siteConfig } from "@/data/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "AI Film | Turn Your Photos into a Movie You Can Relive",
  description:
    "AI Film turns your real photographs into a cinematic movie — and rebuilds the moments that were never captured. Human-edited, licensed soundtrack, delivered in 7–14 days.",
  path: "/ai-film",
  ogImage: "/og-ai-film.jpg",
});

function createAiFilmSchema() {
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteConfig.url}/ai-film#service`,
    name: "AI Film",
    serviceType: "AI-assisted cinematic photo film",
    description:
      "A cinematic film built from your own photographs, with AI-assisted motion and human editing — including the recreation of moments that were never photographed.",
    url: `${siteConfig.url}/ai-film`,
    image: new URL(aiFilmHero.image.src, siteConfig.url).toString(),
    provider: {
      "@type": "LocalBusiness",
      "@id": `${siteConfig.url}/#localbusiness`,
    },
    areaServed: siteConfig.address.addressLocality,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AI Film Packages",
      itemListElement: aiFilmPricing.packages.map((pkg, index) => ({
        "@type": "Offer",
        position: index + 1,
        name: pkg.name,
        description: pkg.tagline,
        price: pkg.price.replace(/[^0-9.]/g, ""),
        priceCurrency: "USD",
        url: `${siteConfig.url}/ai-film#pricing`,
      })),
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: aiFilmFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "AI Film",
        item: `${siteConfig.url}/ai-film`,
      },
    ],
  };

  return [service, faq, breadcrumb];
}

export default function AiFilmPage() {
  return (
    <>
      <SeoJsonLd data={createAiFilmSchema()} />

      <AiFilmHero />
      <AiFilmIntro />
      <AiFilmProcess />
      <AiFilmShowcase />
      <AiFilmUseCases />
      <AiFilmPricing />
      <AiFilmFaq />
      <AiFilmCta />
    </>
  );
}
