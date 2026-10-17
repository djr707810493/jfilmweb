import {
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { heroContent, introContent } from "@/data/homepage";
import type {
  CoverageVideo,
  HeroButton,
  HeroCopy,
  HeroSettings,
  HeroSlide,
  IntroImage,
} from "@/types/website";

const COLLECTION = "website";
const HERO_DOC = "hero";
const INTRO_DOC = "intro";
const COVERAGE_DOC = "coverage";
const QUOTE_VIDEO_DOC = "quote-video";
export const HERO_INTERVAL_MS = 5000;
export const HERO_MAX_BUTTONS = 3;

export function createDefaultHeroCopy(): HeroCopy {
  return {
    label: heroContent.label,
    headline: heroContent.headline,
    body: heroContent.subheadline,
    buttons: [
      {
        id: "portfolio",
        label: "View Portfolio",
        href: "/portfolio",
        style: "primary",
      },
      {
        id: "contact",
        label: "Inquire About Your Date",
        href: "#contact",
        style: "secondary",
      },
    ],
  };
}

export function createDefaultHeroSlide(): HeroSlide {
  return {
    id: "default",
    src: heroContent.image.fallback,
    alt: heroContent.image.alt,
    copy: createDefaultHeroCopy(),
  };
}

export function createHeroButton(): HeroButton {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `button-${Date.now()}`,
    label: "",
    href: "/",
    style: "secondary",
  };
}

function createSlideId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createHeroSlide(src: string, alt: string): HeroSlide {
  return {
    id: createSlideId(),
    src,
    alt,
    copy: createDefaultHeroCopy(),
  };
}

function sanitizeHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) {
    return "";
  }

  return trimmed.slice(0, 500);
}

function deserializeButtons(raw: unknown, fallbackToDefault: boolean): HeroButton[] {
  if (!Array.isArray(raw)) {
    return fallbackToDefault ? createDefaultHeroCopy().buttons : [];
  }

  return raw
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const button = entry as Record<string, unknown>;
      const label = String(button.label ?? "").trim();
      const href = sanitizeHref(String(button.href ?? ""));
      if (!label || !href) return null;

      return {
        id: String(button.id ?? `button-${index}`),
        label: label.slice(0, 60),
        href,
        style: button.style === "secondary" ? "secondary" : "primary",
      } satisfies HeroButton;
    })
    .filter((button): button is HeroButton => button !== null)
    .slice(0, HERO_MAX_BUTTONS);
}

function deserializeCopy(
  raw: unknown,
  fallback: HeroCopy,
): HeroCopy {
  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const copy = raw as Record<string, unknown>;
  const hasCopyFields =
    "headline" in copy || "label" in copy || "body" in copy || "buttons" in copy;

  if (!hasCopyFields) {
    return fallback;
  }

  return {
    label: String(copy.label ?? "").trim().slice(0, 80),
    headline:
      String(copy.headline ?? "").trim().slice(0, 120) || fallback.headline,
    body: String(copy.body ?? "").trim().slice(0, 500),
    buttons: deserializeButtons(copy.buttons, true),
  };
}

function serializeCopy(copy: HeroCopy): HeroCopy {
  const defaults = createDefaultHeroCopy();
  return {
    label: copy.label.trim().slice(0, 80),
    headline: copy.headline.trim().slice(0, 120) || defaults.headline,
    body: copy.body.trim().slice(0, 500),
    buttons: copy.buttons
      .map((button, index) => ({
        id: button.id.trim() || `button-${index + 1}`,
        label: button.label.trim().slice(0, 60),
        href: sanitizeHref(button.href),
        style: button.style === "secondary" ? "secondary" : "primary",
      } satisfies HeroButton))
      .filter((button) => button.label.length > 0 && button.href.length > 0)
      .slice(0, HERO_MAX_BUTTONS),
  };
}

function deserializeSlides(
  data: Record<string, unknown>,
  sharedCopy: HeroCopy,
): HeroSlide[] {
  const raw = Array.isArray(data.slides) ? data.slides : [];

  return raw
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const slide = entry as Record<string, unknown>;
      const src = String(slide.src ?? "").trim();
      if (!src) return null;

      return {
        id: String(slide.id ?? `slide-${index}`),
        src,
        alt: String(slide.alt ?? "").trim() || heroContent.image.alt,
        copy: deserializeCopy(slide.copy, sharedCopy),
      };
    })
    .filter((slide): slide is HeroSlide => slide !== null);
}

