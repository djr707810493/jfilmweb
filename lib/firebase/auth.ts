import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { getFirestoreDb } from "@/lib/firebase";
import { linkUnclaimedSubmissionsForUser } from "@/lib/firebase/submissions";
import type { UserProfile, UserRole } from "@/types/user";

const USERS_COLLECTION = "users";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getAdminEmails(): string[] {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveRole(
  email: string,
  storedRole?: UserRole,
): UserRole {
  if (getAdminEmails().includes(email.toLowerCase())) {
    return "admin";
  }
  return storedRole ?? "client";
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));

  if (!snap.exists()) return null;

  const data = snap.data();
  const email = data.email as string;

  return {
    uid,
    email,
    displayName: data.displayName as string | undefined,
    role: resolveRole(email, data.role as UserRole | undefined),
    createdAt: data.createdAt?.toString(),
  };
}

async function createUserProfile(
  user: User,
  displayName?: string,
): Promise<UserProfile> {
  const db = getFirestoreDb();
  const email = normalizeEmail(user.email ?? "");
  const docRef = doc(db, USERS_COLLECTION, user.uid);
  const resolvedName =
    displayName?.trim() || user.displayName?.trim() || undefined;

  const profile = {
    email,
    displayName: resolvedName || null,
    role: "client" as const,
    createdAt: serverTimestamp(),
  };

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(docRef);
    if (!snap.exists()) {
      transaction.set(docRef, profile);
    }
  });

  return {
    uid: user.uid,
    email,
    displayName: resolvedName,
    role: resolveRole(email),
  };
}

async function resolveAuthenticatedProfile(
  user: User,
  displayName?: string,
): Promise<UserProfile> {
  if (!user.email) {
    throw new Error("Account email is missing.");
  }

  const existing = await fetchUserProfile(user.uid);

  const profile = existing
    ? { ...existing, role: resolveRole(user.email, existing.role) }
    : await createUserProfile(
        user,
        displayName ?? user.displayName ?? undefined,
      );

  try {
    await linkUnclaimedSubmissionsForUser(profile.uid, profile.email);
  } catch {
    // Inquiry linking is best-effort; auth should still succeed.
  }

  return profile;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  const auth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(
    auth,
    normalizeEmail(email),
    password,
  );

  return resolveAuthenticatedProfile(credential.user);
}

export async function signUp(
  email: string,
  password: string,
  displayName?: string,
): Promise<UserProfile> {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizeEmail(email),
    password,
  );

  return resolveAuthenticatedProfile(credential.user, displayName);
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const credential = await signInWithPopup(auth, provider);

  return resolveAuthenticatedProfile(
    credential.user,
    credential.user.displayName ?? undefined,
  );
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

export async function profileFromFirebaseUser(user: User): Promise<UserProfile> {
  return resolveAuthenticatedProfile(user);
}
