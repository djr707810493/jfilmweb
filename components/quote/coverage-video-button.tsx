"use client";

import { useEffect, useState } from "react";
import { getCoverageVideo, getQuoteVideo } from "@/lib/firebase/website";
import { isDirectVideoFileUrl, parseVideoEmbedUrl } from "@/lib/video-embed";

/**
 * Popup player for the coverage explainer video
 * (managed in Dashboard → Website → Coverage video).
 * Renders nothing if no video is configured.
 */
export function CoverageVideoButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Prefer the short quote helper video; fall back to the homepage coverage video.
    getQuoteVideo()
      .then((video) => {
        if (!cancelled && video.src) {
          setSrc(video.src);
          return;
        }
        return getCoverageVideo().then((fallback) => {
          if (!cancelled && fallback.src) setSrc(fallback.src);
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (src === null) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`${label} — what is the difference? Watch video`}
        title="Watch: what's the difference?"
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-700 text-sm font-bold text-white shadow transition-transform hover:scale-110"
      >
        ?
      </button>
      {open ? <CoverageVideoModal src={src} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function CoverageVideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const embed = parseVideoEmbedUrl(src);
  const direct = !embed && isDirectVideoFileUrl(src);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-soft-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Coverage differences video"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden bg-soft-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <p className="label-editorial text-ivory/80">1 operator vs 2 operators</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="flex size-9 items-center justify-center text-ivory/80 hover:text-ivory"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="aspect-video w-full bg-black">
          {embed ? (
            <iframe
              src={`${embed.embedUrl}?autoplay=1&rel=0`}
              title="Coverage differences"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              className="h-full w-full"
            />
          ) : direct ? (
            <video src={src} controls autoPlay playsInline className="h-full w-full" />
          ) : (
            <p className="flex h-full items-center justify-center p-6 text-center text-sm text-ivory/70">
              Video unavailable — ask us directly below.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
