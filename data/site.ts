export const siteConfig = {
  name: "J FILM STUDIO",
  tagline: "Candid moments. Documentary heart. Budget-friendly coverage.",
  description:
    "Budget-friendly candid wedding photography and videography in Utah. Documentary-style storytelling for Park City, Salt Lake City, Moab, Zion, and beyond.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  locale: "en_US",
  email: "djr707810493@gmail.com",
  phone: "+1 (808) 670-6676",
  phoneSecondary: "+1 (385) 473-7445",
  address: {
    streetAddress: "",
    addressLocality: "Lehi",
    addressRegion: "UT",
    postalCode: "84045",
    addressCountry: "US",
  },
  social: {
    instagram: "https://www.instagram.com/jfilm_studio_usa/",
  },
  nav: [
    { label: "Weddings", href: "/weddings" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "AI Film", href: "/ai-film" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/#contact" },
  ],
  services: [
    {
      title: "Photo or Video",
      description:
        "Photography or a wedding film with one artist. Focused, documentary coverage for a lighter budget.",
    },
    {
      title: "Photo + Video, One Operator",
      description:
        "Stills and film from the same artist — both stories, one calm presence, and the most accessible way to have photo and video.",
    },
    {
      title: "Photo + Video, Two Operators",
      description:
        "A dedicated photographer and videographer working together so ceremony, vows, and reception are never split between cameras.",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
