"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-layout";
import { WebsiteAiFilmSection } from "@/components/dashboard/website-ai-film-section";
import { WebsiteVideoSection } from "@/components/dashboard/website-video-section";
import { formatCompressionSummary } from "@/lib/image-compress";
import {
  uploadAiFilmPoster,
  uploadAiFilmVideo,
  uploadCoveragePoster,
  uploadCoverageVideo,
  uploadQuotePoster,
  uploadQuoteVideo,
} from "@/lib/firebase/storage";
import {
  createDefaultAiFilmFilms,
  createDefaultCoverageVideo,
  getAiFilmFilms,
  getCoverageVideo,
  getQuoteVideo,
  saveAiFilmFilms,
  saveCoverageVideo,
  saveQuoteVideo,
} from "@/lib/firebase/website";
import { isDirectVideoFileUrl, isValidVideoEmbedUrl } from "@/lib/video-embed";
import type { AiFilmVideo, CoverageVideo } from "@/types/website";

export function AdminWebsitePanel() {
  const [coverageVideo, setCoverageVideo] = useState<CoverageVideo>(createDefaultCoverageVideo());
  const [coverageSaving, setCoverageSaving] = useState(false);
  const [coverageUploading, setCoverageUploading] = useState(false);
  const [quoteVideo, setQuoteVideo] = useState<CoverageVideo>(createDefaultCoverageVideo());
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [quoteUploading, setQuoteUploading] = useState(false);
  const [aiFilms, setAiFilms] = useState<AiFilmVideo[]>(createDefaultAiFilmFilms);
  const [aiFilmSaving, setAiFilmSaving] = useState(false);
  const [aiFilmUploadingId, setAiFilmUploadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [coverage, quote, films] = await Promise.all([
        getCoverageVideo(),
        getQuoteVideo(),
        getAiFilmFilms(),
      ]);
      setCoverageVideo(coverage);
      setQuoteVideo(quote);
      setAiFilms(films);
    } catch {
      setError("Could not load website settings. Check admin access and Firestore rules.");
      setCoverageVideo(createDefaultCoverageVideo());
      setQuoteVideo(createDefaultCoverageVideo());
      setAiFilms(createDefaultAiFilmFilms());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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

  function updateAiFilm(id: string, patch: Partial<AiFilmVideo>) {
    setAiFilms((current) =>
      current.map((film) => (film.id === id ? { ...film, ...patch } : film)),
    );
  }

  async function handleSaveAiFilms() {
    const invalid = aiFilms.find((film) => {
      const src = film.src.trim();
      return src.length > 0 && !isValidVideoEmbedUrl(src) && !isDirectVideoFileUrl(src);
    });
    if (invalid) {
      setError(
        `"${invalid.title}" needs a YouTube/Vimeo link or an uploaded mp4/webm file.`,
      );
      return;
    }

    setAiFilmSaving(true);
    setError("");
    try {
      await saveAiFilmFilms(aiFilms);
      setStatus("AI Film showcase saved. The /ai-film page now uses these videos.");
    } catch {
      setError("Could not save the AI Film showcase.");
    } finally {
      setAiFilmSaving(false);
    }
  }

  async function handleUploadAiFilmVideo(id: string, file: File) {
    setError("");
    setAiFilmUploadingId(id);
    setStatus(`Uploading ${file.name}…`);
    try {
      const url = await uploadAiFilmVideo(file, (progress) => {
        setStatus(`Uploading ${file.name}… ${progress}%`);
      });
      const next = aiFilms.map((film) =>
        film.id === id ? { ...film, src: url } : film,
      );
      setAiFilms(next);
      await saveAiFilmFilms(next);
      setStatus("AI Film video uploaded and saved.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Video upload failed.");
    } finally {
      setAiFilmUploadingId(null);
    }
  }

  async function handleUploadAiFilmPoster(id: string, file: File) {
    setError("");
    setAiFilmUploadingId(id);
    try {
      const result = await uploadAiFilmPoster(file);
      const next = aiFilms.map((film) =>
        film.id === id ? { ...film, poster: result.url } : film,
      );
      setAiFilms(next);
      await saveAiFilmFilms(next);
      setStatus(
        `AI Film poster saved · ${formatCompressionSummary({
          file,
          originalSize: file.size,
          compressedSize: result.compressedSize,
          width: result.width,
          height: result.height,
          skippedCompression: result.skippedCompression,
        })}`,
      );
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Poster upload failed.");
    } finally {
      setAiFilmUploadingId(null);
    }
  }

  const busy =
    coverageSaving ||
    coverageUploading ||
    quoteSaving ||
    quoteUploading ||
    aiFilmSaving ||
    aiFilmUploadingId !== null;

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Website"
        title="Homepage videos"
        description="Manage the coverage and quote videos plus the AI Film showcase. The homepage hero and studio portrait are fixed in code, so they no longer appear here."
      />

      {loading ? (
        <p className="text-sm text-soft-black-muted">Loading website settings…</p>
      ) : (
        <div className="max-w-4xl space-y-10">
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

          <WebsiteAiFilmSection
            films={aiFilms}
            saving={aiFilmSaving}
            uploadingId={aiFilmUploadingId}
            busy={busy}
            onChange={updateAiFilm}
            onSave={() => handleSaveAiFilms()}
            onUploadVideo={(id, file) =>
              handleUploadAiFilmVideo(id, file).catch(() => undefined)
            }
            onUploadPoster={(id, file) =>
              handleUploadAiFilmPoster(id, file).catch(() => undefined)
            }
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
    </div>
  );
}
