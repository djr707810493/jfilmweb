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
import { getFirestoreDb } from "@/lib/firebase";
import { weddingStories as staticStories } from "@/data/wedding-stories";
import type {
  WeddingStoryImage,
  WeddingStoryInput,
  WeddingStoryRecord,
} from "@/types/wedding-story";

const COLLECTION = "weddingStories";

function timestampToDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  return null;
}

function serializeImage(image: WeddingStoryImage): Record<string, string> {
  const result: Record<string, string> = {
    src: image.src,
    alt: image.alt,
  };
  if (image.span) result.span = image.span;
  if (image.aspect) result.aspect = image.aspect;
  return result;
}

function deserializeImage(data: Record<string, unknown>): WeddingStoryImage {
  return {
    src: String(data.src ?? ""),
    alt: String(data.alt ?? ""),
    span: data.span ? String(data.span) : undefined,
    aspect: data.aspect ? String(data.aspect) : undefined,
  };
}

function deserializeStory(
  id: string,
  data: Record<string, unknown>,
): WeddingStoryRecord {
  const storyRaw = Array.isArray(data.story) ? data.story : [];
  const galleryRaw = Array.isArray(data.gallery) ? data.gallery : [];

  return {
    id,
    slug: String(data.slug ?? id),
    couple: String(data.couple ?? ""),
    title: String(data.title ?? ""),
    location: String(data.location ?? ""),
    date: String(data.date ?? ""),
    excerpt: String(data.excerpt ?? ""),
    story: storyRaw.map((p) => String(p)),
    cover: deserializeImage((data.cover as Record<string, unknown>) || {}),
    gallery: galleryRaw.map((img) =>
      deserializeImage(img as Record<string, unknown>),
    ),
    published: Boolean(data.published),
    sortOrder: Number(data.sortOrder ?? 0),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

function serializeStory(input: WeddingStoryInput) {
  return {
    slug: input.slug.trim(),
    couple: input.couple.trim(),
    title: input.title.trim(),
    location: input.location.trim(),
    date: input.date.trim(),
    excerpt: input.excerpt.trim(),
    story: input.story.map((p) => p.trim()).filter(Boolean),
    cover: serializeImage(input.cover),
    gallery: input.gallery.map(serializeImage),
    published: Boolean(input.published),
    sortOrder: Number(input.sortOrder) || 0,
    updatedAt: serverTimestamp(),
  };
}

export function slugifyStoryTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function getAllWeddingStoriesAdmin(): Promise<
  WeddingStoryRecord[]
> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy("sortOrder", "asc")),
  );

  return snapshot.docs.map((entry) =>
    deserializeStory(entry.id, entry.data() as Record<string, unknown>),
  );
}

export async function getPublishedWeddingStories(): Promise<
  WeddingStoryRecord[]
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
    deserializeStory(entry.id, entry.data() as Record<string, unknown>),
  );
}

export async function getWeddingStoryFromFirestore(
  slug: string,
): Promise<WeddingStoryRecord | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, slug);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;

  const record = deserializeStory(
    snapshot.id,
    snapshot.data() as Record<string, unknown>,
  );

  if (!record.published) return null;
  return record;
}

export async function createWeddingStory(
  input: WeddingStoryInput,
): Promise<string> {
  const slug = input.slug.trim();
  if (!slug) throw new Error("Story slug is required.");

  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, slug);
  const existing = await getDoc(docRef);
  if (existing.exists()) {
    throw new Error("A story with this slug already exists.");
  }

  await setDoc(docRef, {
    ...serializeStory(input),
    createdAt: serverTimestamp(),
  });

  return slug;
}

export async function updateWeddingStory(
  slug: string,
  input: WeddingStoryInput,
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, slug);
  await updateDoc(docRef, serializeStory({ ...input, slug }));
}

export async function deleteWeddingStory(slug: string): Promise<void> {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, COLLECTION, slug));
}

export async function seedStoriesFromStatic(): Promise<number> {
  const db = getFirestoreDb();
  const existing = await getDocs(collection(db, COLLECTION));
  if (!existing.empty) {
    throw new Error("Stories collection is not empty.");
  }

  const batch = writeBatch(db);

  staticStories.forEach((story, index) => {
    const docRef = doc(db, COLLECTION, story.slug);
    batch.set(docRef, {
      ...story,
      published: true,
      sortOrder: index,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  return staticStories.length;
}
