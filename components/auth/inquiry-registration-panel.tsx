"use client";

import Link from "next/link";
import { FormEvent, useId, useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { formatAuthError } from "@/lib/firebase/auth-errors";
import { linkUnclaimedSubmissionsForUser } from "@/lib/firebase/submissions";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

type AuthMode = "signup" | "signin";

const MIN_PASSWORD_LENGTH = 6;

type InquiryRegistrationPanelProps = {
  inquiryEmail: string;
  inquiryName: string;
  onSkip: () => void;
};

export function InquiryRegistrationPanel({
  inquiryEmail,
  inquiryName,
  onSkip,
}: InquiryRegistrationPanelProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signup");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [linked, setLinked] = useState(false);

  const formId = useId();
  const firebaseReady = isFirebaseConfigured();
  const busy = submitting || googleSubmitting;

  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;
  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;

  async function linkInquiry(profile: UserProfile) {
    await linkUnclaimedSubmissionsForUser(profile.uid, profile.email);
    setLinked(true);
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleSubmitting(true);

    try {
      const profile = await signInWithGoogle();
      await linkInquiry(profile);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setGoogleSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!passwordLongEnough) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const profile =
        mode === "signup"
          ? await signUp(inquiryEmail, password, inquiryName)
          : await signIn(inquiryEmail, password);
      await linkInquiry(profile);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (linked) {
    return (
      <div className="border border-taupe/40 bg-ivory p-6 md:p-8">
        <p className="label-editorial text-soft-black">Account linked</p>
        <h3 className="font-display mt-3 text-2xl text-soft-black">
          Your inquiry is in your portal
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-soft-black-muted">
          Track status, access your gallery, and message the studio from your
          client dashboard.
        </p>
        <Link
          href="/studio/dashboard"
          className="label-editorial mt-6 inline-flex min-h-[3rem] items-center border border-soft-black bg-soft-black px-6 py-3 text-ivory transition-opacity hover:opacity-90"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-taupe/40 bg-ivory p-6 md:p-8">
      <p className="label-editorial text-soft-black">Client Portal</p>
      <h3 className="font-display mt-3 text-2xl text-soft-black md:text-3xl">
        Create your account
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-soft-black-muted">
        Link this inquiry to a secure account so you can follow up, view
        updates, and access your gallery — all in one place.
      </p>

      <div className="mt-6 rounded-sm border border-taupe/30 bg-ivory-dark px-4 py-3 text-sm">
        <p className="label-editorial text-[0.625rem] text-muted">Inquiry</p>
        <p className="mt-1 text-soft-black">{inquiryName}</p>
        <p className="text-soft-black-muted">{inquiryEmail}</p>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={busy || !firebaseReady}
        className="mt-6 flex min-h-[3rem] w-full items-center justify-center gap-3 border border-taupe/50 bg-ivory px-4 py-3 text-sm text-soft-black transition-colors hover:border-soft-black/30 hover:bg-ivory-dark disabled:opacity-40"
      >
        <GoogleIcon />
        <span className="font-medium tracking-wide">
          {googleSubmitting ? "Connecting…" : "Continue with Google"}
        </span>
      </button>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-taupe/40" aria-hidden />
        <span className="label-editorial text-[0.625rem] text-muted">or</span>
        <span className="h-px flex-1 bg-taupe/40" aria-hidden />
      </div>

      <div className="mb-6 grid grid-cols-2 border border-taupe/40">
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError("");
            setConfirmPassword("");
          }}
          className={`label-editorial py-3 transition-colors ${mode === "signup" ? "bg-soft-black text-ivory" : "bg-ivory text-muted hover:text-soft-black"}`}
        >
          New Account
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError("");
            setConfirmPassword("");
          }}
          className={`label-editorial border-l border-taupe/40 py-3 transition-colors ${mode === "signin" ? "bg-soft-black text-ivory" : "bg-ivory text-muted hover:text-soft-black"}`}
        >
          Sign In
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className="block">
          <span className="label-editorial text-soft-black">Email</span>
          <input
            type="email"
            readOnly
            value={inquiryEmail}
            className="mt-2 w-full border border-taupe/40 bg-ivory-dark px-4 py-3 text-sm text-soft-black-muted"
          />
        </label>

        {mode === "signup" && (
          <>
            <label className="block">
              <span className="label-editorial text-soft-black">Password</span>
              <input
                id={`${formId}-password`}
                type={showPassword ? "text" : "password"}
                required
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
                placeholder="At least 6 characters"
              />
            </label>

            <label className="block">
              <span className="label-editorial text-soft-black">
                Confirm password
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={MIN_PASSWORD_LENGTH}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClass} ${confirmPassword.length > 0 && !passwordsMatch ? "border-red-400" : ""}`}
                autoComplete="new-password"
                placeholder="Re-enter your password"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-2 text-xs text-red-700">Passwords do not match.</p>
              )}
            </label>

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-xs text-muted hover:text-soft-black"
            >
              {showPassword ? "Hide passwords" : "Show passwords"}
            </button>
          </>
        )}

        {mode === "signin" && (
          <label className="block">
            <span className="label-editorial text-soft-black">Password</span>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </label>
        )}

        {error && (
          <div
            className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={
            busy ||
            !firebaseReady ||
            (mode === "signup" &&
              (!passwordsMatch || !passwordLongEnough || !confirmPassword))
          }
          className="label-editorial min-h-[3rem] w-full border border-soft-black bg-soft-black px-6 py-3 text-ivory transition-opacity disabled:opacity-40"
        >
          {submitting
            ? "Linking inquiry…"
            : mode === "signup"
              ? "Create Account & Link Inquiry"
              : "Sign In & Link Inquiry"}
        </button>
      </form>

      <button
        type="button"
        onClick={onSkip}
        className="mt-6 w-full text-center text-xs text-muted transition-colors hover:text-soft-black"
      >
        Skip for now — I&apos;ll create an account later
      </button>
    </div>
  );
}

const inputClass =
  "mt-2 w-full border border-taupe/40 bg-ivory px-4 py-3 text-sm text-soft-black outline-none focus:border-soft-black/40";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
