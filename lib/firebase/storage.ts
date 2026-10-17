import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTask,
} from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";
import {
  compressPortfolioImage,
  IMAGE_MAX_BYTES,
  IMAGE_MAX_ORIGINAL_MB,
} from "@/lib/image-compress";
import { MAX_ATTACHMENT_SIZE_MB } from "@/types/submission";

export type UploadProgress = {
  fileName: string;
  progress: number;
};

const EXTENSION_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  mov: "video/quicktime",
  mp4: "video/mp4",
  webm: "video/webm",
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function resolveContentType(file: File): string {
  if (file.type) return file.type;

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME[ext] ?? "application/octet-stream";
}

function isAllowedMedia(file: File): boolean {
  const type = resolveContentType(file);
  return type.startsWith("image/") || type.startsWith("video/");
}

export function validateMediaFile(file: File): string | null {
  if (!isAllowedMedia(file)) {
    return `${file.name}: only images and videos are allowed.`;
  }

  if (file.size > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024) {
    return `${file.name}: file must be under ${MAX_ATTACHMENT_SIZE_MB}MB.`;
  }

  return null;
}

/** Upload client inquiry attachments to Storage */
export async function uploadSubmissionMedia(
  submissionId: string,
  files: File[],
  onProgress?: (update: UploadProgress) => void,
): Promise<string[]> {
  const storage = getFirebaseStorage();
  const urls: string[] = [];

  for (const file of files) {
    const isImage = resolveContentType(file).startsWith("image/");
    const prepared = isImage ? (await compressPortfolioImage(file)).file : file;
    const path = `submissions/${submissionId}/${Date.now()}-${sanitizeFileName(prepared.name)}`;
    const storageRef = ref(storage, path);

    const url = await uploadWithProgress(storageRef, prepared, (progress) => {
      onProgress?.({ fileName: file.name, progress });
    });

    urls.push(url);
  }

  return urls;
}

const MAX_IMAGE_UPLOAD_BYTES = IMAGE_MAX_BYTES;

export function validatePortfolioImageFile(file: File): string | null {
  if (!resolveContentType(file).startsWith("image/")) {
    return `${file.name}: only images can be uploaded to the gallery.`;
  }

  if (file.size > IMAGE_MAX_ORIGINAL_MB * 1024 * 1024) {
    return `${file.name}: image must be under ${IMAGE_MAX_ORIGINAL_MB}MB before compression.`;
  }

  return null;
}

/** @deprecated Use validatePortfolioImageFile */
export function validatePortfolioMediaFile(file: File): string | null {
  return validatePortfolioImageFile(file);
}

/**
 * Compress and upload a portfolio image.
 * Path: portfolio/{category}/{slug}/{filename}
 */
export async function uploadPortfolioImage(
  category: string,
  slug: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{
  url: string;
  width: number;
  height: number;
  compressedSize: number;
  skippedCompression: boolean;
}> {
  const compressed = await prepareCompressedImage(file, onProgress);
  const path = `portfolio/${category}/${slug}/${Date.now()}-${sanitizeFileName(compressed.file.name)}`;
  return finishCompressedUpload(path, compressed, onProgress);
}

export async function uploadStoryImage(
  slug: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{
  url: string;
  width: number;
  height: number;
  compressedSize: number;
  skippedCompression: boolean;
}> {
  const compressed = await prepareCompressedImage(file, onProgress);
  const path = `stories/${slug}/${Date.now()}-${sanitizeFileName(compressed.file.name)}`;
  return finishCompressedUpload(path, compressed, onProgress);
}

export async function uploadHeroImage(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{
  url: string;
  width: number;
  height: number;
  compressedSize: number;
  skippedCompression: boolean;
}> {
  const compressed = await prepareCompressedImage(file, onProgress);
  const path = `website/hero/${Date.now()}-${sanitizeFileName(compressed.file.name)}`;
  return finishCompressedUpload(path, compressed, onProgress);
}

export async function uploadIntroImage(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{
  url: string;
  width: number;
  height: number;
  compressedSize: number;
  skippedCompression: boolean;
}> {
  const compressed = await prepareCompressedImage(file, onProgress);
  const path = `website/intro/${Date.now()}-${sanitizeFileName(compressed.file.name)}`;
  return finishCompressedUpload(path, compressed, onProgress);
}

const MAX_COVERAGE_VIDEO_BYTES = 200 * 1024 * 1024;

export function validateCoverageVideoFile(file: File): string | null {
  const type = resolveContentType(file);
  if (!type.startsWith("video/")) {
    return "Please choose a video file (mp4, webm, or mov).";
  }
  if (file.size > MAX_COVERAGE_VIDEO_BYTES) {
    return "Video must be under 200MB. For larger films, paste a YouTube or Vimeo link instead.";
  }
  return null;
}

export async function uploadCoverageVideo(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const invalid = validateCoverageVideoFile(file);
  if (invalid) throw new Error(invalid);
  const storage = getFirebaseStorage();
  const path = `website/coverage/${Date.now()}-${sanitizeFileName(file.name)}`;
  const storageRef = ref(storage, path);
  return uploadWithProgress(storageRef, file, onProgress);
}

export async function uploadCoveragePoster(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{
  url: string;
  width: number;
  height: number;
  compressedSize: number;
  skippedCompression: boolean;
}> {
  const compressed = await prepareCompressedImage(file, onProgress);
  const path = `website/coverage/${Date.now()}-${sanitizeFileName(compressed.file.name)}`;
  return finishCompressedUpload(path, compressed, onProgress);
}

export async function uploadQuoteVideo(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const invalid = validateCoverageVideoFile(file);
  if (invalid) throw new Error(invalid);
  const storage = getFirebaseStorage();
  const path = `website/quote/${Date.now()}-${sanitizeFileName(file.name)}`;
  const storageRef = ref(storage, path);
  return uploadWithProgress(storageRef, file, onProgress);
}

export async function uploadQuotePoster(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{
  url: string;
  width: number;
  height: number;
  compressedSize: number;
  skippedCompression: boolean;
}> {
  const compressed = await prepareCompressedImage(file, onProgress);
  const path = `website/quote/${Date.now()}-${sanitizeFileName(compressed.file.name)}`;
  return finishCompressedUpload(path, compressed, onProgress);
}

async function prepareCompressedImage(
  file: File,
  onProgress?: (progress: number) => void,
) {
  const validationError = validatePortfolioImageFile(file);
  if (validationError) throw new Error(validationError);

  onProgress?.(5);
  const compressed = await compressPortfolioImage(file);
  onProgress?.(compressed.skippedCompression ? 30 : 35);

  if (compressed.file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Compressed image is still too large to upload.");
  }

  return compressed;
}

async function finishCompressedUpload(
  path: string,
  compressed: Awaited<ReturnType<typeof compressPortfolioImage>>,
  onProgress?: (progress: number) => void,
) {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);

  const url = await uploadWithProgress(storageRef, compressed.file, (progress) => {
    onProgress?.(35 + Math.round(progress * 0.65));
  });

  return {
    url,
    width: compressed.width,
    height: compressed.height,
    compressedSize: compressed.compressedSize,
    skippedCompression: compressed.skippedCompression,
  };
}

export async function uploadPortfolioMedia(
  category: string,
  slug: string,
  file: File,
): Promise<string> {
  const result = await uploadPortfolioImage(category, slug, file);
  return result.url;
}

function uploadWithProgress(
  storageRef: ReturnType<typeof ref>,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const contentType = resolveContentType(file);

    const task: UploadTask = uploadBytesResumable(storageRef, file, {
      contentType,
    });

    task.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      },
    );
  });
}
