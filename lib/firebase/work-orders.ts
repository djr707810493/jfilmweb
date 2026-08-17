import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { sanitizeQuotePackage } from "@/types/inquiry-quote";
import type { InquiryQuotePackage } from "@/types/inquiry-quote";
import type { SubmissionRecord } from "@/types/submission";
import type {
  WorkOrder,
  WorkOrderRecord,
  WorkOrderStatus,
} from "@/types/work-order";

const COLLECTION = "workOrders";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapWorkOrderRecord(
  id: string,
  data: Record<string, unknown>,
): WorkOrderRecord {
  const snapshotRaw = data.packageSnapshot;
  const snapshot =
    snapshotRaw && typeof snapshotRaw === "object"
      ? (snapshotRaw as Record<string, unknown>)
      : {};

  const packageSnapshot: InquiryQuotePackage = sanitizeQuotePackage({
    id: String(snapshot.id ?? data.packageId ?? ""),
    name: String(snapshot.name ?? ""),
    serviceType: (snapshot.serviceType as InquiryQuotePackage["serviceType"]) ?? "photography",
    price: String(snapshot.price ?? ""),
    duration: String(snapshot.duration ?? ""),
    includes: Array.isArray(snapshot.includes)
      ? snapshot.includes.map(String)
      : [],
    bonuses: Array.isArray(snapshot.bonuses)
      ? snapshot.bonuses.map(String)
      : [],
    optionalAddons: Array.isArray(snapshot.optionalAddons)
      ? snapshot.optionalAddons.map(String)
      : [],
    notes: (snapshot.notes as string | null | undefined) ?? null,
    recommended: Boolean(snapshot.recommended),
  });

  return {
    id,
    submissionId: String(data.submissionId ?? ""),
    userId: String(data.userId ?? ""),
    clientEmail: String(data.clientEmail ?? ""),
    clientName: String(data.clientName ?? ""),
    inquiryServiceType:
      (data.inquiryServiceType as WorkOrder["inquiryServiceType"]) ?? "photography",
    packageId: String(data.packageId ?? packageSnapshot.id),
    packageSnapshot,
    status: normalizeWorkOrderStatus(data.status),
    adminNotes: (data.adminNotes as string | null | undefined) ?? null,
    contractLink: normalizeOptionalLink(data.contractLink),
    workDriveLink: normalizeOptionalLink(data.workDriveLink),
    createdAt: String(data.createdAt ?? ""),
    updatedAt: data.updatedAt ? String(data.updatedAt) : null,
  };
}

function normalizeOptionalLink(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeWorkOrderStatus(status: unknown): WorkOrderStatus {
  const valid: WorkOrderStatus[] = [
    "negotiating",
    "deposit_contract",
    "awaiting_service",
    "awaiting_delivery",
    "delivered",
    "closed",
  ];
  if (typeof status === "string" && valid.includes(status as WorkOrderStatus)) {
    return status as WorkOrderStatus;
  }
  return "negotiating";
}

function createdAtSortKey(value: string | Date): string {
  return typeof value === "string" ? value : value.toISOString();
}

export async function getAllWorkOrders(): Promise<WorkOrderRecord[]> {
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, COLLECTION));

  return snap.docs
    .map((docSnap) => mapWorkOrderRecord(docSnap.id, docSnap.data()))
    .sort((a, b) =>
      createdAtSortKey(b.createdAt).localeCompare(createdAtSortKey(a.createdAt)),
    );
}

export async function getClientWorkOrders(userId: string): Promise<WorkOrderRecord[]> {
  const db = getFirestoreDb();
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("userId", "==", userId)),
  );

  return snap.docs
    .map((docSnap) => mapWorkOrderRecord(docSnap.id, docSnap.data()))
    .sort((a, b) =>
      createdAtSortKey(b.createdAt).localeCompare(createdAtSortKey(a.createdAt)),
    );
}

export async function getWorkOrderBySubmission(
  submissionId: string,
  userId?: string,
): Promise<WorkOrderRecord | null> {
  if (userId) {
    const orders = await getClientWorkOrders(userId);
    return orders.find((order) => order.submissionId === submissionId) ?? null;
  }

  const db = getFirestoreDb();
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("submissionId", "==", submissionId)),
  );

  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  return mapWorkOrderRecord(docSnap.id, docSnap.data());
}

export async function createWorkOrderFromPackageSelection(
  inquiry: SubmissionRecord,
  packageId: string,
  userId: string,
): Promise<WorkOrderRecord> {
  if (!inquiry.quote || inquiry.quote.status !== "published") {
    throw new Error("Quote is not available for selection.");
  }

  const selected = inquiry.quote.packages.find((pkg) => pkg.id === packageId);
  if (!selected) {
    throw new Error("Selected package was not found.");
  }

  const existing = await getWorkOrderBySubmission(inquiry.id, userId);
  if (existing) {
    throw new Error("A work order already exists for this inquiry.");
  }

  const workOrderId = crypto.randomUUID();
  const db = getFirestoreDb();
  const packageSnapshot = sanitizeQuotePackage(selected);

  await setDoc(doc(db, COLLECTION, workOrderId), {
    submissionId: inquiry.id,
    userId,
    clientEmail: normalizeEmail(inquiry.email),
    clientName: inquiry.name.trim(),
    packageId: selected.id,
    packageSnapshot,
    status: "negotiating",
    createdAt: serverTimestamp(),
  });

  return {
    id: workOrderId,
    submissionId: inquiry.id,
    userId,
    clientEmail: normalizeEmail(inquiry.email),
    clientName: inquiry.name.trim(),
    inquiryServiceType: inquiry.serviceType,
    packageId: selected.id,
    packageSnapshot,
    status: "negotiating",
    adminNotes: null,
    contractLink: null,
    workDriveLink: null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
}

export type AdminWorkOrderUpdate = {
  status: WorkOrderStatus;
  packageSnapshot: InquiryQuotePackage;
  adminNotes?: string | null;
  contractLink?: string | null;
  workDriveLink?: string | null;
};

export async function updateWorkOrderAdmin(
  workOrderId: string,
  data: AdminWorkOrderUpdate,
): Promise<void> {
  const db = getFirestoreDb();

  await updateDoc(doc(db, COLLECTION, workOrderId), {
    status: data.status,
    packageSnapshot: sanitizeQuotePackage(data.packageSnapshot),
    adminNotes: data.adminNotes?.trim().slice(0, 2000) || null,
    contractLink: normalizeOptionalLink(data.contractLink)?.slice(0, 2000) ?? null,
    workDriveLink:
      normalizeOptionalLink(data.workDriveLink)?.slice(0, 2000) ?? null,
    updatedAt: serverTimestamp(),
  });
}

export function formatWorkOrderDate(
  value: string | Date | null | undefined,
): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
