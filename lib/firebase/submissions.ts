import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { siteConfig } from "@/data/site";
import type {
  Submission,
  SubmissionInput,
  SubmissionRecord,
  SubmissionStatus,
} from "@/types/submission";
import { normalizeServiceType } from "@/types/submission";
import type { InquiryQuote } from "@/types/inquiry-quote";
import { sanitizeQuote } from "@/types/inquiry-quote";

const COLLECTION = "submissions";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createSubmission(
  data: SubmissionInput,
  attachmentUrls: string[] = [],
  submissionId: string = crypto.randomUUID(),
  userId?: string | null,
): Promise<string> {
  const db = getFirestoreDb();
  const docRef = doc(collection(db, COLLECTION), submissionId);

  await setDoc(docRef, {
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    phone: data.phone?.trim() || null,
    serviceType: data.serviceType,
    preferredDate: data.preferredDate || null,
    location: data.location?.trim() || null,
    budget: data.budget?.trim() || null,
    message: data.message.trim(),
    attachmentUrls,
    status: "new",
    userId: userId ?? null,
    quote: null,
    createdAt: serverTimestamp(),
  });

  // Automatically queue an email notification via EmailJS (client-side)
  // This will be executed by the client after creating the submission
  return submissionId;
}

export async function linkSubmissionToUser(
  submissionId: string,
  userId: string,
  inquiryEmail: string,
  accountEmail: string,
): Promise<void> {
  if (normalizeEmail(inquiryEmail) !== normalizeEmail(accountEmail)) {
    throw new Error(
      "Account email must match the email used on your inquiry.",
    );
  }

  const db = getFirestoreDb();
  await updateDoc(doc(db, COLLECTION, submissionId), {
    userId,
    linkedAt: serverTimestamp(),
  });
}

export async function linkUnclaimedSubmissionsForUser(
  userId: string,
  accountEmail: string,
): Promise<number> {
  const email = normalizeEmail(accountEmail);
  const db = getFirestoreDb();

  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where("email", "==", email),
      where("userId", "==", null),
    ),
  );

  if (snap.empty) return 0;

  await Promise.all(
    snap.docs.map((docSnap) =>
      updateDoc(doc(db, COLLECTION, docSnap.id), {
        userId,
        linkedAt: serverTimestamp(),
      }),
    ),
  );

  return snap.size;
}

export async function getAllSubmissions(): Promise<SubmissionRecord[]> {
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, COLLECTION));

  return snap.docs
    .map((docSnap) => mapSubmissionRecord(docSnap.id, docSnap.data()))
    .sort((a, b) =>
      createdAtSortKey(b.createdAt).localeCompare(createdAtSortKey(a.createdAt)),
    );
}

export async function getClientSubmissions(
  userId: string,
  accountEmail?: string,
): Promise<SubmissionRecord[]> {
  const db = getFirestoreDb();
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("userId", "==", userId)),
  );

  const byId = new Map<string, SubmissionRecord>();

  for (const docSnap of snap.docs) {
    byId.set(docSnap.id, mapSubmissionRecord(docSnap.id, docSnap.data()));
  }

  if (accountEmail) {
    const emailSnap = await getDocs(
      query(
        collection(db, COLLECTION),
        where("email", "==", normalizeEmail(accountEmail)),
        where("userId", "==", null),
      ),
    );

    for (const docSnap of emailSnap.docs) {
      byId.set(docSnap.id, mapSubmissionRecord(docSnap.id, docSnap.data()));
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    createdAtSortKey(b.createdAt).localeCompare(createdAtSortKey(a.createdAt)),
  );
}

export type AdminSubmissionUpdate = {
  name: string;
  email: string;
  phone?: string | null;
  serviceType: Submission["serviceType"];
  preferredDate?: string | null;
  location?: string | null;
  budget?: string | null;
  message: string;
  status: SubmissionStatus;
  attachmentUrls: string[];
  userId?: string | null;
};

