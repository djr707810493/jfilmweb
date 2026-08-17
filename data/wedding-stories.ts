import { placeholderImages } from "@/data/images";
import type { WeddingStory } from "@/types/wedding-story";

export const weddingStories: WeddingStory[] = [
  {
    slug: "park-city-alpine-celebration",
    couple: "Emma & James",
    title: "An Alpine Celebration",
    location: "Park City, Utah",
    date: "August 2025",
    excerpt:
      "A golden-hour ceremony among the pines, followed by an intimate reception under string lights and mountain air.",
    story: [
      "Emma and James wanted their wedding to feel like an extension of the landscape — unhurried, honest, and deeply personal. We began the day with quiet preparation light at a Deer Valley lodge, then moved to an alpine meadow as the Wasatch peaks turned gold.",
      "Their ceremony was brief and intentional. No performance — just vows spoken clearly, tears held back and released, and the soft rustle of aspen leaves in the afternoon wind. We stayed close, watching for the in-between moments: a hand squeeze, a laugh shared with parents, the first walk back down the aisle as husband and wife.",
      "The reception unfolded as the sun dropped behind the ridge. Candlelight, natural florals, and a dance floor that never quite emptied. By the time we sent them off through sparklers and cold mountain air, the gallery already felt like a memory — calm, true-to-color, and entirely theirs.",
    ],
    cover: {
      src: placeholderImages.heroMountainWedding,
      alt: "Emma and James wedding couple portrait among Park City mountain evergreens at golden hour",
      aspect: "aspect-[4/5] md:aspect-[16/10]",
    },
    gallery: [
      {
        src: placeholderImages.brideGroomMountain,
        alt: "Park City wedding bride and groom portrait in natural alpine light",
        span: "md:col-span-7",
        aspect: "aspect-[4/5] md:aspect-[4/5]",
      },
      {
        src: placeholderImages.ceremonyAisle,
        alt: "Park City mountain wedding ceremony aisle with natural floral arrangements",
        span: "md:col-span-5",
        aspect: "aspect-[4/5] md:aspect-square",
      },
      {
        src: placeholderImages.weddingCouple,
        alt: "Emma and James during their outdoor wedding ceremony in Park City",
        span: "col-span-2 md:col-span-8",
        aspect: "aspect-[16/10]",
      },
      {
        src: placeholderImages.weddingRings,
        alt: "Wedding detail flat lay with invitation suite and rings",
        span: "md:col-span-4",
        aspect: "aspect-square",
      },
      {
        src: placeholderImages.receptionCelebration,
        alt: "Park City wedding reception celebration with flash photography",
        span: "col-span-2 md:col-span-12",
        aspect: "aspect-[16/9]",
      },
    ],
  },
  {
    slug: "moab-desert-elopement",
    couple: "Sarah & Michael",
    title: "Desert Silence",
    location: "Moab, Utah",
    date: "September 2025",
    excerpt:
      "Just the two of them, red rocks, and the vast expanse of the Utah desert at last light.",
    story: [
      "Sarah and Michael traded a traditional venue for the endless red rocks of Moab. No guest list, no timeline—just the two of them and the desert wind. We hiked out to a remote canyon overlook a few hours before sunset to catch the harsh afternoon light shifting into soft gold.",
      "The ceremony was spoken directly to each other, echoed only by the canyon walls. It’s in these quiet, stripped-back environments that genuine emotion naturally surfaces. Our approach was simply to step back and let the landscape frame their connection.",
      "As dusk settled, the red rocks turned a deep, saturated crimson. We captured their final portraits under the emerging stars, wrapping up a day that was as grounded and raw as the desert itself."
    ],
    cover: {
      src: placeholderImages.desertCanyon,
      alt: "Sarah and Michael elopement against Moab desert red rocks",
      aspect: "aspect-[4/5] md:aspect-[16/10]",
    },
    gallery: [
      {
        src: placeholderImages.desertCanyon,
        alt: "Moab desert canyon wide shot with couple",
        span: "md:col-span-12",
        aspect: "aspect-[16/9]",
      },
      {
        src: placeholderImages.coupleOutdoor,
        alt: "Couple holding hands in the desert",
        span: "md:col-span-6",
        aspect: "aspect-[4/5]",
      },
      {
        src: placeholderImages.editorialPortrait,
        alt: "Editorial portrait of the bride",
        span: "md:col-span-6",
        aspect: "aspect-[4/5]",
      },
    ],
  },
  {
    slug: "zion-canyon-vows",
    title: "Canyon Vows",
    couple: "Chloe & David",
    location: "Zion National Park",
    date: "May 2024",
    excerpt:
      "A celebration framed by towering canyon walls and the lush greens of a Zion spring.",
    story: [
      "Zion in the spring offers an incredible contrast—the rich, vibrant greens of the valley floor set against the massive, sheer red cliffs. Chloe and David brought their closest friends and family to this dramatic setting for a weekend of celebration and quiet moments.",
      "The morning started with a slow, relaxed prep before transitioning to a ceremony right at the base of the canyon. The natural light filtering through the trees provided a perfect, dappled canopy for their vows.",
      "We focused heavily on the environmental portraits, using the sweeping scale of Zion to emphasize the intimacy of their union. The gallery reflects the true-to-color vibrancy of the location and the undeniable joy of the couple."
    ],
    cover: {
      src: placeholderImages.forestTrail,
      alt: "Zion national park forest trail",
      aspect: "aspect-[4/5] md:aspect-[16/10]",
    },
    gallery: [
      {
        src: placeholderImages.forestTrail,
        alt: "Couple walking down a forest trail in Zion",
        span: "md:col-span-8",
        aspect: "aspect-[16/10]",
      },
      {
        src: placeholderImages.mistyMountains,
        alt: "Misty mountain peaks in the morning",
        span: "md:col-span-4",
        aspect: "aspect-[4/5]",
      },
      {
        src: placeholderImages.weddingCouple,
        alt: "Chloe and David portrait",
        span: "md:col-span-12",
        aspect: "aspect-[16/9]",
      },
    ]
  },
  {
    slug: "salt-lake-city-editorial",
    title: "City Lights",
    couple: "Olivia & Daniel",
    location: "Salt Lake City, Utah",
    date: "October 2024",
    excerpt:
      "A refined, editorial-style city wedding filled with modern architecture and flash-lit reception energy.",
    story: [
      "Moving away from the mountains, Olivia and Daniel opted for a sleek, modern aesthetic in the heart of Salt Lake City. Their day was characterized by clean architectural lines, sophisticated styling, and an emphasis on fashion-forward portraiture.",
      "We utilized the harsh urban light and concrete textures to create bold, editorial-style portraits. The contrast between their elegant attire and the industrial environment created a striking visual narrative.",
      "When the sun went down, the reception turned into an absolute party. We switched to direct flash to capture the raw, unfiltered energy of the dance floor—resulting in high-contrast, timeless images that feel like a spread in a fashion magazine."
    ],
    cover: {
      src: placeholderImages.bridePortrait,
      alt: "Editorial bride portrait",
      aspect: "aspect-[4/5] md:aspect-[16/10]",
    },
    gallery: [
      {
        src: placeholderImages.bridePortrait,
        alt: "Editorial bride portrait",
        span: "md:col-span-6",
        aspect: "aspect-[4/5]",
      },
      {
        src: placeholderImages.weddingRings,
        alt: "Details of rings and invitations",
        span: "md:col-span-6",
        aspect: "aspect-square",
      },
      {
        src: placeholderImages.receptionCelebration,
        alt: "High energy reception celebration with direct flash",
        span: "md:col-span-12",
        aspect: "aspect-[16/9]",
      },
    ]
  }
];

export function getWeddingStoryBySlug(slug: string) {
  return weddingStories.find((story) => story.slug === slug);
}

export function getAllWeddingStorySlugs() {
  return weddingStories.map((story) => story.slug);
}
