export type VideoEmbedInfo =
  | {
      provider: "youtube";
      embedUrl: string;
      videoId: string;
    }
  | {
      provider: "vimeo";
      embedUrl: string;
      videoId: string;
    };

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  /^([\w-]{11})$/,
];

const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/;

function youtubeEmbed(videoId: string): VideoEmbedInfo {
  return {
    provider: "youtube",
    videoId,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
  };
}

function vimeoEmbed(videoId: string): VideoEmbedInfo {
  return {
    provider: "vimeo",
    videoId,
    embedUrl: `https://player.vimeo.com/video/${videoId}`,
  };
}

function parseWithUrlApi(input: string): VideoEmbedInfo | null {
  try {
    const parsed = new URL(
      input.startsWith("http://") || input.startsWith("https://")
        ? input
        : `https://${input}`,
    );
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      if (videoId && /^[\w-]{11}$/.test(videoId)) {
        return youtubeEmbed(videoId);
      }
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      let videoId = parsed.searchParams.get("v");
      const parts = parsed.pathname.split("/").filter(Boolean);

      if (!videoId && parts[0] === "shorts" && parts[1]) {
        videoId = parts[1];
      }
      if (!videoId && parts[0] === "embed" && parts[1]) {
        videoId = parts[1];
      }
      if (!videoId && parts[0] === "live" && parts[1]) {
        videoId = parts[1];
      }

      if (videoId && /^[\w-]{11}$/.test(videoId)) {
        return youtubeEmbed(videoId);
      }
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const videoId = parsed.pathname.split("/").find((part) => /^\d+$/.test(part));
      if (videoId) {
        return vimeoEmbed(videoId);
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function parseVideoEmbedUrl(input: string): VideoEmbedInfo | null {
  const url = input.trim();
  if (!url) return null;

  const fromUrlApi = parseWithUrlApi(url);
  if (fromUrlApi) return fromUrlApi;

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return youtubeEmbed(match[1]);
    }
  }

  const vimeoMatch = url.match(VIMEO_PATTERN);
  if (vimeoMatch?.[1]) {
    return vimeoEmbed(vimeoMatch[1]);
  }

  return null;
}

export function isValidVideoEmbedUrl(input: string): boolean {
  return parseVideoEmbedUrl(input) !== null;
}

export function isDirectVideoFileUrl(input: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(input.trim());
}

export function getYouTubePosterUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getVideoPosterUrl(src: string, poster?: string): string {
  const trimmedPoster = poster?.trim();
  if (trimmedPoster) return trimmedPoster;

  const embed = parseVideoEmbedUrl(src);
  if (embed?.provider === "youtube") {
    return getYouTubePosterUrl(embed.videoId);
  }

  return "";
}
