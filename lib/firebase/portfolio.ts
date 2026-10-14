import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { portfolioProjects as staticPortfolioProjects } from "@/data/portfolio";
import { getFirestoreDb } from "@/lib/firebase";
import type {
  PortfolioMedia,
  PortfolioProjectInput,
  PortfolioProjectRecord,
} from "@/types/portfolio";

const COLLECTION = "portfolioProjects";

function timestampToDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  return null;
}

function serializeMedia(media: PortfolioMedia) {
  if (media.type === "image") {
    return {
      type: "image",
      src: media.src,
      alt: media.alt,
      title: media.title ?? null,
      width: media.width,
      height: media.height,
      curated: media.curated === true,
    };
  }

  return {
    type: "video",
    src: media.src,
    poster: media.poster,
    alt: media.alt,
    title: media.title ?? null,
    duration: media.duration ?? null,
  };
}

function deserializeMedia(data: Record<string, unknown>): PortfolioMedia | null {
  const type = data.type;
  if (type === "image") {
    return {
      type: "image",
      src: String(data.src ?? ""),
      alt: String(data.alt ?? ""),
      title: data.title ? String(data.title) : undefined,
      width: Number(data.width ?? 1600),
      height: Number(data.height ?? 1200),
      curated: data.curated === true,
    };
  }

  if (type === "video") {
    return {
      type: "video",
      src: String(data.src ?? ""),
      poster: String(data.poster ?? ""),
      alt: String(data.alt ?? ""),
      title: data.title ? String(data.title) : undefined,
      duration: data.duration ? String(data.duration) : undefined,
    };
  }

  return null;
}

function deserializeProject(
  id: string,
  data: Record<string, unknown>,
): PortfolioProjectRecord {
  const mediaRaw = Array.isArray(data.media) ? data.media : [];
  const media = mediaRaw
    .map((item) =>
      item && typeof item === "object"
        ? deserializeMedia(item as Record<string, unknown>)
        : null,
    )
    .filter((item): item is PortfolioMedia => item !== null);

  const coverRaw =
    data.cover && typeof data.cover === "object"
      ? deserializeMedia(data.cover as Record<string, unknown>)
      : null;

  const fallbackCover: PortfolioMedia = {
    type: "image",
    src: "",
    alt: "",
    width: 1600,
    height: 1200,
  };

  return {
    id,
    slug: String(data.slug ?? id),
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    location: String(data.location ?? ""),
    category: (data.category as PortfolioProjectRecord["category"]) ?? "wedding",
    year: String(data.year ?? ""),
    featured: Boolean(data.featured),
    published: Boolean(data.published),
    sortOrder: Number(data.sortOrder ?? 0),
    gridSpan: data.gridSpan ? String(data.gridSpan) : undefined,
    gridAspect: data.gridAspect ? String(data.gridAspect) : undefined,
    cover: coverRaw ?? media[0] ?? fallbackCover,
    media,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

function serializeProject(input: PortfolioProjectInput) {
  return {
    slug: input.slug.trim(),
    title: input.title.trim(),
    description: input.description.trim(),
    location: input.location.trim(),
    category: input.category,
    year: input.year.trim(),
    featured: Boolean(input.featured),
    published: Boolean(input.published),
    sortOrder: Number(input.sortOrder) || 0,
    gridSpan: input.gridSpan?.trim() || null,
    gridAspect: input.gridAspect?.trim() || null,
    cover: serializeMedia(input.cover),
    media: input.media.map(serializeMedia),
    updatedAt: serverTimestamp(),
  };
}

export function slugifyPortfolioTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function getAllPortfolioProjectsAdmin(): Promise<
  PortfolioProjectRecord[]
> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy("sortOrder", "asc")),
  );

  return snapshot.docs.map((entry) =>
    deserializeProject(entry.id, entry.data() as Record<string, unknown>),
  );
}

export async function getPublishedPortfolioProjects(): Promise<
  PortfolioProjectRecord[]
> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION),
      where("published", "==", true),
      orderBy("sortOrder", "asc"),
    ),
  );

  return snapshot.docs.map((entry) =>
    deserializeProject(entry.id, entry.data() as Record<string, unknown>),
  );
}

export async function getPortfolioProjectFromFirestore(
  slug: string,
): Promise<PortfolioProjectRecord | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, slug);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;

  const record = deserializeProject(
    snapshot.id,
    snapshot.data() as Record<string, unknown>,
  );

  if (!record.published) return null;
  return record;
}

export async function createPortfolioProject(
  input: PortfolioProjectInput,
): Promise<string> {
  const slug = input.slug.trim();
  if (!slug) throw new Error("Project slug is required.");

  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, slug);
  const existing = await getDoc(docRef);
  if (existing.exists()) {
    throw new Error("A project with this slug already exists.");
  }

  await setDoc(docRef, {
    ...serializeProject(input),
    createdAt: serverTimestamp(),
  });

  return slug;
}

export async function updatePortfolioProject(
  slug: string,
  input: PortfolioProjectInput,
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, slug);
  await updateDoc(docRef, serializeProject({ ...input, slug }));
}

export async function deletePortfolioProject(slug: string): Promise<void> {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, COLLECTION, slug));
}

export async function seedPortfolioFromStatic(): Promise<number> {
  const db = getFirestoreDb();
  const existing = await getDocs(collection(db, COLLECTION));
  if (!existing.empty) {
    throw new Error("Portfolio collection is not empty.");
  }

  const batch = writeBatch(db);

  staticPortfolioProjects.forEach((project, index) => {
    const docRef = doc(db, COLLECTION, project.slug);
    batch.set(docRef, {
      slug: project.slug,
      title: project.title,
      description: project.description,
      location: project.location,
      category: project.category,
      year: project.year,
      featured: Boolean(project.featured),
      published: true,
      sortOrder: index,
      gridSpan: project.gridSpan ?? null,
      gridAspect: project.gridAspect ?? null,
      cover: serializeMedia(project.cover),
      media: project.media.map(serializeMedia),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  return staticPortfolioProjects.length;
}

export function projectHasVideo(project: {
  media: PortfolioMedia[];
  cover: PortfolioMedia;
}) {
  return (
    project.cover.type === "video" ||
    project.media.some((item) => item.type === "video")
  );
}

export function projectHasImage(project: {
  media: PortfolioMedia[];
  cover: PortfolioMedia;
}) {
  return (
    project.cover.type === "image" ||
    project.media.some((item) => item.type === "image")
  );
}
