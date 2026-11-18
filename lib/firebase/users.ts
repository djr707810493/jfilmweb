import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { resolveRole } from "@/lib/firebase/auth";
import type { UserProfile } from "@/types/user";

const USERS_COLLECTION = "users";

function timestampToString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return String(value);
}

function mapUserProfile(id: string, data: Record<string, unknown>): UserProfile {
  const email = String(data.email ?? "");

  return {
    uid: id,
    email,
    displayName:
      typeof data.displayName === "string" && data.displayName.trim()
        ? data.displayName
        : undefined,
    role: resolveRole(email, data.role === "admin" ? "admin" : "client"),
    createdAt: timestampToString(data.createdAt),
  };
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(getFirestoreDb(), USERS_COLLECTION));

  return snap.docs
    .map((userDoc) => mapUserProfile(userDoc.id, userDoc.data()))
    .sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bTime - aTime || a.email.localeCompare(b.email);
    });
}

export async function updateUserDisplayName(
  uid: string,
  displayName: string | null,
): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), USERS_COLLECTION, uid), {
    displayName: displayName?.trim() || null,
  });
}

export async function deleteUserProfile(uid: string): Promise<void> {
  await deleteDoc(doc(getFirestoreDb(), USERS_COLLECTION, uid));
}

export function formatUserDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
