"use client";

import { useState } from "react";
import { SiteImage } from "@/components/site-image";
import {
  getVideoPosterUrl,
  isDirectVideoFileUrl,
  parseVideoEmbedUrl,
} from "@/lib/video-embed";
import type { PortfolioVideoMedia } from "@/types/portfolio";

type PortfolioVideoProps = {
  media: PortfolioVideoMedia;
  className?: string;
  autoPlayOnClick?: boolean;
  /** inline = embedded player; facade = poster with play button */
  layout?: "inline" | "facade";
  /** fill = stretch to parent; box = fixed aspect ratio container */
  fit?: "box" | "fill";
};

export function PortfolioVideo({
  media,
  className = "",
  autoPlayOnClick = true,
  layout = "facade",
  fit = "box",
}: PortfolioVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embed = parseVideoEmbedUrl(media.src);
  const directVideo = !embed && isDirectVideoFileUrl(media.src);
  const posterUrl = getVideoPosterUrl(media.src, media.poster);
  const containerClass =
    fit === "fill"
      ? "absolute inset-0 overflow-hidden"
      : "relative aspect-video overflow-hidden";

  if (layout === "inline" && embed) {
    return (
      <div className={`${containerClass} bg-soft-black ${className}`}>
        <iframe
          src={`${embed.embedUrl}?rel=0`}
          title={media.title ?? media.alt}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  if (isPlaying && embed) {
    return (
      <div className={`${containerClass} bg-soft-black ${className}`}>
        <iframe
          src={`${embed.embedUrl}?autoplay=1&rel=0`}
          title={media.title ?? media.alt}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  if (isPlaying && directVideo) {
    return (
      <div className={`${containerClass} bg-soft-black ${className}`}>
        <video
          src={media.src}
          poster={posterUrl || undefined}
          controls
          playsInline
          autoPlay
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`group ${containerClass} bg-soft-black ${className}`}>
      {posterUrl ? (
        <SiteImage
          src={posterUrl}
          alt={media.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="absolute inset-0 bg-soft-black" />
      )}

      <div className="absolute inset-0 bg-soft-black/20 transition-colors duration-500 group-hover:bg-soft-black/30" />

      {embed || directVideo ? (
        autoPlayOnClick ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`Play ${media.title ?? media.alt}`}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <PlayBadge />
          </button>
        ) : (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            <PlayBadge />
          </div>
        )
      ) : (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-sm text-ivory/80">
          Add a valid YouTube or Vimeo URL
        </div>
      )}

      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 md:top-4 md:left-4">
        <span className="label-editorial border border-ivory/30 bg-soft-black/40 px-2.5 py-1 text-ivory backdrop-blur-sm">
          Film
        </span>
        {embed && (
          <span className="label-editorial text-ivory/80 capitalize">
            {embed.provider}
          </span>
        )}
        {media.duration && (
          <span className="label-editorial text-ivory/80">{media.duration}</span>
        )}
      </div>
    </div>
  );
}

function PlayBadge() {
  return (
    <span className="flex size-14 items-center justify-center border border-ivory/70 bg-soft-black/30 backdrop-blur-sm transition-colors duration-300 group-hover:bg-soft-black/45 md:size-16">
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="ml-0.5 size-5 fill-ivory md:size-6"
      >
        <path d="M8 5.14v13.72L19 12 8 5.14z" />
      </svg>
    </span>
  );
}

export function getVideoProviderLabel(src: string): string | null {
  const embed = parseVideoEmbedUrl(src);
  return embed ? embed.provider : null;
}
