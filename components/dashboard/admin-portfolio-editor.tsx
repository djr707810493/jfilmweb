"use client";

import { FormEvent, useState } from "react";
import {
  dashboardInputClass,
  dashboardSelectClass,
} from "@/components/dashboard/dashboard-layout";
import { uploadPortfolioImage } from "@/lib/firebase/storage";
import { formatCompressionSummary, imageCompressionHint } from "@/lib/image-compress";
import { isValidVideoEmbedUrl, getVideoPosterUrl } from "@/lib/video-embed";
import type {
  PortfolioCategory,
  PortfolioMedia,
  PortfolioProjectInput,
  PortfolioVideoMedia,
} from "@/types/portfolio";

const CATEGORY_OPTIONS: { value: PortfolioCategory; label: string }[] = [
  { value: "wedding", label: "Wedding" },
  { value: "elopement", label: "Elopement" },
  { value: "editorial", label: "Editorial" },
  { value: "film", label: "Film" },
];

type AdminPortfolioEditorProps = {
  value: PortfolioProjectInput;
  isNew: boolean;
  saving: boolean;
  uploading: boolean;
  onChange: (value: PortfolioProjectInput) => void;
  onSave: () => void;
  onUploadState: (uploading: boolean) => void;
};

export function AdminPortfolioEditor({
  value,
  isNew,
  saving,
  uploading,
  onChange,
  onSave,
  onUploadState,
}: AdminPortfolioEditorProps) {
  const [uploadLabel, setUploadLabel] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(
    null,
  );

  function updateField<K extends keyof PortfolioProjectInput>(
    key: K,
    fieldValue: PortfolioProjectInput[K],
  ) {
    onChange({ ...value, [key]: fieldValue });
  }

  async function uploadImageFile(
    file: File,
    onProgress?: (progress: number) => void,
  ) {
    if (!value.slug) throw new Error("Set a slug before uploading images.");

    return uploadPortfolioImage(
      value.category,
      value.slug,
      file,
      onProgress,
    );
  }

  async function uploadImage(
    file: File,
    label: string,
    onSuccess: (result: {
      url: string;
      width: number;
      height: number;
      compressedSize: number;
      skippedCompression: boolean;
    }) => void,
  ) {
    setUploadError("");
    onUploadState(true);
    setUploadLabel(`Preparing ${file.name}…`);

    try {
      const result = await uploadImageFile(file, (progress) => {
        if (progress < 30) {
          setUploadLabel(`Preparing ${file.name}…`);
        } else if (progress < 40) {
          setUploadLabel(`Compressing ${file.name}…`);
        } else {
          setUploadLabel(`Uploading ${file.name}… ${progress}%`);
        }
      });

      onSuccess(result);
      setUploadLabel(`${label} ready · ${formatCompressionSummary({
        file,
        originalSize: file.size,
        compressedSize: result.compressedSize,
        width: result.width,
        height: result.height,
        skippedCompression: result.skippedCompression,
      })}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image upload failed.";
      setUploadError(message);
      throw error;
    } finally {
      onUploadState(false);
    }
  }

  async function handleCoverImageUpload(file: File) {
    await uploadImage(file, "Cover image", (result) => {
      updateField("cover", {
        type: "image",
        src: result.url,
        alt: value.cover.alt || value.title,
        width: result.width,
        height: result.height,
      });
    });
  }

  async function handleCoverPosterUpload(file: File) {
    if (value.cover.type !== "video") {
      throw new Error("Switch cover type to video before uploading a poster.");
    }

    const cover = value.cover;

    await uploadImage(file, "Video poster", (result) => {
      updateField("cover", {
        ...cover,
        poster: result.url,
      });
    });
  }

  async function handleAddMediaImages(files: File[]) {
    if (!files.length) return;

    setUploadError("");
    onUploadState(true);

    let nextMedia = [...value.media];
    const failures: string[] = [];
    let successCount = 0;

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const position = `${index + 1}/${files.length}`;

      setUploadLabel(`${position}: Preparing ${file.name}…`);

      try {
        const result = await uploadImageFile(file, (progress) => {
          if (progress < 30) {
            setUploadLabel(`${position}: Preparing ${file.name}…`);
          } else if (progress < 40) {
            setUploadLabel(`${position}: Compressing ${file.name}…`);
          } else {
            setUploadLabel(
              `${position}: Uploading ${file.name}… ${progress}%`,
            );
          }
        });

        nextMedia = [
          ...nextMedia,
          {
            type: "image" as const,
            src: result.url,
            alt: value.title,
            width: result.width,
            height: result.height,
          },
        ];
        onChange({ ...value, media: nextMedia });
        successCount += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Image upload failed.";
        failures.push(`${file.name}: ${message}`);
      }
    }

    onUploadState(false);

    if (successCount > 0) {
      setUploadLabel(
        `Added ${successCount} image${successCount === 1 ? "" : "s"}`,
      );
    }

    if (failures.length > 0) {
      setUploadError(
        failures.length === files.length
          ? failures[0]
          : `${failures.length} of ${files.length} uploads failed. ${failures[0]}`,
      );
    }
  }

  function updateCoverVideoField(
    field: keyof PortfolioVideoMedia,
    fieldValue: string,
  ) {
    if (value.cover.type !== "video") return;

    updateField("cover", {
      ...value.cover,
      [field]: fieldValue,
    });
  }

  function addVideoToGallery(url: string) {
    const trimmed = url.trim();
    if (!isValidVideoEmbedUrl(trimmed)) {
      setUploadError("Enter a valid YouTube or Vimeo URL.");
      return;
    }

    const posterUrl =
      value.cover.type === "image"
        ? value.cover.src
        : value.cover.type === "video"
          ? value.cover.poster
          : "";

    updateField("media", [
      ...value.media,
      {
        type: "video",
        src: trimmed,
        poster: posterUrl || getVideoPosterUrl(trimmed),
        alt: value.title,
        title: `${value.title} — Film`,
      },
    ]);
    setNewVideoUrl("");
    setUploadError("");
    setEditingVideoIndex(value.media.length);
  }

  function updateMediaItem(index: number, nextItem: PortfolioMedia) {
    updateField(
      "media",
      value.media.map((item, itemIndex) =>
        itemIndex === index ? nextItem : item,
      ),
    );
  }

  function moveMediaItem(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= value.media.length) return;

    const next = [...value.media];
    [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
    updateField("media", next);

    if (editingVideoIndex === fromIndex) {
      setEditingVideoIndex(toIndex);
    } else if (editingVideoIndex === toIndex) {
      setEditingVideoIndex(fromIndex);
    }
  }

  function removeMediaItem(index: number) {
    updateField(
      "media",
      value.media.filter((_, itemIndex) => itemIndex !== index),
    );

    if (editingVideoIndex === index) {
      setEditingVideoIndex(null);
    } else if (editingVideoIndex !== null && editingVideoIndex > index) {
      setEditingVideoIndex(editingVideoIndex - 1);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4 border border-taupe/40 bg-ivory-dark p-4 sm:p-6">
        <h3 className="label-editorial text-soft-black">Project Details</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" required>
            <input
              required
              value={value.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={dashboardInputClass}
            />
          </Field>

          <Field
            label="Slug"
            required
            hint={isNew ? "Used in the URL" : "Locked after create"}
          >
            <input
              required
              readOnly={!isNew}
              value={value.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              className={`${dashboardInputClass} ${!isNew ? "opacity-70" : ""}`}
            />
          </Field>

          <Field label="Location">
            <input
              value={value.location}
              onChange={(e) => updateField("location", e.target.value)}
              className={dashboardInputClass}
            />
          </Field>

          <Field label="Year">
            <input
              value={value.year}
              onChange={(e) => updateField("year", e.target.value)}
              className={dashboardInputClass}
            />
          </Field>

          <Field label="Category">
            <select
              value={value.category}
              onChange={(e) =>
                updateField("category", e.target.value as PortfolioCategory)
              }
              className={dashboardSelectClass}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sort order">
            <input
              type="number"
              value={value.sortOrder}
              onChange={(e) =>
                updateField("sortOrder", Number(e.target.value) || 0)
              }
              className={dashboardInputClass}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            rows={4}
            value={value.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={`${dashboardInputClass} resize-y`}
          />
        </Field>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-soft-black">
            <input
              type="checkbox"
              checked={value.featured ?? false}
              onChange={(e) => updateField("featured", e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-soft-black">
            <input
              type="checkbox"
              checked={value.published}
              onChange={(e) => updateField("published", e.target.checked)}
            />
            Published on site
          </label>
        </div>
      </section>

      <section className="space-y-4 border border-taupe/40 bg-ivory-dark p-4 sm:p-6">
        <h3 className="label-editorial text-soft-black">Cover Media</h3>
        <p className="text-xs leading-relaxed text-soft-black-muted">
          {imageCompressionHint()} Videos use YouTube or Vimeo URLs only.
        </p>

        <Field label="Cover type">
          <select
            value={value.cover.type}
            onChange={(e) => {
              if (e.target.value === "video") {
                updateField("cover", {
                  type: "video",
                  src: value.cover.type === "video" ? value.cover.src : "",
                  poster:
                    value.cover.type === "image"
                      ? value.cover.src
                      : value.cover.type === "video"
                        ? value.cover.poster
                        : "",
                  alt: value.cover.alt || value.title,
                });
              } else {
                updateField("cover", {
                  type: "image",
                  src: value.cover.type === "image" ? value.cover.src : "",
                  alt: value.cover.alt || value.title,
                  width: 1600,
                  height: 1200,
                });
              }
            }}
            className={dashboardSelectClass}
          >
            <option value="image">Image</option>
            <option value="video">Video embed</option>
          </select>
        </Field>

        <Field label="Alt text">
          <input
            value={value.cover.alt}
            onChange={(e) =>
              updateField("cover", { ...value.cover, alt: e.target.value })
            }
            className={dashboardInputClass}
          />
        </Field>

        {value.cover.type === "image" ? (
          <MediaUploadRow
            label="Upload cover image"
            disabled={uploading || !value.slug}
            onFile={(file) => handleCoverImageUpload(file).catch(() => undefined)}
          />
        ) : (
          <>
            <Field
              label="Video URL"
              hint="Paste a YouTube or Vimeo link. Video files cannot be uploaded."
            >
              <input
                value={value.cover.src}
                onChange={(e) => updateCoverVideoField("src", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={dashboardInputClass}
              />
            </Field>

            <Field label="Duration (optional)">
              <input
                value={value.cover.duration ?? ""}
                onChange={(e) => updateCoverVideoField("duration", e.target.value)}
                placeholder="1:12"
                className={dashboardInputClass}
              />
            </Field>

            <MediaUploadRow
              label="Upload poster image"
              disabled={uploading || !value.slug}
              onFile={(file) =>
                handleCoverPosterUpload(file).catch(() => undefined)
              }
            />

            {value.cover.poster && (
              <MediaPreviewThumb
                src={value.cover.poster}
                alt={`${value.title} poster`}
                className="max-w-[8rem]"
              />
            )}
          </>
        )}

        {value.cover.type === "image" && value.cover.src && (
          <MediaPreviewThumb
            src={value.cover.src}
            alt={value.cover.alt || value.title}
            className="max-w-[8rem]"
          />
        )}
      </section>

      <section className="space-y-4 border border-taupe/40 bg-ivory-dark p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="label-editorial text-soft-black">Gallery Media</h3>
          <span className="text-xs text-soft-black-muted">
            {value.media.length} item{value.media.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <MediaUploadRow
            label="Add images"
            multiple
            disabled={uploading || !value.slug}
            onFiles={(files) =>
              handleAddMediaImages(files).catch(() => undefined)
            }
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Field
            label="Add video URL"
            hint="YouTube or Vimeo only"
          >
            <input
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              placeholder="https://youtu.be/..."
              className={dashboardInputClass}
            />
          </Field>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => addVideoToGallery(newVideoUrl)}
              className="label-editorial min-h-[2.75rem] border border-taupe/40 px-4 py-2.5 text-soft-black"
            >
              Add video
            </button>
          </div>
        </div>

        {value.media.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {value.media.map((item, index) => (
              <GalleryMediaTile
                key={`${item.type}-${index}-${item.src}`}
                item={item}
                index={index}
                total={value.media.length}
                isEditing={editingVideoIndex === index}
                onEditVideo={() =>
                  setEditingVideoIndex(
                    editingVideoIndex === index ? null : index,
                  )
                }
                onMoveEarlier={() => moveMediaItem(index, index - 1)}
                onMoveLater={() => moveMediaItem(index, index + 1)}
                onRemove={() => removeMediaItem(index)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-soft-black-muted">
            No gallery media yet. Upload images or add a video URL.
          </p>
        )}

        {editingVideoIndex !== null &&
          value.media[editingVideoIndex]?.type === "video" && (
            <div className="space-y-3 border border-taupe/30 bg-ivory p-3">
              <p className="label-editorial text-taupe">
                Edit video #{editingVideoIndex + 1}
              </p>
              <Field label="Video URL" hint="YouTube or Vimeo">
                <input
                  value={value.media[editingVideoIndex].src}
                  onChange={(e) =>
                    updateMediaItem(editingVideoIndex, {
                      ...value.media[editingVideoIndex],
                      src: e.target.value,
                    } as PortfolioVideoMedia)
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={dashboardInputClass}
                />
              </Field>
              <Field label="Poster image URL">
                <input
                  value={value.media[editingVideoIndex].poster}
                  onChange={(e) =>
                    updateMediaItem(editingVideoIndex, {
                      ...value.media[editingVideoIndex],
                      poster: e.target.value,
                    } as PortfolioVideoMedia)
                  }
                  placeholder="Optional poster URL"
                  className={dashboardInputClass}
                />
              </Field>
            </div>
          )}
      </section>

      {uploadLabel && (
        <p className="text-sm text-soft-black-muted">{uploadLabel}</p>
      )}

      {uploadError && (
        <p className="text-sm text-red-700" role="alert">
          {uploadError}
        </p>
      )}

      {!value.slug && (
        <p className="text-sm text-soft-black-muted">
          Set a slug before uploading images.
        </p>
      )}

      <button
        type="submit"
        disabled={saving || uploading}
        className="label-editorial min-h-[3rem] border border-soft-black bg-soft-black px-6 py-3 text-ivory disabled:opacity-40"
      >
        {saving ? "Saving…" : isNew ? "Create Project" : "Save Changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm text-soft-black">
      <span className="label-editorial text-soft-black">
        {label}
        {required ? " *" : ""}
      </span>
      {hint && (
        <span className="mt-1 block text-xs text-soft-black-muted">{hint}</span>
      )}
      {children}
    </label>
  );
}

function MediaPreviewThumb({
  src,
  alt,
  label,
  className = "",
}: {
  src: string;
  alt: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-square overflow-hidden border border-taupe/30 bg-taupe/10 ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-soft-black-muted">
          No preview
        </div>
      )}
      {label && (
        <span className="label-editorial absolute top-1 left-1 bg-soft-black/60 px-1.5 py-0.5 text-[10px] text-ivory">
          {label}
        </span>
      )}
    </div>
  );
}

function GalleryMediaTile({
  item,
  index,
  total,
  isEditing,
  onEditVideo,
  onMoveEarlier,
  onMoveLater,
  onRemove,
}: {
  item: PortfolioMedia;
  index: number;
  total: number;
  isEditing: boolean;
  onEditVideo: () => void;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onRemove: () => void;
}) {
  const previewSrc =
    item.type === "image" ? item.src : item.poster || "";
  const isVideo = item.type === "video";

  return (
    <div
      className={`group relative aspect-square overflow-hidden border bg-taupe/10 ${
        isEditing ? "border-soft-black ring-1 ring-soft-black/20" : "border-taupe/30"
      }`}
    >
      {previewSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt={item.alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center text-[10px] text-soft-black-muted">
          {isVideo ? (
            <>
              <PlayIcon className="size-4 opacity-60" />
              <span>Video</span>
            </>
          ) : (
            <span>No preview</span>
          )}
        </div>
      )}

      {isVideo && (
        <>
          <span className="label-editorial absolute top-1 left-1 bg-soft-black/60 px-1.5 py-0.5 text-[10px] text-ivory">
            Film
          </span>
          {previewSrc && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex size-8 items-center justify-center bg-soft-black/35 backdrop-blur-sm">
                <PlayIcon className="size-3.5 fill-ivory text-ivory" />
              </span>
            </div>
          )}
        </>
      )}

      <span className="absolute top-1 right-1 rounded-full bg-soft-black/55 px-1.5 py-0.5 text-[10px] text-ivory">
        {index + 1}
      </span>

      <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-0.5 bg-soft-black/75 p-1 transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0">
        {isVideo && (
          <TileActionButton
            label="Edit"
            onClick={onEditVideo}
            className={isEditing ? "bg-ivory/20" : ""}
          />
        )}
        <TileActionButton
          label="←"
          disabled={index === 0}
          onClick={onMoveEarlier}
        />
        <TileActionButton
          label="→"
          disabled={index === total - 1}
          onClick={onMoveLater}
        />
        <TileActionButton
          label="×"
          onClick={onRemove}
          className="text-red-200 hover:text-red-100"
        />
      </div>
    </div>
  );
}

function TileActionButton({
  label,
  disabled,
  onClick,
  className = "",
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-w-0 flex-1 px-1 py-1 text-[10px] text-ivory disabled:opacity-30 ${className}`}
    >
      {label}
    </button>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M8 5.14v13.72L19 12 8 5.14z" />
    </svg>
  );
}

function MediaUploadRow({
  label,
  disabled,
  multiple,
  onFile,
  onFiles,
}: {
  label: string;
  disabled?: boolean;
  multiple?: boolean;
  onFile?: (file: File) => void;
  onFiles?: (files: File[]) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <span className="label-editorial border border-taupe/40 bg-ivory px-4 py-2.5 text-soft-black transition-colors hover:bg-ivory-dark">
        {label}
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        disabled={disabled}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const selected = e.target.files;
          if (!selected?.length) return;

          if (multiple && onFiles) {
            onFiles(Array.from(selected));
          } else if (onFile) {
            onFile(selected[0]);
          }

          e.target.value = "";
        }}
      />
    </label>
  );
}
