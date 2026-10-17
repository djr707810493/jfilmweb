"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DashboardPageHeader,
  dashboardInputClass,
  dashboardSelectClass,
} from "@/components/dashboard/dashboard-layout";
import { MediaLibraryPicker } from "@/components/dashboard/media-library-picker";
import { WebsiteVideoSection } from "@/components/dashboard/website-video-section";
import {
  formatCompressionSummary,
  imageCompressionHint,
} from "@/lib/image-compress";
import { uploadCoveragePoster, uploadCoverageVideo, uploadHeroImage, uploadIntroImage, uploadQuotePoster, uploadQuoteVideo } from "@/lib/firebase/storage";
import {
  createDefaultCoverageVideo,
  createDefaultHeroSlide,
  createDefaultIntroImage,
  createHeroButton,
  createHeroSlide,
  getCoverageVideo,
  getHeroSettings,
  getIntroImage,
  getQuoteVideo,
  HERO_MAX_BUTTONS,
  saveCoverageVideo,
  saveHeroSettings,
  saveIntroImage,
  saveQuoteVideo,
} from "@/lib/firebase/website";
import { isDirectVideoFileUrl, isValidVideoEmbedUrl } from "@/lib/video-embed";
import type { CoverageVideo, HeroButton, HeroCopy, HeroSlide, IntroImage } from "@/types/website";