export async function updateSubmissionAdmin(
  submissionId: string,
  data: AdminSubmissionUpdate,
): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, COLLECTION, submissionId), {
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    phone: data.phone?.trim() || null,
    serviceType: data.serviceType,
    preferredDate: data.preferredDate || null,
    location: data.location?.trim() || null,
    budget: data.budget?.trim() || null,
    message: data.message.trim(),
    status: data.status,
    attachmentUrls: data.attachmentUrls,
    userId: data.userId ?? null,
    updatedAt: serverTimestamp(),
  });
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus,
): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, COLLECTION, submissionId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function updateSubmissionQuote(
  submissionId: string,
  quote: InquiryQuote,
  publish: boolean,
): Promise<InquiryQuote> {
  const db = getFirestoreDb();
  const sanitized = sanitizeQuote({
    ...quote,
    status: publish ? "published" : "draft",
  });

  const payload: InquiryQuote = {
    ...sanitized,
    updatedAt: new Date().toISOString(),
    publishedAt: publish
      ? new Date().toISOString()
      : sanitized.publishedAt ?? null,
  };

  await updateDoc(doc(db, COLLECTION, submissionId), {
    quote: payload,
    updatedAt: serverTimestamp(),
  });

  return payload;
}

export async function deleteSubmission(submissionId: string): Promise<void> {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, COLLECTION, submissionId));
}

function mapSubmissionRecord(
  id: string,
  data: Record<string, unknown>,
): SubmissionRecord {
  return {
    id,
    name: data.name as string,
    email: data.email as string,
    phone: (data.phone as string | null | undefined) ?? null,
    serviceType: normalizeServiceType(data.serviceType),
    preferredDate: (data.preferredDate as string | null | undefined) ?? null,
    location: (data.location as string | null | undefined) ?? null,
    budget: (data.budget as string | null | undefined) ?? null,
    message: data.message as string,
    status: normalizeSubmissionStatus(data.status),
    attachmentUrls: (data.attachmentUrls as string[] | undefined) ?? [],
    userId: (data.userId as string | null | undefined) ?? null,
    createdAt: String(data.createdAt ?? ""),
    linkedAt: data.linkedAt ? String(data.linkedAt) : null,
    updatedAt: data.updatedAt ? String(data.updatedAt) : null,
    quote: mapInquiryQuote(data.quote),
  };
}

function mapInquiryQuote(value: unknown): InquiryQuote | null {
  if (!value || typeof value !== "object") return null;

  const quote = value as Record<string, unknown>;
  const packagesRaw = Array.isArray(quote.packages) ? quote.packages : [];

  return {
    introMessage: (quote.introMessage as string | null | undefined) ?? null,
    status: quote.status === "published" ? "published" : "draft",
    updatedAt: quote.updatedAt ? String(quote.updatedAt) : null,
    publishedAt: quote.publishedAt ? String(quote.publishedAt) : null,
    packages: packagesRaw
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const pkg = item as Record<string, unknown>;
        return {
          id: String(pkg.id ?? crypto.randomUUID()),
          name: String(pkg.name ?? ""),
          serviceType: normalizeServiceType(pkg.serviceType),
          price: String(pkg.price ?? ""),
          duration: String(pkg.duration ?? ""),
          includes: Array.isArray(pkg.includes)
            ? pkg.includes.map(String)
            : [],
          bonuses: Array.isArray(pkg.bonuses)
            ? pkg.bonuses.map(String)
            : [],
          optionalAddons: Array.isArray(pkg.optionalAddons)
            ? pkg.optionalAddons.map(String)
            : [],
          notes: (pkg.notes as string | null | undefined) ?? null,
          recommended: Boolean(pkg.recommended),
        };
      }),
  };
}

function normalizeSubmissionStatus(status: unknown): SubmissionStatus {
  if (status === "reviewed") return "reviewing";
  const valid: SubmissionStatus[] = [
    "new",
    "reviewing",
    "contacted",
    "booked",
    "declined",
    "archived",
  ];
  if (typeof status === "string" && valid.includes(status as SubmissionStatus)) {
    return status as SubmissionStatus;
  }
  return "new";
}

function createdAtSortKey(value: string | Date): string {
  return typeof value === "string" ? value : value.toISOString();
}

export function formatSubmissionDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
