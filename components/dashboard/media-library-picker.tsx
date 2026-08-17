"use client";

import { useEffect, useState, useMemo } from "react";
import {
  getMediaLibraryImages,
  type LibraryImage,
} from "@/lib/firebase/media-library";

type MediaLibraryPickerProps = {
  onSelect: (images: LibraryImage[]) => void;
  onClose: () => void;
};

export function MediaLibraryPicker({
  onSelect,
  onClose,
}: MediaLibraryPickerProps) {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSrcs, setSelectedSrcs] = useState<Set<string>>(new Set());
  const [filterSource, setFilterSource] = useState<string>("All");

  useEffect(() => {
    getMediaLibraryImages().then((imgs) => {
      // Sort newest roughly by preserving existing order (newest projects tend to be at the end, or you can reverse)
      setImages(imgs.reverse());
      setLoading(false);
    });
  }, []);

  const sources = useMemo(() => {
    const set = new Set<string>();
    images.forEach((img) => {
      const category = img.source.split(":")[0];
      if (category) set.add(category);
    });
    return ["All", ...Array.from(set)];
  }, [images]);

  const filteredImages = useMemo(() => {
    if (filterSource === "All") return images;
    return images.filter((img) => img.source.startsWith(filterSource));
  }, [images, filterSource]);

  const toggleSelect = (src: string) => {
    const next = new Set(selectedSrcs);
    if (next.has(src)) {
      next.delete(src);
    } else {
      next.add(src);
    }
    setSelectedSrcs(next);
  };

  const handleInsert = () => {
    // Preserve selection order instead of original array order if possible,
    // but a simple filter keeps original array order.
    const selected = images.filter((img) => selectedSrcs.has(img.src));
    onSelect(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-soft-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col bg-ivory-dark shadow-2xl">
        <div className="flex items-center justify-between border-b border-taupe/40 px-6 py-4">
          <div>
            <h2 className="font-display text-2xl text-soft-black">
              Media Library
            </h2>
            <p className="mt-1 text-xs text-soft-black-muted">
              Select images previously uploaded to Portfolios or Stories.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-soft-black-muted transition-colors hover:text-soft-black"
            aria-label="Close"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4 border-b border-taupe/30 bg-ivory px-6 py-3 text-sm">
          <span className="label-editorial text-muted">Filter:</span>
          {sources.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setFilterSource(src)}
              className={`label-editorial px-2 py-1 transition-colors ${
                filterSource === src
                  ? "bg-soft-black text-ivory"
                  : "text-soft-black-muted hover:bg-taupe/20"
              }`}
            >
              {src}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-center text-sm text-soft-black-muted py-12">
              Loading library...
            </p>
          ) : filteredImages.length === 0 ? (
            <p className="text-center text-sm text-soft-black-muted py-12">
              No images found.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {filteredImages.map((img) => {
                const isSelected = selectedSrcs.has(img.src);
                return (
                  <div
                    key={img.src}
                    onClick={() => toggleSelect(img.src)}
                    className={`group relative aspect-square cursor-pointer overflow-hidden bg-taupe/10 transition-all ${
                      isSelected
                        ? "ring-2 ring-soft-black ring-offset-2 ring-offset-ivory-dark"
                        : "hover:opacity-90"
                    }`}
                    title={img.source}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-soft-black/20">
                        <div className="rounded-full bg-soft-black p-1 text-ivory">
                          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-taupe/40 bg-ivory px-6 py-4">
          <p className="text-sm text-soft-black-muted">
            {selectedSrcs.size} image{selectedSrcs.size === 1 ? "" : "s"} selected
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="label-editorial border border-taupe/40 px-4 py-2 text-soft-black transition-colors hover:bg-taupe/20"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={selectedSrcs.size === 0}
              className="label-editorial border border-soft-black bg-soft-black px-4 py-2 text-ivory disabled:opacity-40"
            >
              Insert Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
