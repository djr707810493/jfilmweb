"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  getFirebaseAuth,
  profileFromFirebaseUser,
  signIn as authSignIn,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
  signUp as authSignUp,
} from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

type AuthContextValue = {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<UserProfile>;
  signInWithGoogle: () => Promise<UserProfile>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setFirebaseUser(nextUser);

      if (!nextUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await profileFromFirebaseUser(nextUser);
        setUser(profile);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const profile = await authSignIn(email, password);
    setUser(profile);
    return profile;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const profile = await authSignUp(email, password, displayName);
      setUser(profile);
      return profile;
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    const profile = await authSignInWithGoogle();
    setUser(profile);
    return profile;
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      firebaseUser,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }),
    [user, firebaseUser, loading, signIn, signUp, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
