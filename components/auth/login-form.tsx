"use client";

import { FormEvent, useEffect, useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { formatAuthError } from "@/lib/firebase/auth-errors";
import { isFirebaseConfigured } from "@/lib/firebase";

type AuthMode = "signin" | "signup";

const MIN_PASSWORD_LENGTH = 6;

export function LoginForm() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, user, loading: authLoading } =
    useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const formId = useId();
  const firebaseReady = isFirebaseConfigured();
  const busy = submitting || googleSubmitting || authLoading;

  const passwordsMatch =
    mode !== "signup" ||
    confirmPassword.length === 0 ||
    password === confirmPassword;

  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/studio/dashboard");
    }
  }, [authLoading, user, router]);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  if (!authLoading && user) {
    return (
      <p className="text-center text-sm text-muted">Redirecting to dashboard…</p>
    );
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleSubmitting(true);

    try {
      await signInWithGoogle();
      router.push("/studio/dashboard");
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
        setError("Passwords do not match. Please confirm your password.");
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
      router.push("/studio/dashboard");
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full">
      {!firebaseReady && (
        <p className="mb-6 border border-taupe/40 bg-ivory p-4 text-sm text-soft-black-muted">
          Firebase is not configured. Add keys to <code>.env.local</code> and
          redeploy.
        </p>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={busy || !firebaseReady}
        className="flex min-h-[3rem] w-full items-center justify-center gap-3 border border-taupe/50 bg-ivory px-4 py-3 text-sm text-soft-black transition-colors hover:border-soft-black/30 hover:bg-ivory-dark disabled:opacity-40"
      >
        <GoogleIcon />
        <span className="font-medium tracking-wide">
          {googleSubmitting ? "Connecting…" : "Continue with Google"}
        </span>
      </button>

      <AuthDivider />

      <div
        role="tablist"
        aria-label="Authentication mode"
        className="mb-8 grid grid-cols-2 border border-taupe/40"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          onClick={() => switchMode("signin")}
          className={`label-editorial py-3.5 transition-colors ${mode === "signin" ? "bg-soft-black text-ivory" : "bg-ivory text-muted hover:text-soft-black"}`}
        >
          Sign In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          onClick={() => switchMode("signup")}
          className={`label-editorial border-l border-taupe/40 py-3.5 transition-colors ${mode === "signup" ? "bg-soft-black text-ivory" : "bg-ivory text-muted hover:text-soft-black"}`}
        >
          Create Account
        </button>
      </div>

      <form
        id={formId}
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        {mode === "signup" && (
          <AuthField
            label="Full name"
            id={`${formId}-name`}
            type="text"
            value={displayName}
            onChange={setDisplayName}
            autoComplete="name"
            placeholder="Your name"
            required
          />
        )}

        <AuthField
          label="Email"
          id={`${formId}-email`}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />

        <div>
          <AuthField
            label="Password"
            id={`${formId}-password`}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            placeholder={
              mode === "signup" ? "At least 6 characters" : "Your password"
            }
            required
            minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : undefined}
            trailing={
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                label={showPassword ? "Hide password" : "Show password"}
              />
            }
          />
          {mode === "signup" && password.length > 0 && !passwordLongEnough && (
            <p className="mt-2 text-xs text-red-700">
              Password must be at least {MIN_PASSWORD_LENGTH} characters.
            </p>
          )}
        </div>

        {mode === "signup" && (
          <div>
            <AuthField
              label="Confirm password"
              id={`${formId}-confirm-password`}
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              invalid={confirmPassword.length > 0 && !passwordsMatch}
              trailing={
                <PasswordToggle
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((v) => !v)}
                  label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                />
              }
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-2 text-xs text-red-700" role="alert">
                Passwords do not match.
              </p>
            )}
            {confirmPassword.length > 0 && passwordsMatch && (
              <p className="mt-2 text-xs text-soft-black-muted">
                Passwords match.
              </p>
            )}
          </div>
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
            ? "Please wait…"
            : mode === "signin"
              ? "Sign In with Email"
              : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-xs leading-relaxed text-muted">
        {mode === "signin" ? (
          <>
            New client?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className="text-soft-black underline-offset-2 hover:underline"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="text-soft-black underline-offset-2 hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}

function AuthDivider() {
  return (
    <div className="my-8 flex items-center gap-4">
      <span className="h-px flex-1 bg-taupe/40" aria-hidden />
      <span className="label-editorial text-[0.625rem] text-muted">or</span>
      <span className="h-px flex-1 bg-taupe/40" aria-hidden />
    </div>
  );
}

function AuthField({
  label,
  id,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
  required,
  minLength,
  invalid,
  trailing,
}: {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  invalid?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="label-editorial text-soft-black">{label}</span>
      <div className="relative mt-2">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border bg-ivory px-4 py-3 pr-12 text-sm text-soft-black outline-none transition-colors placeholder:text-muted/70 focus:border-soft-black/40 ${invalid ? "border-red-400" : "border-taupe/40"}`}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          aria-invalid={invalid}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {trailing}
          </div>
        )}
      </div>
    </label>
  );
}

function PasswordToggle({
  visible,
  onToggle,
  label,
}: {
  visible: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="p-1 text-muted transition-colors hover:text-soft-black"
      aria-label={label}
    >
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

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

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58a2 2 0 0 0 2.84 2.84" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a18.45 18.45 0 0 1-4.06 5.06" />
      <path d="M6.12 6.12A18.45 18.45 0 0 0 2 12s3.5 7 10 7a10.94 10.94 0 0 0 4.91-1.12" />
    </svg>
  );
}
