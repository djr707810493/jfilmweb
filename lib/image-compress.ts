/**
 * Website image compression — performance first.
 * Target: WebP, longest edge 1920px, about 250KB.
 * Used by portfolio, stories, hero, and inquiry image uploads.
 */
export const IMAGE_MAX_BYTES = 250 * 1024;
export const IMAGE_MAX_DIMENSION = 1920;
export const IMAGE_MAX_ORIGINAL_MB = 20;
export const IMAGE_MIN_DIMENSION = 1280;

/** @deprecated Use IMAGE_MAX_BYTES */
export const PORTFOLIO_IMAGE_MAX_BYTES = IMAGE_MAX_BYTES;
/** @deprecated Use IMAGE_MAX_DIMENSION */
export const PORTFOLIO_IMAGE_MAX_DIMENSION = IMAGE_MAX_DIMENSION;
/** @deprecated Use IMAGE_MAX_ORIGINAL_MB */
export const PORTFOLIO_IMAGE_MAX_ORIGINAL_MB = IMAGE_MAX_ORIGINAL_MB;

export type CompressionResult = {
  file: File;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  skippedCompression: boolean;
};

export function imageCompressionHint(): string {
  return `Images are compressed to WebP, max ${IMAGE_MAX_DIMENSION}px on the long edge and about ${Math.round(IMAGE_MAX_BYTES / 1024)}KB, so pages stay fast.`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function renderToCanvas(
  source: HTMLImageElement,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not prepare image for compression.");
  }

  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

function scaleDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function isAlreadyOptimized(
  file: File,
  width: number,
  height: number,
): boolean {
  return (
    file.type === "image/webp" &&
    file.size <= IMAGE_MAX_BYTES &&
    width <= IMAGE_MAX_DIMENSION &&
    height <= IMAGE_MAX_DIMENSION
  );
}

async function loadImage(
  file: File,
): Promise<{ image: HTMLImageElement; objectUrl: string }> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () =>
        reject(new Error("Could not read image file. Try JPG, PNG, or WebP."));
      element.src = objectUrl;
    });

    return { image, objectUrl };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

async function compressCanvas(
  canvas: HTMLCanvasElement,
): Promise<{ blob: Blob; mimeType: string }> {
  const attempts: { type: string; quality: number }[] = [
    { type: "image/webp", quality: 0.78 },
    { type: "image/webp", quality: 0.7 },
    { type: "image/webp", quality: 0.62 },
    { type: "image/webp", quality: 0.54 },
    { type: "image/webp", quality: 0.46 },
    { type: "image/jpeg", quality: 0.72 },
    { type: "image/jpeg", quality: 0.62 },
    { type: "image/jpeg", quality: 0.52 },
  ];

  for (const attempt of attempts) {
    const blob = await canvasToBlob(canvas, attempt.type, attempt.quality);
    if (blob && blob.size <= IMAGE_MAX_BYTES) {
      return { blob, mimeType: attempt.type };
    }
  }

  const fallback = await canvasToBlob(canvas, "image/jpeg", 0.45);
  if (!fallback) {
    throw new Error("Could not compress image.");
  }

  return { blob: fallback, mimeType: "image/jpeg" };
}

function toCompressedFile(
  blob: Blob,
  mimeType: string,
  originalName: string,
): File {
  const extension = mimeType === "image/webp" ? "webp" : "jpg";
  const baseName = originalName.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.${extension}`, {
    type: mimeType,
    lastModified: Date.now(),
  });
}

export async function compressPortfolioImage(
  file: File,
): Promise<CompressionResult> {
  if (!file.type.startsWith("image/") && file.type !== "") {
    const looksLikeImage = /\.(jpe?g|png|webp|heic|heif|gif)$/i.test(file.name);
    if (!looksLikeImage) {
      throw new Error("Only image files can be uploaded.");
    }
  }

  if (file.size > IMAGE_MAX_ORIGINAL_MB * 1024 * 1024) {
    throw new Error(
      `Image must be under ${IMAGE_MAX_ORIGINAL_MB}MB before compression.`,
    );
  }

  const { image, objectUrl } = await loadImage(file);

  try {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    if (isAlreadyOptimized(file, naturalWidth, naturalHeight)) {
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        width: naturalWidth,
        height: naturalHeight,
        skippedCompression: true,
      };
    }

    let { width, height } = scaleDimensions(
      naturalWidth,
      naturalHeight,
      IMAGE_MAX_DIMENSION,
    );

    let canvas = await renderToCanvas(image, width, height);
    let { blob, mimeType } = await compressCanvas(canvas);

    while (
      blob.size > IMAGE_MAX_BYTES &&
      Math.max(width, height) > IMAGE_MIN_DIMENSION
    ) {
      width = Math.max(1, Math.round(width * 0.85));
      height = Math.max(1, Math.round(height * 0.85));
      canvas = await renderToCanvas(image, width, height);
      ({ blob, mimeType } = await compressCanvas(canvas));
    }

    if (blob.size > IMAGE_MAX_BYTES) {
      throw new Error(
        `Could not compress ${file.name} below ${formatBytes(IMAGE_MAX_BYTES)}.`,
      );
    }

    const dimensionsUnchanged =
      width === naturalWidth && height === naturalHeight;
    if (
      dimensionsUnchanged &&
      file.size <= IMAGE_MAX_BYTES &&
      blob.size >= file.size
    ) {
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        width: naturalWidth,
        height: naturalHeight,
        skippedCompression: true,
      };
    }

    const compressedFile = toCompressedFile(blob, mimeType, file.name);

    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      width,
      height,
      skippedCompression: false,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function formatCompressionSummary(result: CompressionResult): string {
  const dimensions = `${result.width}×${result.height}`;

  if (result.skippedCompression) {
    return `${formatBytes(result.compressedSize)} · original (${dimensions})`;
  }

  return `${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (${dimensions})`;
}