function serializeSlides(slides: HeroSlide[]): Array<
  Omit<HeroSlide, "copy"> & { copy: HeroCopy }
> {
  return slides
    .map((slide, index) => ({
      id: slide.id.trim() || `slide-${index + 1}`,
      src: slide.src.trim(),
      alt: slide.alt.trim() || heroContent.image.alt,
      copy: serializeCopy(slide.copy ?? createDefaultHeroCopy()),
    }))
    .filter((slide) => slide.src.length > 0);
}

export async function getHeroSettings(): Promise<HeroSettings> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, COLLECTION, HERO_DOC));
  const defaults = createDefaultHeroCopy();

  if (!snapshot.exists()) {
    return { slides: [] };
  }

  const data = snapshot.data() as Record<string, unknown>;
  const sharedCopy = deserializeCopy(data.copy, defaults);

  return {
    slides: deserializeSlides(data, sharedCopy),
  };
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const settings = await getHeroSettings();
  return settings.slides;
}

export async function saveHeroSettings(slides: HeroSlide[]): Promise<void> {
  const db = getFirestoreDb();

  await setDoc(
    doc(db, COLLECTION, HERO_DOC),
    {
      slides: serializeSlides(slides),
      copy: deleteField(),
      intervalMs: HERO_INTERVAL_MS,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function createDefaultIntroImage(): IntroImage {
  return {
    src: introContent.image.src,
    alt: introContent.image.alt,
    width: introContent.image.width,
    height: introContent.image.height,
  };
}

export async function getIntroImage(): Promise<IntroImage> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, COLLECTION, INTRO_DOC));
  const fallback = createDefaultIntroImage();

  if (!snapshot.exists()) return fallback;

  const data = snapshot.data() as Record<string, unknown>;
  const src = String(data.src ?? "").trim();
  if (!src) return fallback;

  return {
    src,
    alt: String(data.alt ?? "").trim() || fallback.alt,
    width: Number(data.width) || fallback.width,
    height: Number(data.height) || fallback.height,
  };
}

export async function saveIntroImage(image: IntroImage): Promise<void> {
  const db = getFirestoreDb();
  const fallback = createDefaultIntroImage();

  await setDoc(
    doc(db, COLLECTION, INTRO_DOC),
    {
      src: image.src.trim(),
      alt: image.alt.trim() || fallback.alt,
      width: Number(image.width) || fallback.width,
      height: Number(image.height) || fallback.height,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function createDefaultCoverageVideo(): CoverageVideo {
  return { src: "", poster: "", title: "" };
}

export async function getCoverageVideo(): Promise<CoverageVideo> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, COLLECTION, COVERAGE_DOC));
  const fallback = createDefaultCoverageVideo();

  if (!snapshot.exists()) return fallback;

  const data = snapshot.data() as Record<string, unknown>;
  return {
    src: String(data.src ?? "").trim(),
    poster: String(data.poster ?? "").trim(),
    title: String(data.title ?? "").trim() || fallback.title,
  };
}

export async function saveCoverageVideo(video: CoverageVideo): Promise<void> {
  const db = getFirestoreDb();

  await setDoc(
    doc(db, COLLECTION, COVERAGE_DOC),
    {
      src: video.src.trim(),
      poster: video.poster.trim(),
      title: video.title.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getQuoteVideo(): Promise<CoverageVideo> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, COLLECTION, QUOTE_VIDEO_DOC));
  const fallback = createDefaultCoverageVideo();

  if (!snapshot.exists()) return fallback;

  const data = snapshot.data() as Record<string, unknown>;
  return {
    src: String(data.src ?? "").trim(),
    poster: String(data.poster ?? "").trim(),
    title: String(data.title ?? "").trim() || fallback.title,
  };
}

export async function saveQuoteVideo(video: CoverageVideo): Promise<void> {
  const db = getFirestoreDb();

  await setDoc(
    doc(db, COLLECTION, QUOTE_VIDEO_DOC),
    {
      src: video.src.trim(),
      poster: video.poster.trim(),
      title: video.title.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
