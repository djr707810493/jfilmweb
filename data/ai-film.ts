import { aiFilmImages, placeholderImages } from "@/data/images";

export const aiFilmHero = {
  label: "AI Film · New Service",
  headline: "Your Photos. A Movie to Relive.",
  subtitle:
    "Even if the best moments weren’t captured, we can bring them back.",
  aside: {
    title: "More Than Photos",
    caption: "A story that lives on",
  },
  image: {
    src: aiFilmImages.heroBanner,
    alt: "Couple embracing at golden hour, with a temple on the horizon and a film strip of wedding memories curling past the camera",
  },
  actions: [
    { label: "See how it works", href: "#process", variant: "primary" as const },
    { label: "View pricing", href: "#pricing", variant: "secondary" as const },
  ],
  highlights: [
    "Turn photos into a film",
    "Your love story",
    "Recreate missed moments",
    "The emotions that last forever",
  ],
} as const;

export const aiFilmIntro = {
  label: "What Is AI Film",
  heading: "The moments you have. The moments you missed.",
  body: [
    "You already own thousands of moments — a wedding gallery, an engagement session, a family archive. AI Film is a service that takes those still photographs and gives them cinematic life: soft parallax, subtle depth, drifting light, and a score that carries the emotion.",
    "It is not a replacement for the photography you hired us for. It is a second life for it — a short, shareable film made from pictures that were already worth keeping. And when something that mattered went unphotographed — the first look, the vow, the dance no one was filming — we can rebuild it from the images you do have, so the moments that got away still make it into the story.",
  ],
  image: {
    src: aiFilmImages.whatIsAiFilm,
    alt: "J FILM STUDIO AI Film process diagram: your photos become a consistent AI character, then storyboarded scenes, then a finished film",
  },
  points: [
    {
      title: "Your photos, and the moments you missed",
      description:
        "Every film starts from your own images. When something important went unphotographed, we rebuild it from the photos you have — your faces, your venue, your story — instead of inventing strangers.",
    },
    {
      title: "Human-edited, AI-assisted",
      description:
        "AI handles the motion and depth. A real editor chooses the story, pacing, color, and soundtrack.",
    },
    {
      title: "Made to share",
      description:
        "Delivered in landscape and vertical cuts — ready for your gallery, a screen at the reception, or social.",
    },
  ],
} as const;

export const aiFilmProcess = {
  label: "The Process",
  heading: "From photo library to finished film.",
  body: "A simple, guided path. You send the photos you love — we handle the rest, from story to sound.",
  steps: [
    {
      number: "01",
      title: "Your photos",
      description:
        "Share the photos you love — a gallery link, a phone album, or scans of older prints. We help you choose the strongest ones and the moments worth rebuilding.",
    },
    {
      number: "02",
      title: "AI character design",
      description:
        "We build consistent, realistic characters from your photographs: the same faces, hair, and wardrobe in every scene, so the film reads as you — not a stranger who resembles you.",
    },
    {
      number: "03",
      title: "Storyboarding",
      description:
        "We design the key scenes and visuals that tell your story and share the board before a single frame moves. Every new scene is approved before it is rendered.",
    },
    {
      number: "04",
      title: "Your AI film",
      description:
        "AI builds the motion, depth, and light; a human editor colors, paces, and scores it. You review the first cut, request revisions, and receive the finished film in 4K — landscape and vertical.",
    },
  ],
} as const;

export const aiFilmShowcase = {
  label: "Selected Films",
  heading: "AI Films in the making.",
  body: "Our first AI Film collection is being finished now. The frames below are placeholders — a preview of the formats and moods to come.",
  films: [
    {
      id: "alpine-vows",
      title: "Alpine Vows",
      subtitle: "Wedding highlight · 90 sec",
      poster: placeholderImages.brideGroomMountain,
      alt: "Mountain wedding couple portrait in a placeholder AI film card",
      tag: "Wedding",
      duration: "01:30",
    },
    {
      id: "desert-horizon",
      title: "Desert Horizon",
      subtitle: "Elopement film · 60 sec",
      poster: placeholderImages.desertCanyon,
      alt: "Desert elopement couple in a placeholder AI film card",
      tag: "Elopement",
      duration: "01:00",
    },
    {
      id: "the-details",
      title: "The Details",
      subtitle: "Anniversary reel · 45 sec",
      poster: placeholderImages.weddingRings,
      alt: "Wedding detail flat lay in a placeholder AI film card",
      tag: "Details",
      duration: "00:45",
    },
    {
      id: "last-dance",
      title: "Last Dance",
      subtitle: "Reception film · 75 sec",
      poster: placeholderImages.receptionCelebration,
      alt: "Reception celebration in a placeholder AI film card",
      tag: "Reception",
      duration: "01:15",
    },
  ],
} as const;

