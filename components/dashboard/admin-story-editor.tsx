"use client";

import { FormEvent, useState } from "react";
import {
  dashboardInputClass,
} from "@/components/dashboard/dashboard-layout";
import { MediaLibraryPicker } from "@/components/dashboard/media-library-picker";
import { uploadStoryImage } from "@/lib/firebase/storage";
import { formatCompressionSummary, imageCompressionHint } from "@/lib/image-compress";
import type {
  WeddingStoryImage,
  WeddingStoryInput,
} from "@/types/wedding-story";

type AdminStoryEditorProps = {
  value: WeddingStoryInput;
  isNew: boolean;
  saving: boolean;
  uploading: boolean;
  onChange: (value: WeddingStoryInput) => void;
  onSave: () => void;
  onUploadState: (uploading: boolean) => void;
};

export function AdminStoryEditor({
  value,
  isNew,
  saving,
  uploading,
  onChange,
  onSave,
  onUploadState,
}: AdminStoryEditorProps) {
  const [uploadLabel, setUploadLabel] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [showLibraryPicker, setShowLibraryPicker] = useState<"cover" | "gallery" | null>(null);

  function updateField<K extends keyof WeddingStoryInput>(
    key: K,
    fieldValue: WeddingStoryInput[K],
  ) {
    onChange({ ...value, [key]: fieldValue });
  }

  async function uploadImageFile(
    file: File,
    onProgress?: (progress: number) => void,
  ) {
    if (!value.slug) throw new Error("Set a slug before uploading images.");
    return uploadStoryImage(value.slug, file, onProgress);
  }

  async function handleAddGalleryImages(files: File[]) {
    if (!files.length) return;

    setUploadError("");
    onUploadState(true);

    let nextGallery = [...value.gallery];
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

        nextGallery = [
          ...nextGallery,
          {
            src: result.url,
            alt: value.title || "Wedding story image",
            aspect: "aspect-[4/5]",
            span: "md:col-span-6",
          },
        ];
        updateField("gallery", nextGallery);
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

  async function handleCoverImageUpload(file: File) {
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

      updateField("cover", {
        src: result.url,
        alt: value.cover?.alt || value.title || "Wedding story cover",
        aspect: value.cover?.aspect || "aspect-[4/5] md:aspect-[16/10]",
      });

      setUploadLabel(`Cover image ready · ${formatCompressionSummary({
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
    } finally {
      onUploadState(false);
    }
  }

  function moveGalleryItem(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= value.gallery.length) return;
    const next = [...value.gallery];
    [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
    updateField("gallery", next);
  }

  function removeGalleryItem(index: number) {
    updateField(
      "gallery",
      value.gallery.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function updateGalleryItem(index: number, nextItem: WeddingStoryImage) {
    updateField(
      "gallery",
      value.gallery.map((item, itemIndex) =>
        itemIndex === index ? nextItem : item,
      ),
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4 border border-taupe/40 bg-ivory-dark p-4 sm:p-6">
        <h3 className="label-editorial text-soft-black">Story Details</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" required>
            <input
              required
              value={value.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={dashboardInputClass}
              placeholder="e.g. An Alpine Celebration"
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

          <Field label="Couple Names">
            <input
              value={value.couple}
              onChange={(e) => updateField("couple", e.target.value)}
              className={dashboardInputClass}
              placeholder="e.g. Emma & James"
            />
          </Field>

          <Field label="Location">
            <input
              value={value.location}
              onChange={(e) => updateField("location", e.target.value)}
              className={dashboardInputClass}
              placeholder="e.g. Park City, Utah"
            />
          </Field>

          <Field label="Date">
            <input
              value={value.date}
              onChange={(e) => updateField("date", e.target.value)}
              className={dashboardInputClass}
              placeholder="e.g. August 2025"
            />
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

        <Field label="Excerpt">
          <textarea
            rows={2}
            value={value.excerpt}
            onChange={(e) => updateField("excerpt", e.target.value)}
            className={`${dashboardInputClass} resize-y`}
            placeholder="A short summary appearing on the listing page."
          />
        </Field>

        <Field label="Story Paragraphs (one per line)">
          <textarea
            rows={6}
            value={value.story.join("\n")}
            onChange={(e) => updateField("story", e.target.value.split("\n"))}
            className={`${dashboardInputClass} resize-y leading-relaxed`}
            placeholder="Paragraph 1...&#10;Paragraph 2..."
          />
        </Field>

        <div className="flex flex-wrap gap-6">
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

      {/* Cover Media */}
      <section className="space-y-4 border border-taupe/40 bg-ivory-dark p-4 sm:p-6">
        <h3 className="label-editorial text-soft-black">Cover Image</h3>
        <p className="text-xs leading-relaxed text-soft-black-muted">
          {imageCompressionHint()}
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowLibraryPicker("cover")}
            className="label-editorial min-h-[2.75rem] border border-taupe/40 bg-ivory px-4 py-2.5 text-soft-black transition-colors hover:bg-ivory-dark"
          >
            Browse Library
          </button>
          <div className="flex items-end">
            <MediaUploadRow
              label="Upload cover image"
              disabled={uploading || !value.slug}
              onFiles={(files) => {
                if (files[0]) handleCoverImageUpload(files[0]).catch(() => undefined);
              }}
            />
          </div>
        </div>

        {value.cover?.src && (
          <div className="mt-4">
            <MediaPreviewThumb src={value.cover.src} alt={value.cover.alt} className="max-w-[8rem]" />
            <p className="break-all mt-2 text-xs text-soft-black-muted">
              {value.cover.src}
            </p>
          </div>
        )}
      </section>

      {/* Gallery */}
      <section className="space-y-4 border border-taupe/40 bg-ivory-dark p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="label-editorial text-soft-black">Gallery Sequence</h3>
          <span className="text-xs text-soft-black-muted">
            {value.gallery.length} item{value.gallery.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowLibraryPicker("gallery")}
            className="label-editorial min-h-[2.75rem] border border-taupe/40 bg-ivory px-4 py-2.5 text-soft-black transition-colors hover:bg-ivory-dark"
          >
            Browse Library
          </button>
          <div className="flex items-end">
            <MediaUploadRow
              label="Upload new images"
              multiple
              disabled={uploading || !value.slug}
              onFiles={(files) => handleAddGalleryImages(files).catch(() => undefined)}
            />
          </div>
        </div>

        {value.gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {value.gallery.map((item, index) => (
              <GalleryMediaTile
                key={`${item.src}-${index}`}
                item={item}
                index={index}
                total={value.gallery.length}
                onMoveEarlier={() => moveGalleryItem(index, index - 1)}
                onMoveLater={() => moveGalleryItem(index, index + 1)}
                onRemove={() => removeGalleryItem(index)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-soft-black-muted">
            No gallery media yet. Upload images to build the story sequence.
          </p>
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
        {saving ? "Saving…" : isNew ? "Create Story" : "Save Changes"}
      </button>

      {showLibraryPicker && (
        <MediaLibraryPicker
          onSelect={(images) => {
            if (images.length === 0) return;

            if (showLibraryPicker === "cover") {
              // Set the first selected image as cover
              updateField("cover", {
                src: images[0].src,
                alt: images[0].alt || value.title || "Wedding story cover",
                aspect: value.cover?.aspect || "aspect-[4/5] md:aspect-[16/10]",
              });
            } else {
              // Add to gallery sequence
              const nextGallery = [
                ...value.gallery,
                ...images.map((img) => ({
                  src: img.src,
                  alt: img.alt || value.title || "Wedding story image",
                  aspect: "aspect-[4/5]",
                  span: "md:col-span-6",
                })),
              ];
              updateField("gallery", nextGallery);
            }
            setShowLibraryPicker(null);
          }}
          onClose={() => setShowLibraryPicker(null)}
        />
      )}
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

function MediaUploadRow({
  label,
  disabled,
  multiple,
  onFiles,
}: {
  label: string;
  disabled?: boolean;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
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
          onFiles(Array.from(selected));
          e.target.value = "";
        }}
      />
    </label>
  );
}

function MediaPreviewThumb({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
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
    </div>
  );
}

function GalleryMediaTile({
  item,
  index,
  total,
  onMoveEarlier,
  onMoveLater,
  onRemove,
}: {
  item: WeddingStoryImage;
  index: number;
  total: number;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group relative aspect-square overflow-hidden border border-taupe/30 bg-taupe/10">
      {item.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.src}
          alt={item.alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-soft-black-muted">
          No preview
        </div>
      )}

      <span className="absolute top-1 right-1 rounded-full bg-soft-black/55 px-1.5 py-0.5 text-[10px] text-ivory">
        {index + 1}
      </span>

      <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-0.5 bg-soft-black/75 p-1 transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0">
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
