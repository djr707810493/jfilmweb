import { siteConfig } from "@/data/site";

type SchemaGraph = Record<string, unknown>;

/**
 * Pure schema builder — safe to import from client components.
 * `lib/schema.ts` re-exports it for server-side use.
 */
export function createVideoObjectSchema({
  id,
  name,
  description,
  embedUrl,
  thumbnailUrl,
  uploadDate,
  duration,
}: {
  id: string;
  name: string;
  description?: string;
  embedUrl: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string;
}): SchemaGraph {
  return {
    "@type": "VideoObject",
    "@id": `${siteConfig.url}/#video-${id}`,
    name,
    ...(description ? { description } : {}),
    embedUrl,
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    ...(uploadDate ? { uploadDate } : {}),
    ...(duration ? { duration } : {}),
    publisher: {
      "@type": "LocalBusiness",
      "@id": `${siteConfig.url}/#localbusiness`,
    },
  };
}

/** Converts "1:12" / "0:58" into ISO-8601 durations ("PT1M12S" / "PT58S"). */
export function parseDurationToIso(duration?: string): string {
  if (!duration) return "";
  const match = duration.match(/^(\d+):(\d{2})$/);
  if (!match) return "";
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return minutes > 0 ? `PT${minutes}M${seconds}S` : `PT${seconds}S`;
}