export function AdminWebsitePanel() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [expandedSlideId, setExpandedSlideId] = useState<string | null>(null);
  const [introImage, setIntroImage] = useState<IntroImage>(createDefaultIntroImage());
  const [coverageVideo, setCoverageVideo] = useState<CoverageVideo>(createDefaultCoverageVideo());
  const [coverageSaving, setCoverageSaving] = useState(false);
  const [coverageUploading, setCoverageUploading] = useState(false);
  const [quoteVideo, setQuoteVideo] = useState<CoverageVideo>(createDefaultCoverageVideo());
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [quoteUploading, setQuoteUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [introUploading, setIntroUploading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [showLibrary, setShowLibrary] = useState<"hero" | "intro" | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [hero, intro, coverage, quote] = await Promise.all([
        getHeroSettings(),
        getIntroImage(),
        getCoverageVideo(),
        getQuoteVideo(),
      ]);
      const nextSlides =
        hero.slides.length > 0 ? hero.slides : [createDefaultHeroSlide()];
      setSlides(nextSlides);
      setIntroImage(intro);
      setCoverageVideo(coverage);
      setQuoteVideo(quote);
    } catch {
      setError("Could not load website settings. Check admin access and Firestore rules.");
      setSlides([createDefaultHeroSlide()]);
      setIntroImage(createDefaultIntroImage());
      setCoverageVideo(createDefaultCoverageVideo());
      setQuoteVideo(createDefaultCoverageVideo());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  function toggleSlide(id: string) {
    setExpandedSlideId((current) => (current === id ? null : id));
  }

  function updateSlide(index: number, patch: Partial<HeroSlide>) {
    setSlides((current) =>
      current.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    );
  }

  function updateSlideCopy(index: number, patch: Partial<HeroCopy>) {
    setSlides((current) =>
      current.map((slide, i) =>
        i === index ? { ...slide, copy: { ...slide.copy, ...patch } } : slide,
      ),
    );
  }

  function updateButton(
    slideIndex: number,
    buttonIndex: number,
    patch: Partial<HeroButton>,
  ) {
    setSlides((current) =>
      current.map((slide, i) => {
        if (i !== slideIndex) return slide;
        return {
          ...slide,
          copy: {
            ...slide.copy,
            buttons: slide.copy.buttons.map((button, j) =>
              j === buttonIndex ? { ...button, ...patch } : button,
            ),
          },
        };
      }),
    );
  }

  function addButton(slideIndex: number) {
    setSlides((current) =>
      current.map((slide, i) => {
        if (i !== slideIndex) return slide;
        if (slide.copy.buttons.length >= HERO_MAX_BUTTONS) return slide;
        return {
          ...slide,
          copy: {
            ...slide.copy,
            buttons: [...slide.copy.buttons, createHeroButton()],
          },
        };
      }),
    );
  }

  function removeButton(slideIndex: number, buttonIndex: number) {
    setSlides((current) =>
      current.map((slide, i) => {
        if (i !== slideIndex) return slide;
        return {
          ...slide,
          copy: {
            ...slide.copy,
            buttons: slide.copy.buttons.filter((_, j) => j !== buttonIndex),
          },
        };
      }),
    );
  }

  function moveSlide(from: number, to: number) {
    setSlides((current) => {
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function removeSlide(index: number) {
    setSlides((current) => {
      const removed = current[index];
      const next = current.filter((_, i) => i !== index);
      if (removed && expandedSlideId === removed.id) {
        setExpandedSlideId(null);
      }
      return next;
    });
  }

  function addSlides(nextSlides: HeroSlide[]) {
    setSlides((current) => [...current, ...nextSlides]);
    const last = nextSlides[nextSlides.length - 1];
    if (last) setExpandedSlideId(last.id);
  }

  async function handleUpload(files: File[]) {
    if (!files.length) return;

    setError("");
    setUploading(true);
    const failures: string[] = [];
    let successCount = 0;
    const uploaded: HeroSlide[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const position = `${index + 1}/${files.length}`;
      setStatus(`${position}: Preparing ${file.name}…`);

      try {
        const result = await uploadHeroImage(file, (progress) => {
          if (progress < 30) {
            setStatus(`${position}: Preparing ${file.name}…`);
          } else if (progress < 40) {
            setStatus(`${position}: Compressing ${file.name}…`);
          } else {
            setStatus(`${position}: Uploading ${file.name}… ${progress}%`);
          }
        });

        uploaded.push(
          createHeroSlide(
            result.url,
            file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          ),
        );
        successCount += 1;
        setStatus(
          `${position}: Ready · ${formatCompressionSummary({
            file,
            originalSize: file.size,
            compressedSize: result.compressedSize,
            width: result.width,
            height: result.height,
            skippedCompression: result.skippedCompression,
          })}`,
        );
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Image upload failed.";
        failures.push(`${file.name}: ${message}`);
      }
    }

    if (uploaded.length > 0) addSlides(uploaded);
    setUploading(false);

    if (successCount > 0) {
      setStatus(
        `Added ${successCount} image${successCount === 1 ? "" : "s"}. Edit the open slide, then save.`,
      );
    }

    if (failures.length > 0) {
      setError(
        failures.length === files.length
          ? failures[0]
          : `${failures.length} of ${files.length} uploads failed. ${failures[0]}`,
      );
    }
  }

  async function replaceIntroImage(file: File) {
    setError("");
    setIntroUploading(true);
    setStatus(`Preparing ${file.name}…`);

    try {
      const result = await uploadIntroImage(file, (progress) => {
        if (progress < 30) {
          setStatus(`Preparing ${file.name}…`);
        } else if (progress < 40) {
          setStatus(`Compressing ${file.name}…`);
        } else {
          setStatus(`Uploading ${file.name}… ${progress}%`);
        }
      });

      const nextImage: IntroImage = {
        src: result.url,
        alt: introImage.alt || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        width: result.width,
        height: result.height,
      };

      await saveIntroImage(nextImage);
      setIntroImage(nextImage);
      setStatus(
        `The Studio image replaced · ${formatCompressionSummary({
          file,
          originalSize: file.size,
          compressedSize: result.compressedSize,
          width: result.width,
          height: result.height,
          skippedCompression: result.skippedCompression,
        })}`,
      );
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "Image upload failed.";
      setError(message);
    } finally {
      setIntroUploading(false);
    }
  }

  async function replaceIntroFromLibrary(src: string, alt: string) {
    setError("");
    setIntroUploading(true);
    try {
      const nextImage: IntroImage = {
        src,
        alt: alt || introImage.alt,
        width: introImage.width,
        height: introImage.height,
      };
      await saveIntroImage(nextImage);
      setIntroImage(nextImage);
      setStatus("The Studio image replaced from the library.");
    } catch {
      setError("Could not save The Studio image.");
    } finally {
      setIntroUploading(false);
    }
  }

  async function handleSaveIntroAlt() {
    setError("");
    try {
      await saveIntroImage(introImage);
      setStatus("The Studio image alt text saved.");
    } catch {
      setError("Could not save The Studio image.");
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setStatus("");

    try {
      await saveHeroSettings(slides);
      setStatus("Hero saved. Each image keeps its own title, copy, and buttons.");
    } catch {
      setError("Could not save hero settings. Check admin access and Firestore rules.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCoverage() {
    const src = coverageVideo.src.trim();
    if (src && !isValidVideoEmbedUrl(src) && !isDirectVideoFileUrl(src)) {
      setError("Coverage video must be a YouTube/Vimeo link or an uploaded mp4/webm file.");
      return;
    }
    setCoverageSaving(true);
    setError("");
    try {
      await saveCoverageVideo(coverageVideo);
      setStatus("Coverage video saved. It now shows above the package cards.");
    } catch {
      setError("Could not save coverage video.");
    } finally {
      setCoverageSaving(false);
    }
  }

  async function handleUploadCoverageVideo(file: File) {
    setError("");
    setCoverageUploading(true);
    setStatus(`Uploading ${file.name}…`);
    try {
      const url = await uploadCoverageVideo(file, (progress) => {
        setStatus(`Uploading ${file.name}… ${progress}%`);
      });
      const next = { ...coverageVideo, src: url };
      setCoverageVideo(next);
      await saveCoverageVideo(next);
      setStatus("Coverage video uploaded and saved.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Video upload failed.");
    } finally {
      setCoverageUploading(false);
    }
  }

  async function handleUploadCoveragePoster(file: File) {
    setError("");
    setCoverageUploading(true);
    try {
      const result = await uploadCoveragePoster(file);
      const next = { ...coverageVideo, poster: result.url };
      setCoverageVideo(next);
      await saveCoverageVideo(next);
      setStatus("Coverage poster saved.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Poster upload failed.");
    } finally {
      setCoverageUploading(false);
    }
  }

  async function handleRemoveCoverage() {
    setError("");
    setCoverageSaving(true);
    try {
      const next = createDefaultCoverageVideo();
      setCoverageVideo(next);
      await saveCoverageVideo(next);
      setStatus("Coverage video removed.");
    } catch {
      setError("Could not remove coverage video.");
    } finally {
      setCoverageSaving(false);
    }
  }

  async function handleSaveQuote() {
    const src = quoteVideo.src.trim();
    if (src && !isValidVideoEmbedUrl(src) && !isDirectVideoFileUrl(src)) {
      setError("Quote video must be a YouTube/Vimeo link or an uploaded mp4/webm file.");
      return;
    }
    setQuoteSaving(true);
    setError("");
    try {
      await saveQuoteVideo(quoteVideo);
      setStatus("Quote helper video saved. It now plays from the red ? in the quote tool.");
    } catch {
      setError("Could not save quote video.");
    } finally {
      setQuoteSaving(false);
    }
  }

  async function handleUploadQuoteVideo(file: File) {
    setError("");
    setQuoteUploading(true);
    setStatus(`Uploading ${file.name}…`);
    try {
      const url = await uploadQuoteVideo(file, (progress) => {
        setStatus(`Uploading ${file.name}… ${progress}%`);
      });
      const next = { ...quoteVideo, src: url };
      setQuoteVideo(next);
      await saveQuoteVideo(next);
      setStatus("Quote helper video uploaded and saved.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Video upload failed.");
    } finally {
      setQuoteUploading(false);
    }
  }

  async function handleUploadQuotePoster(file: File) {
    setError("");
    setQuoteUploading(true);
    try {
      const result = await uploadQuotePoster(file);
      const next = { ...quoteVideo, poster: result.url };
      setQuoteVideo(next);
      await saveQuoteVideo(next);
      setStatus("Quote poster saved.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Poster upload failed.");
    } finally {
      setQuoteUploading(false);
    }
  }

  async function handleRemoveQuote() {
    setError("");
    setQuoteSaving(true);
    try {
      const next = createDefaultCoverageVideo();
      setQuoteVideo(next);
      await saveQuoteVideo(next);
      setStatus("Quote helper video removed.");
    } catch {
      setError("Could not remove quote video.");
    } finally {
      setQuoteSaving(false);
    }
  }

  const busy = saving || uploading || introUploading || coverageSaving || coverageUploading || quoteSaving || quoteUploading;

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Website"
        title="Homepage"
        description="Manage the hero carousel and The Studio portrait. Images are compressed automatically."
      />

      {loading ? (
        <p className="text-sm text-soft-black-muted">Loading website settings…</p>
      ) : (
        <div className="max-w-4xl space-y-10">
          <section className="space-y-4">
            <h2 className="label-editorial text-soft-black">Hero slides</h2>
            <p className="text-xs leading-relaxed text-soft-black-muted">
              Click a slide to expand its title, copy, and buttons.{" "}
              {imageCompressionHint()}
            </p>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center">
                <span className="label-editorial min-h-[2.75rem] border border-taupe/40 bg-ivory px-4 py-2.5 text-soft-black transition-colors hover:bg-ivory-dark">
                  Upload images
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  multiple
                  disabled={busy}
                  className="sr-only"
                  onChange={(event) => {
                    const selected = event.target.files;
                    if (!selected?.length) return;
                    handleUpload(Array.from(selected)).catch(() => undefined);
                    event.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowLibrary("hero")}
                className="label-editorial min-h-[2.75rem] border border-taupe/40 bg-ivory px-4 py-2.5 text-soft-black transition-colors hover:bg-ivory-dark"
              >
                Browse library
              </button>
            </div>

            {slides.length === 0 ? (
              <p className="border border-taupe/40 bg-ivory-dark px-4 py-6 text-sm text-soft-black-muted">
                No slides yet. Upload images or pick from the library.
              </p>
            ) : (
              <ul className="space-y-3">
                {slides.map((slide, index) => {
                  const expanded = expandedSlideId === slide.id;
                  return (
                    <li
                      key={slide.id}
                      className="border border-taupe/40 bg-ivory-dark"
                    >
                      <div className="flex items-center gap-3 p-3 sm:p-4">
                        <button
                          type="button"
                          onClick={() => toggleSlide(slide.id)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          aria-expanded={expanded}
                        >
                          <span className="relative size-14 shrink-0 overflow-hidden bg-taupe/10 sm:size-16">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={slide.src}
                              alt=""
                              className="size-full object-cover"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="label-editorial block text-soft-black">
                              Slide {index + 1}
                            </span>
                            <span className="mt-1 block truncate text-sm text-soft-black-muted">
                              {slide.copy.headline || "Untitled slide"}
                            </span>
                          </span>
                          <span className="label-editorial shrink-0 text-taupe">
                            {expanded ? "Collapse" : "Edit"}
                          </span>
                        </button>

                        <div className="flex shrink-0 flex-wrap gap-1 sm:gap-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveSlide(index, index - 1)}
                            className="label-editorial min-h-[2.5rem] border border-taupe/40 bg-ivory px-2.5 text-soft-black disabled:opacity-30 sm:px-3"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            disabled={index === slides.length - 1}
                            onClick={() => moveSlide(index, index + 1)}
                            className="label-editorial min-h-[2.5rem] border border-taupe/40 bg-ivory px-2.5 text-soft-black disabled:opacity-30 sm:px-3"
                          >
                            Down
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSlide(index)}
                            className="label-editorial min-h-[2.5rem] border border-taupe/40 bg-ivory px-2.5 text-red-800 sm:px-3"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {expanded && (
                        <div className="space-y-5 border-t border-taupe/30 p-4 sm:p-6">
                          <div className="relative aspect-[16/9] max-w-md overflow-hidden bg-taupe/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={slide.src}
                              alt=""
                              className="size-full object-cover"
                            />
                          </div>

                          <label className="block text-sm text-soft-black">
                            <span className="label-editorial text-soft-black">
                              Image alt text
                            </span>
                            <input
                              type="text"
                              value={slide.alt}
                              onChange={(event) =>
                                updateSlide(index, { alt: event.target.value })
                              }
                              className={dashboardInputClass}
                              placeholder="Describe the photo"
                            />
                          </label>

                          <div className="grid gap-4 border-t border-taupe/30 pt-5">
                            <p className="label-editorial text-soft-black">
                              This slide’s overlay
                            </p>
                            <label className="block text-sm text-soft-black">
                              <span className="label-editorial text-soft-black">
                                Eyebrow label
                              </span>
                              <input
                                type="text"
                                value={slide.copy.label}
                                onChange={(event) =>
                                  updateSlideCopy(index, {
                                    label: event.target.value,
                                  })
                                }
                                className={dashboardInputClass}
                                placeholder="J FILM STUDIO"
                                maxLength={80}
                              />
                            </label>
                            <label className="block text-sm text-soft-black">
                              <span className="label-editorial text-soft-black">
                                Title
                              </span>
                              <input
                                type="text"
                                value={slide.copy.headline}
                                onChange={(event) =>
                                  updateSlideCopy(index, {
                                    headline: event.target.value,
                                  })
                                }
                                className={dashboardInputClass}
                                placeholder="Utah Photographer & Videographer"
                                maxLength={120}
                              />
                            </label>
                            <label className="block text-sm text-soft-black">
                              <span className="label-editorial text-soft-black">
                                Body
                              </span>
                              <textarea
                                value={slide.copy.body}
                                onChange={(event) =>
                                  updateSlideCopy(index, {
                                    body: event.target.value,
                                  })
                                }
                                className={`${dashboardInputClass} min-h-[6.5rem] resize-y`}
                                placeholder="Short introduction under the title"
                                maxLength={500}
                              />
                            </label>
                          </div>

                          <div className="space-y-3 border-t border-taupe/30 pt-5">
                            <div className="flex items-end justify-between gap-3">
                              <p className="label-editorial text-soft-black">
                                Buttons
                              </p>
                              <button
                                type="button"
                                onClick={() => addButton(index)}
                                disabled={
                                  slide.copy.buttons.length >= HERO_MAX_BUTTONS
                                }
                                className="label-editorial min-h-[2.5rem] border border-taupe/40 bg-ivory px-3 text-soft-black disabled:opacity-30"
                              >
                                Add button
                              </button>
                            </div>
                            <p className="text-xs text-soft-black-muted">
                              Paths like <code>/portfolio</code>,{" "}
                              <code>#contact</code>, or a full URL.
                            </p>

                            {slide.copy.buttons.length === 0 ? (
                              <p className="text-sm text-soft-black-muted">
                                No buttons on this slide.
                              </p>
                            ) : (
                              <ul className="space-y-3">
                                {slide.copy.buttons.map((button, buttonIndex) => (
                                  <li
                                    key={button.id}
                                    className="grid gap-3 border border-taupe/30 bg-ivory p-3 sm:grid-cols-2"
                                  >
                                    <label className="block text-sm text-soft-black">
                                      <span className="label-editorial text-soft-black">
                                        Label
                                      </span>
                                      <input
                                        type="text"
                                        value={button.label}
                                        onChange={(event) =>
                                          updateButton(index, buttonIndex, {
                                            label: event.target.value,
                                          })
                                        }
                                        className={dashboardInputClass}
                                        placeholder="View Portfolio"
                                        maxLength={60}
                                      />
                                    </label>
                                    <label className="block text-sm text-soft-black">
                                      <span className="label-editorial text-soft-black">
                                        Link
                                      </span>
                                      <input
                                        type="text"
                                        value={button.href}
                                        onChange={(event) =>
                                          updateButton(index, buttonIndex, {
                                            href: event.target.value,
                                          })
                                        }
                                        className={dashboardInputClass}
                                        placeholder="/portfolio or #contact"
                                      />
                                    </label>
                                    <label className="block text-sm text-soft-black">
                                      <span className="label-editorial text-soft-black">
                                        Style
                                      </span>
                                      <select
                                        value={button.style}
                                        onChange={(event) =>
                                          updateButton(index, buttonIndex, {
                                            style:
                                              event.target.value === "secondary"
                                                ? "secondary"
                                                : "primary",
                                          })
                                        }
                                        className={dashboardSelectClass}
                                      >
                                        <option value="primary">Filled</option>
                                        <option value="secondary">Outline</option>
                                      </select>
                                    </label>
                                    <div className="flex items-end">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeButton(index, buttonIndex)
                                        }
                                        className="label-editorial min-h-[2.5rem] border border-taupe/40 px-3 text-red-800"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={busy}
              className="label-editorial min-h-[3rem] border border-soft-black bg-soft-black px-6 py-3 text-ivory disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save hero"}
            </button>
          </section>

          <section className="space-y-4 border-t border-taupe/30 pt-10">
            <h2 className="label-editorial text-soft-black">The Studio</h2>
            <p className="text-xs leading-relaxed text-soft-black-muted">
              One portrait beside the studio copy. Replace it anytime — the new
              file is compressed and saved immediately.
            </p>

            <div className="grid gap-6 border border-taupe/40 bg-ivory-dark p-4 sm:grid-cols-[10rem_1fr] sm:p-6">
              <div className="relative aspect-[3/4] overflow-hidden bg-taupe/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={introImage.src}
                  alt=""
                  className="size-full object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <label className="block text-sm text-soft-black">
                  <span className="label-editorial text-soft-black">Alt text</span>
                  <input
                    type="text"
                    value={introImage.alt}
                    onChange={(event) =>
                      setIntroImage((current) => ({
                        ...current,
                        alt: event.target.value,
                      }))
                    }
                    onBlur={() => handleSaveIntroAlt()}
                    className={dashboardInputClass}
                    placeholder="Describe the portrait"
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center">
                    <span className="label-editorial min-h-[2.75rem] border border-taupe/40 bg-ivory px-4 py-2.5 text-soft-black transition-colors hover:bg-ivory-dark">
                      {introUploading ? "Replacing…" : "Replace image"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      disabled={busy}
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        replaceIntroImage(file).catch(() => undefined);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLibrary("intro")}
                    disabled={busy}
                    className="label-editorial min-h-[2.75rem] border border-taupe/40 bg-ivory px-4 py-2.5 text-soft-black disabled:opacity-40"
                  >
                    Browse library
                  </button>
                </div>
              </div>
            </div>
          </section>

          <WebsiteVideoSection
            title="Coverage video"
            description="Explains the package differences. Shows above the coverage cards on the homepage. Paste a YouTube/Vimeo link or upload an mp4 (under 200MB)."
            captionPlaceholder="What makes each package different"
            emptyHint="No coverage video yet — the homepage skips this block until you add one."
            value={coverageVideo}
            saving={coverageSaving}
            uploading={coverageUploading}
            busy={busy}
            onChange={setCoverageVideo}
            onSave={() => handleSaveCoverage()}
            onRemove={() => handleRemoveCoverage()}
            onUploadVideo={(file) => handleUploadCoverageVideo(file).catch(() => undefined)}
            onUploadPoster={(file) => handleUploadCoveragePoster(file).catch(() => undefined)}
          />

          <WebsiteVideoSection
            title="Quote helper video"
            description="Short video explaining 1 operator vs 2 operators. Plays from the red ? in the instant quote tool. Upload a short cut here — separate from the homepage coverage video."
            captionPlaceholder="1 operator vs 2 operators"
            emptyHint="No helper video yet — the red ? falls back to the coverage video above."
            value={quoteVideo}
            saving={quoteSaving}
            uploading={quoteUploading}
            busy={busy}
            onChange={setQuoteVideo}
            onSave={() => handleSaveQuote()}
            onRemove={() => handleRemoveQuote()}
            onUploadVideo={(file) => handleUploadQuoteVideo(file).catch(() => undefined)}
            onUploadPoster={(file) => handleUploadQuotePoster(file).catch(() => undefined)}
          />

          {status && (
            <p className="text-sm text-soft-black-muted">{status}</p>
          )}
          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      {showLibrary && (
        <MediaLibraryPicker
          onSelect={(images) => {
            if (images.length === 0) {
              setShowLibrary(null);
              return;
            }

            if (showLibrary === "intro") {
              const first = images[0];
              replaceIntroFromLibrary(first.src, first.alt).catch(() => undefined);
              setShowLibrary(null);
              return;
            }

            addSlides(
              images.map((image) => createHeroSlide(image.src, image.alt)),
            );
            setShowLibrary(null);
            setStatus(
              `Added ${images.length} image${images.length === 1 ? "" : "s"}. Edit the open slide, then save.`,
            );
          }}
          onClose={() => setShowLibrary(null)}
        />
      )}
    </div>
  );
}