export const aiFilmUseCases = {
  label: "Where It Fits",
  heading: "One gallery in. A film out.",
  body: "AI Film works wherever you already have beautiful stills. These are the moments clients ask for most.",
  cases: [
    {
      id: "weddings",
      number: "01",
      title: "Weddings & Elopements",
      description:
        "Turn your full gallery into a shareable highlight film — a cinematic keepsake for the couple and for family who couldn't be there.",
    },
    {
      id: "couples",
      number: "02",
      title: "Engagements & Couples",
      description:
        "A moving portrait for announcements, save-the-dates, or simply a quiet anniversary surprise.",
    },
    {
      id: "milestones",
      number: "03",
      title: "Anniversaries & Milestones",
      description:
        "Revisit the years in motion — from first portraits to the life built since, woven into one continuous story.",
    },
    {
      id: "heritage",
      number: "04",
      title: "Family & Heritage",
      description:
        "Give older family photographs new life and preserve a legacy as a film the next generation can watch.",
    },
    {
      id: "memorials",
      number: "05",
      title: "Memorials & Tributes",
      description:
        "A gentle, lasting remembrance built from the photographs that meant the most to the people who loved them.",
    },
    {
      id: "brands",
      number: "06",
      title: "Brands & Social",
      description:
        "Scroll-stopping motion from your product or lifestyle stills — ideal for feeds, websites, and seasonal campaigns.",
    },
  ],
} as const;

export const aiFilmPricing = {
  label: "Pricing",
  heading: "Simple packages, finished by hand.",
  body: "Introductory pricing while we build our AI Film collection. Every package includes story direction, color grading, and a licensed soundtrack.",
  meta: [
    "Delivered in 7–14 days",
    "Human-edited, AI-assisted",
    "Landscape + vertical versions",
  ],
  note: "Prices are in USD and reflect introductory rates. Final quote depends on photo count, film length, and revisions. Existing J FILM STUDIO clients receive a loyalty discount.",
  packages: [
    {
      id: "reel",
      name: "The Reel",
      price: "$149",
      compareAt: "$447",
      priceNote: "one-time",
      tagline: "A short, shareable moment.",
      featured: false,
      features: [
        "20–30 second cinematic film",
        "Up to 15 photographs",
        "Standard depth & parallax motion",
        "Licensed soundtrack",
        "1080p landscape + vertical cuts",
        "One revision round",
      ],
      cta: "Start with The Reel",
    },
    {
      id: "story",
      name: "The Story",
      price: "$299",
      compareAt: "$897",
      priceNote: "one-time",
      tagline: "A fuller narrative arc.",
      featured: true,
      features: [
        "60–90 second cinematic film",
        "Up to 40 photographs",
        "Advanced motion, depth & light",
        "Custom story pacing & title cards",
        "4K landscape + vertical cuts",
        "Two revision rounds",
      ],
      cta: "Choose The Story",
    },
    {
      id: "feature",
      name: "The Feature",
      price: "$599",
      compareAt: "$1,797",
      priceNote: "one-time",
      tagline: "A complete, gallery-ready film.",
      featured: false,
      features: [
        "2–3 minute cinematic film",
        "Up to 100 photographs + existing video clips",
        "Full storyboard & scene direction",
        "Optional voiceover integration",
        "4K master + social cutdowns",
        "Three revision rounds",
      ],
      cta: "Choose The Feature",
    },
  ],
} as const;

export const aiFilmFaq = [
  {
    question: "What exactly is an AI Film?",
    answer:
      "An AI Film is a short cinematic video built from your own still photographs. Using AI-assisted animation, we add gentle camera movement, depth, and shifting light, then a human editor shapes the pacing, color, and soundtrack into a finished film.",
  },
  {
    question: "Will it still look like my photos?",
    answer:
      "Yes. Your photographs are the source material — the motion, depth, and light are applied to the real images you send, so faces, details, and places stay true to the originals. When we recreate a moment that wasn't photographed, we build it from your existing photos and keep your real faces and locations rather than inventing new ones.",
  },
  {
    question: "Can you recreate a moment that was never photographed?",
    answer:
      "That's one of the reasons AI Film exists. If the first look, the vows, or a dance went unrecorded, we can reconstruct it from the photos you do have — the same people, the same venue, the same light — and place it inside the film where it belongs. Tell us which moment you wish you had, and we'll show you what's possible before you commit.",
  },
  {
    question: "Can I use phone photos or older family scans?",
    answer:
      "Absolutely. We work with high-resolution galleries, phone photos, and scanned family prints. Lower-resolution or damaged images may limit how much motion we can add, but we'll always tell you what's possible before we begin.",
  },
  {
    question: "How long does it take?",
    answer:
      "Most films are delivered within 7–14 days depending on the package, photo count, and revision rounds. Larger Feature films with custom voiceover may take slightly longer — we'll confirm a timeline when you book.",
  },
  {
    question: "Can I choose the music?",
    answer:
      "Every package includes a licensed soundtrack. If you have a specific song in mind, share it — we'll let you know whether it can be licensed, or recommend a close alternative.",
  },
  {
    question: "Do you offer AI Film from a wedding we already shot?",
    answer:
      "Yes — this is one of the most popular requests. If J FILM STUDIO photographed your day, we already have your gallery and can often begin right away. Past clients receive a loyalty discount.",
  },
] as const;

export const aiFilmCta = {
  label: "Start Your Film",
  heading: "Let's turn your photographs into something you can press play on.",
  body: "Send us a gallery, an idea, or just the photos you can't stop looking at. We'll reply with a plan, a timeline, and the right package.",
} as const;
