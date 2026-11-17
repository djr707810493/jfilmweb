import { placeholderImages } from "@/data/images";

export const heroContent = {
  label: "J FILM STUDIO",
  headline: "Weddings, by heart.",
  subheadline:
    "Utah wedding photography and candid documentary videography. Honest moments, true-to-color storytelling — photo and film coverage for Park City, Salt Lake City, Moab, Zion, and beyond.",
  cta: [
    { id: "portfolio", label: "View Portfolio", href: "/portfolio", style: "primary" as const },
    { id: "contact", label: "Inquire About Your Date", href: "#contact", style: "secondary" as const },
  ],
  image: {
    alt: "Bride and groom holding hands from a vintage convertible, seen from above",
    width: 1672,
    height: 941,
    mobile: "/images/hero/wedding-convertible-mobile.webp",
    tablet: "/images/hero/wedding-convertible-tablet.webp",
    desktop: "/images/hero/wedding-convertible-desktop.webp",
    fallback: "/images/hero/wedding-convertible-desktop.webp",
  },
} as const;

export const aiFilmHeroSlide = {
  src: "/images/ai-film/hero-banner.webp",
  alt: "Couple at golden hour with a temple on the horizon and a film strip of wedding memories",
  label: "AI Film · New Service",
  headline: "Your Photos. A Movie to Relive.",
  body: "Even if the best moments went unphotographed, we can bring them back — your real photographs, turned into a cinematic film.",
  buttons: [
    { id: "ai-film-explore", label: "Explore AI Film", href: "/ai-film", style: "primary" as const },
    { id: "ai-film-process", label: "See How It Works", href: "/ai-film#process", style: "secondary" as const },
  ],
} as const;

export const introContent = {
  label: "The Studio",
  heading: "Photography that honors the day as it was — not as a template.",
  body: [
    "J FILM STUDIO is a Utah-based wedding photography practice rooted in editorial composition and documentary instinct. We work quietly, observe carefully, and deliver galleries that feel calm, honest, and unmistakably yours.",
    "From alpine ceremonies in Park City to desert vows in Moab, every frame is guided by natural light, true color, and the belief that the most lasting images are the ones you didn't pose for.",
  ],
  image: {
    src: "/images/hero/studio-portrait.webp",
    alt: "Bride and groom signing their marriage certificate at an outdoor table",
    width: 806,
    height: 1000,
  },
} as const;

export const portfolioGrid = [
  {
    slug: "park-city-alpine",
    title: "Alpine Vows",
    location: "Park City",
    src: placeholderImages.coupleMountainEmbrace,
    alt: "Park City wedding couple portrait among mountain evergreens",
    span: "lg:col-span-7 lg:row-span-2",
    aspect: "aspect-[4/5] lg:aspect-auto lg:h-full",
  },
  {
    slug: "moab-desert",
    title: "Desert Horizon",
    location: "Moab",
    src: placeholderImages.desertCanyon,
    alt: "Moab wedding elopement couple against Utah desert red rock formations",
    span: "lg:col-span-5",
    aspect: "aspect-[4/3]",
  },
  {
    slug: "detail-flat-lay",
    title: "The Details",
    location: "Salt Lake City",
    src: placeholderImages.weddingRings,
    alt: "Wedding detail flat lay with invitation suite and rings in true color",
    span: "lg:col-span-4",
    aspect: "aspect-square",
  },
  {
    slug: "zion-ceremony",
    title: "Red Rock Ceremony",
    location: "Zion",
    src: placeholderImages.weddingCouple,
    alt: "Zion wedding couple during an intimate outdoor ceremony",
    span: "lg:col-span-8",
    aspect: "aspect-[16/10]",
  },
  {
    slug: "film-process",
    title: "On Film",
    location: "Behind the Lens",
    src: placeholderImages.filmCamera,
    alt: "Film camera used for wedding photography",
    span: "lg:col-span-4",
    aspect: "aspect-[3/4]",
  },
  {
    slug: "ceremony-aisle",
    title: "The Aisle",
    location: "Park City",
    src: placeholderImages.ceremonyAisle,
    alt: "Elegant wedding ceremony aisle with natural floral arrangements",
    span: "lg:col-span-8",
    aspect: "aspect-[16/9]",
  },
] as const;

export const coverageContent = {
  label: "Coverage",
  heading: "Photo, film, both — or a film from the photos you already have.",
  body: "The storytelling stays the same. What changes is who is there: one artist, an artist doing both, a full two-person crew, or no shoot at all. You don't have to stretch — we have a fit.",
} as const;

export const coverageOptions = [
  {
    id: "photo-or-video",
    number: "01",
    budgetLabel: "Focused budget",
    title: "Photo or Video",
    crew: "One artist · one medium",
    operators: 1,
    featured: false,
    description:
      "Choose photography or a wedding film. One medium, fully documented — calm, documentary coverage without stretching the day.",
    includes: [
      "Photography or a wedding film",
      "One artist, undivided attention",
      "True-to-color gallery or film",
    ],
  },
  {
    id: "photo-video-one-operator",
    number: "02",
    budgetLabel: "Balanced budget",
    title: "Photo + Video",
    crew: "One operator",
    operators: 1,
    featured: true,
    description:
      "Stills and film from the same artist. One calm presence, both stories — the most requested way to have photo and video without a full crew.",
    includes: [
      "Photography and a wedding film",
      "One artist covering both",
      "Best value for photo + video",
    ],
  },
  {
    id: "photo-video-two-operators",
    number: "03",
    budgetLabel: "Full-coverage budget",
    title: "Photo + Video",
    crew: "Two operators",
    operators: 2,
    featured: false,
    description:
      "A dedicated photographer and a dedicated videographer. Simultaneous stills and film, so ceremony, vows, and reception are never split between cameras.",
    includes: [
      "Dedicated photographer + videographer",
      "Photo and film at the same time",
      "Nothing missed when both happen at once",
    ],
  },
  {
    id: "ai-film",
    number: "04",
    budgetLabel: "From $149",
    title: "AI Film",
    crew: "No shoot required",
    operators: 0,
    featured: false,
    badge: "New service",
    description:
      "Already have the photos? We turn your gallery into a short cinematic film — and rebuild the moments nobody managed to photograph.",
    includes: [
      "Works from an existing gallery or phone photos",
      "Motion, depth & a licensed soundtrack",
      "Delivered in 7–14 days",
    ],
    href: "/ai-film",
    cta: "Explore AI Film",
  },
] as const;

export const experienceSteps = [
  {
    number: "01",
    title: "Discovery",
    description:
      "We begin with a conversation about your vision, locations, and the feeling you want your images to carry.",
  },
  {
    number: "02",
    title: "Planning",
    description:
      "Timeline guidance, location scouting notes, and a clear outline so wedding day feels effortless and unhurried.",
  },
  {
    number: "03",
    title: "Wedding Day",
    description:
      "Quiet, observant coverage — editorial when it matters, documentary everywhere else. No performance, no pressure.",
  },
  {
    number: "04",
    title: "Your Gallery",
    description:
      "A curated, true-to-color collection delivered within six weeks. Film scans and digital files, thoughtfully edited.",
  },
] as const;

export const ctaContent = {
  label: "Inquire",
  heading: "Let's create something honest, beautiful, and entirely yours.",
  body: "Tell us about your date, your location, and what matters most. We accept a limited number of weddings each year.",
  image: {
    src: placeholderImages.receptionCelebration,
    alt: "Black and white wedding reception flash party photography",
    width: 2400,
    height: 1400,
  },
} as const;
