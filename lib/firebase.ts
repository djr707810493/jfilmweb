import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

export function isFirebaseConfigured(): boolean {
  return requiredKeys.every((key) => {
    const value = firebaseConfig[key];
    return typeof value === "string" && value.length > 0;
  });
}

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let analytics: Analytics | undefined;

function assertBrowser(): void {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK can only be used in the browser.");
  }
}

export function getFirebaseApp(): FirebaseApp {
  assertBrowser();

  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* variables to .env.local",
    );
  }

  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }

  return app;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
}

/** Initialize Analytics in the browser (optional — requires measurementId) */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  assertBrowser();

  if (!firebaseConfig.measurementId) {
    return null;
  }

  if (analytics) {
    return analytics;
  }

  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  analytics = getAnalytics(getFirebaseApp());
  return analytics;
}
