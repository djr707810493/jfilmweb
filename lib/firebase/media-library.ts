import { getAllPortfolioProjectsAdmin } from "./portfolio";
import { getAllWeddingStoriesAdmin } from "./story";

export type LibraryImage = {
  src: string;
  alt: string;
  source: string;
};

export async function getMediaLibraryImages(): Promise<LibraryImage[]> {
  const [projects, stories] = await Promise.all([
    getAllPortfolioProjectsAdmin(),
    getAllWeddingStoriesAdmin(),
  ]);

  const imageMap = new Map<string, LibraryImage>();

  projects.forEach((p) => {
    if (p.cover.type === "image" && p.cover.src) {
      if (!imageMap.has(p.cover.src)) {
        imageMap.set(p.cover.src, {
          src: p.cover.src,
          alt: p.cover.alt,
          source: `Portfolio: ${p.title}`,
        });
      }
    }
    p.media.forEach((m) => {
      if (m.type === "image" && m.src) {
        if (!imageMap.has(m.src)) {
          imageMap.set(m.src, {
            src: m.src,
            alt: m.alt,
            source: `Portfolio: ${p.title}`,
          });
        }
      }
    });
  });

  stories.forEach((s) => {
    if (s.cover?.src) {
      if (!imageMap.has(s.cover.src)) {
        imageMap.set(s.cover.src, {
          src: s.cover.src,
          alt: s.cover.alt,
          source: `Story: ${s.title}`,
        });
      }
    }
    s.gallery.forEach((m) => {
      if (m.src) {
        if (!imageMap.has(m.src)) {
          imageMap.set(m.src, {
            src: m.src,
            alt: m.alt,
            source: `Story: ${s.title}`,
          });
        }
      }
    });
  });

  return Array.from(imageMap.values());
}
