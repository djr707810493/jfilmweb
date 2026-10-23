"use client";

import { dashboardInputClass } from "@/components/dashboard/dashboard-layout";
import { PortfolioVideo } from "@/components/portfolio/portfolio-video";
import { isDirectVideoFileUrl, isValidVideoEmbedUrl } from "@/lib/video-embed";
import type { AiFilmVideo } from "@/types/website";

export type WebsiteAiFilmSectionProps = {
  films: AiFilmVideo[];
  saving: boolean;
  uploadingId: string | null;
  busy: boolean;
  onChange: (id: string, patch: Partial<AiFilmVideo>) => void;
  onSave: () => void;
  onUploadVideo: (id: string, file: File) => void;
  onUploadPoster: (id: string, file: File) => void;
};

function filmVideoError(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return "";
  if (isValidVideoEmbedUrl(trimmed) || isDirectVideoFileUrl(trimmed)) return "";
  return "Must be a YouTube/Vimeo link or an uploaded mp4/webm file.";
}

export function WebsiteAiFilmSection({
  films,
  saving,
  uploadingId,
  busy,
  onChange,
  onSave,
  onUploadVideo,
  onUploadPoster,
}: WebsiteAiFilmSectionProps) {
  return (
    <section className="space-y-4 border-t border-taupe/30 pt-10">
      <h2 className="label-editorial text-soft-black">AI Film showcase</h2>
      <p className="text-xs leading-relaxed text-soft-black-muted">
        The film cards on the <code>/ai-film</code> page. Paste a YouTube/Vimeo
        link or upload an mp4 (under 200MB) for each card. Cards without a video
        keep showing the “preview coming soon” placeholder. Uploaded posters are
        compressed automatically.
      </p>

      <ul className="space-y-3">
        {films.map((film) => {
          const invalid = filmVideoError(film.src);
          const uploading = uploadingId === film.id;
          return (
            <li key={film.id} className="border border-taupe/40 bg-ivory-dark">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-3 sm:p-4">
                  <span className="relative aspect-video w-24 shrink-0 overflow-hidden bg-taupe/10">
                    {film.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={film.poster}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="label-editorial block text-soft-black">
                      {film.title}
                    </span>
                    <span className="mt-1 block text-xs text-soft-black-muted">
                      {film.src
                        ? "Video set"
                        : "No video yet — placeholder is shown"}
                    </span>
                  </span>
                  <span className="label-editorial shrink-0 text-taupe group-open:hidden">
                    Edit
                  </span>
                  <span className="label-editorial hidden shrink-0 text-taupe group-open:inline">
                    Collapse
                  </span>
                </summary>

                <div className="space-y-4 border-t border-taupe/30 p-4 sm:p-6">
                  <label className="block text-sm text-soft-black">
                    <span className="label-editorial text-soft-black">
                      Video URL
                    </span>
                    <span className="mt-1 block text-xs text-soft-black-muted">
                      YouTube, Vimeo, or uploaded mp4/webm URL
                    </span>
                    <input
                      value={film.src}
                      onChange={(event) =>
                        onChange(film.id, { src: event.target.value })
                      }
                      placeholder="https://vimeo.com/…"
                      className={dashboardInputClass}
                    />
                    {invalid ? (
                      <span className="mt-1 block text-xs text-red-700">
                        {invalid}
                      </span>
                    ) : null}
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm text-soft-black">
                      <span className="label-editorial text-soft-black">
                        Card title
                      </span>
                      <input
                        value={film.title}
                        onChange={(event) =>
                          onChange(film.id, { title: event.target.value })
                        }
                        maxLength={120}
                        className={dashboardInputClass}
                      />
                    </label>
                    <label className="block text-sm text-soft-black">
                      <span className="label-editorial text-soft-black">
                        Subtitle
                      </span>
                      <input
                        value={film.subtitle}
                        onChange={(event) =>
                          onChange(film.id, { subtitle: event.target.value })
                        }
                        placeholder="Wedding highlight · 90 sec"
                        maxLength={120}
                        className={dashboardInputClass}
                      />
                    </label>
                    <label className="block text-sm text-soft-black">
                      <span className="label-editorial text-soft-black">Tag</span>
                      <input
                        value={film.tag}
                        onChange={(event) =>
                          onChange(film.id, { tag: event.target.value })
                        }
                        placeholder="Wedding"
                        maxLength={40}
                        className={dashboardInputClass}
                      />
                    </label>
                    <label className="block text-sm text-soft-black">
                      <span className="label-editorial text-soft-black">
                        Duration
                      </span>
                      <input
                        value={film.duration}
                        onChange={(event) =>
                          onChange(film.id, { duration: event.target.value })
                        }
                        placeholder="01:30"
                        maxLength={16}
                        className={dashboardInputClass}
                      />
                    </label>
                  </div>

                  <label className="block text-sm text-soft-black">
                    <span className="label-editorial text-soft-black">
                      Poster URL (optional)
                    </span>
                    <span className="mt-1 block text-xs text-soft-black-muted">
                      Cover frame shown before play. Leave blank to use the
                      YouTube thumbnail when available.
                    </span>
                    <input
                      value={film.poster}
                      onChange={(event) =>
                        onChange(film.id, { poster: event.target.value })
                      }
                      className={dashboardInputClass}
                    />
                  </label>

                  <label className="block text-sm text-soft-black">
                    <span className="label-editorial text-soft-black">
                      Poster alt text
                    </span>
                    <input
                      value={film.alt}
                      onChange={(event) =>
                        onChange(film.id, { alt: event.target.value })
                      }
                      maxLength={200}
                      className={dashboardInputClass}
                    />
                  </label>

                  {film.src.trim() && !invalid ? (
                    <div className="max-w-md">
                      <PortfolioVideo
                        media={{
                          type: "video",
                          src: film.src,
                          poster: film.poster,
                          alt: film.alt,
                          title: film.title,
                          duration: film.duration,
                        }}
                        layout="facade"
                        className="border border-taupe/30"
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center">
                      <span className="label-editorial min-h-[2.75rem] border border-taupe/40 bg-ivory px-4 py-2.5 text-soft-black">
                        {uploading ? "Uploading…" : "Upload video"}
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        disabled={busy}
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) onUploadVideo(film.id, file);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    <label className="inline-flex cursor-pointer items-center">
                      <span className="label-editorial min-h-[2.75rem] border border-taupe/40 bg-ivory px-4 py-2.5 text-soft-black">
                        Upload poster
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        disabled={busy}
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) onUploadPoster(film.id, file);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    {film.src ? (
                      <button
                        type="button"
                        onClick={() => onChange(film.id, { src: "" })}
                        disabled={busy}
                        className="label-editorial min-h-[2.75rem] border border-taupe/40 px-4 py-2.5 text-soft-black-muted disabled:opacity-40"
                      >
                        Clear video
                      </button>
                    ) : null}
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onSave}
        disabled={busy}
        className="label-editorial min-h-[3rem] border border-soft-black bg-soft-black px-6 py-3 text-ivory disabled:opacity-40"
      >
        {saving ? "Saving…" : "Save AI Film showcase"}
      </button>
    </section>
  );
}
