import { siteConfig } from "@/data/site";
import { ogImagePath } from "@/lib/seo";

type SchemaGraph = Record<string, unknown>;

export function createLocalBusinessSchema(): SchemaGraph {
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
    sameAs: Object.values(siteConfig.social),
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
    areaServed: siteConfig.address.addressLocality,
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

export function createHomePageSchema(): SchemaGraph[] {
  return [
    createLocalBusinessSchema(),
    createProfessionalServiceSchema(),
    createWebsiteSchema(),
  ];
}
