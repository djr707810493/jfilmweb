"use client";

import { dashboardInputClass } from "@/components/dashboard/dashboard-layout";
import { imageCompressionHint } from "@/lib/image-compress";
import type { CoverageVideo } from "@/types/website";

export type WebsiteVideoSectionProps = {
  title: string;
  description: string;
  captionPlaceholder: string;
  emptyHint: string;
  value: CoverageVideo;
  saving: boolean;
  uploading: boolean;
  busy: boolean;
  onChange: (next: CoverageVideo) => void;
  onSave: () => void;
  onRemove: () => void;
  onUploadVideo: (file: File) => void;
  onUploadPoster: (file: File) => void;
};

export function WebsiteVideoSection({
  title,
  description,
  captionPlaceholder,
  emptyHint,
  value,
  saving,
  uploading,
  busy,
  onChange,
  onSave,
  onRemove,
  onUploadVideo,
  onUploadPoster,
}: WebsiteVideoSectionProps) {
  return (
    <section className="space-y-4 border-t border-taupe/30 pt-10">
      <h2 className="label-editorial text-soft-black">{title}</h2>
      <p className="text-xs leading-relaxed text-soft-black-muted">
        {description} {imageCompressionHint()}
      </p>

      <label className="block text-sm text-soft-black">
        <span className="label-editorial text-soft-black">Video URL</span>
        <span className="mt-1 block text-xs text-soft-black-muted">YouTube, Vimeo, or uploaded mp4/webm URL</span>
        <input
          value={value.src}
          onChange={(event) => onChange({ ...value, src: event.target.value })}
          placeholder="https://www.youtube.com/watch?v=…"
          className={dashboardInputClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-soft-black">
          <span className="label-editorial text-soft-black">Caption (optional)</span>
          <input
            value={value.title}
            onChange={(event) => onChange({ ...value, title: event.target.value })}
            placeholder={captionPlaceholder}
            maxLength={120}
            className={dashboardInputClass}
          />
        </label>
        <label className="block text-sm text-soft-black">
          <span className="label-editorial text-soft-black">Poster URL (optional)</span>
          <input
            value={value.poster}
            onChange={(event) => onChange({ ...value, poster: event.target.value })}
            placeholder="Cover frame shown before play"
            className={dashboardInputClass}
          />
        </label>
      </div>

      {value.src ? (
        <div className="relative aspect-video max-w-xl overflow-hidden border border-taupe/30 bg-taupe/10">
          {value.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.poster} alt="" className="h-full w-full object-cover" />
          ) : (
            <video src={value.src} className="h-full w-full object-cover" muted playsInline preload="metadata" />
          )}
          <span className="label-editorial absolute bottom-2 left-2 bg-soft-black/60 px-2 py-1 text-[10px] text-ivory">Preview</span>
        </div>
      ) : (
        <p className="text-sm text-soft-black-muted">{emptyHint}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <label className="inline-flex cursor-pointer items-center">
          <span className="label-editorial border border-taupe/40 bg-ivory px-4 py-2.5 text-soft-black">
            {uploading ? "Uploading…" : "Upload video"}
          </span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            disabled={busy}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUploadVideo(file);
              event.target.value = "";
            }}
          />
        </label>
        <label className="inline-flex cursor-pointer items-center">
          <span className="label-editorial border border-taupe/40 bg-ivory px-4 py-2.5 text-soft-black">
            Upload poster
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            disabled={busy}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUploadPoster(file);
              event.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="label-editorial min-h-[2.75rem] border border-soft-black bg-soft-black px-6 py-2.5 text-ivory disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save video"}
        </button>
        {value.src ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className="label-editorial min-h-[2.75rem] border border-taupe/40 px-4 py-2.5 text-soft-black-muted disabled:opacity-40"
          >
            Remove
          </button>
        ) : null}
      </div>
    </section>
  );
}
