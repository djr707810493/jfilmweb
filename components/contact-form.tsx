"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { InquiryRegistrationPanel } from "@/components/auth/inquiry-registration-panel";
import { useAuth } from "@/contexts/auth-provider";
import { isFirebaseConfigured } from "@/lib/firebase";
import emailjs from "@emailjs/browser";
import { createSubmission } from "@/lib/firebase/submissions";
import { uploadSubmissionMedia, validateMediaFile } from "@/lib/firebase/storage";
import {
  QUOTE_ESTIMATE_EVENT,
  clearQuoteEstimate,
  formatQuoteMessage,
  readQuoteEstimate,
  type QuoteEstimate,
} from "@/components/quote/quote-session";
import { formatUSD } from "@/components/quote/quote-config";
import { siteConfig } from "@/data/site";
import {
  MAX_ATTACHMENT_COUNT,
  SERVICE_TYPE_OPTIONS,
  type ServiceType,
  type SubmissionInput,
} from "@/types/submission";

const CATEGORY_TO_SERVICE_TYPE: Record<string, ServiceType> = {
  photo: "photography",
  video: "videography",
  "duo-1": "both",
  "duo-2": "both",
};

function serviceTypeFromQuote(categoryId: string): ServiceType | null {
  return CATEGORY_TO_SERVICE_TYPE[categoryId] ?? null;
}

type FormState = SubmissionInput;

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  serviceType: "photography",
  preferredDate: "",
  location: "",
  budget: "",
  message: "",
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

type SuccessData = {
  submissionId: string;
  email: string;
  name: string;
  alreadyLinked: boolean;
};

export function ContactForm({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadLabel, setUploadLabel] = useState("");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [registrationSkipped, setRegistrationSkipped] = useState(false);
  const [attachedQuote, setAttachedQuote] = useState<QuoteEstimate | null>(null);
  const [dateUnknown, setDateUnknown] = useState(false);

  const firebaseReady = isFirebaseConfigured();

  // Prefill from the instant quote tool (session storage + live event).
  useEffect(() => {
    function applyEstimate() {
      const estimate = readQuoteEstimate();
      if (!estimate) return;

      setAttachedQuote(estimate);
      setForm((prev) => {
        const fromQuote = serviceTypeFromQuote(estimate.categoryId);
        const next: FormState = {
          ...prev,
          budget: prev.budget || `Around ${formatUSD(estimate.budget)}`,
          preferredDate: prev.preferredDate || estimate.date,
          location: prev.location || estimate.location,
        };
        if (fromQuote) next.serviceType = fromQuote;
        if (estimate.date) {
          setDateUnknown(false);
        }
        const summary = formatQuoteMessage(estimate);
        next.message = prev.message ? `${prev.message}\n\n${summary}` : summary;
        return next;
      });
      clearQuoteEstimate();
    }

    applyEstimate();
    window.addEventListener(QUOTE_ESTIMATE_EVENT, applyEstimate);
    return () => window.removeEventListener(QUOTE_ESTIMATE_EVENT, applyEstimate);
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileChange(fileList: FileList | null) {
    if (!fileList) return;

    const selected = Array.from(fileList).slice(0, MAX_ATTACHMENT_COUNT);
    const errors = selected.map(validateMediaFile).filter(Boolean);

    if (errors.length > 0) {
      setErrorMessage(errors.join(" "));
      return;
    }

    setFiles(selected);
    setErrorMessage("");
  }

  function resetForm() {
    setStatus("idle");
    setSuccessData(null);
    setRegistrationSkipped(false);
    setForm(initialForm);
    setFiles([]);
    setErrorMessage("");
    setUploadLabel("");
    setDateUnknown(false);
    setAttachedQuote(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseReady) {
      setStatus("error");
      setErrorMessage(
        "Firebase is not configured yet. Add your keys to .env.local and restart the dev server.",
      );
      return;
    }

    setStatus("submitting");
    setErrorMessage("");
    setUploadLabel("");

    const submittedEmail = form.email.trim().toLowerCase();
    const submittedName = form.name.trim();

    try {
      const submissionId = crypto.randomUUID();

      let attachmentUrls: string[] = [];
      if (files.length > 0) {
        setUploadLabel("Uploading attachments…");
        attachmentUrls = await uploadSubmissionMedia(
          submissionId,
          files,
          ({ fileName, progress }) => {
            setUploadLabel(`Uploading ${fileName}… ${progress}%`);
          },
        );
      }

      setUploadLabel("Saving inquiry…");
      const messageWithNote = dateUnknown
        ? `${form.message}\n\n(Date not confirmed yet — flexible on timing.)`
        : form.message;
      await createSubmission(
        { ...form, message: messageWithNote },
        attachmentUrls,
        submissionId,
        user?.uid ?? null,
      );

      // Trigger EmailJS notification
      // We wrap this in a try-catch so the form still succeeds even if email fails
      try {
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "default_service",
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_id",
          {
            to_email: siteConfig.email,
            from_name: submittedName,
            reply_to: submittedEmail,
            phone: form.phone || "Not provided",
            service_type: form.serviceType,
            preferred_date:
              form.preferredDate ||
              (dateUnknown ? "Not confirmed yet" : "Not provided"),
            location: form.location || "Not provided",
            budget: form.budget || "Not provided",
            message: messageWithNote,
            instant_quote: attachedQuote
              ? `${attachedQuote.categoryLabel} · ${attachedQuote.hours}h · budget ${formatUSD(attachedQuote.budget)}`
              : "None",
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "public_key"
        );
      } catch (err) {
        console.error("Failed to trigger EmailJS notification", err);
      }

      setSuccessData({
        submissionId,
        email: submittedEmail,
        name: submittedName,
        alreadyLinked: Boolean(user),
      });
      setStatus("success");
      setForm(initialForm);
      setFiles([]);
      setUploadLabel("");
      setAttachedQuote(null);
      setUploadLabel("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again or email us directly.",
      );
      setUploadLabel("");
    }
  }

  if (status === "success" && successData) {
    const showRegistration =
      !successData.alreadyLinked && !registrationSkipped;

    return (
      <div className={`${embedded ? "" : "mt-10"} max-w-3xl space-y-8`}>
        <div className="border border-taupe/40 bg-ivory-dark p-8 md:p-10">
          <p className="label-editorial text-soft-black">Thank you</p>
          <h2 className="font-display mt-3 text-2xl text-soft-black md:text-3xl">
            Your inquiry has been received
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-soft-black-muted md:text-base">
            We&apos;ll review your message and get back to you within 2–3
            business days.
            {successData.alreadyLinked && (
              <>
                {" "}
                It&apos;s already linked to your client account.
              </>
            )}
          </p>

          {successData.alreadyLinked && (
            <Link
              href="/studio/dashboard"
              className="label-editorial mt-8 inline-flex min-h-[3rem] items-center border border-soft-black bg-soft-black px-6 py-3 text-ivory transition-opacity hover:opacity-90"
            >
              View in Dashboard
            </Link>
          )}

          {!showRegistration && (
            <button
              type="button"
              onClick={resetForm}
              className="label-editorial mt-8 border border-soft-black/20 px-6 py-3 text-soft-black transition-colors hover:bg-soft-black hover:text-ivory"
            >
              Send Another Inquiry
            </button>
          )}
        </div>

        {showRegistration && (
          <InquiryRegistrationPanel
            inquiryEmail={successData.email}
            inquiryName={successData.name}
            onSkip={() => setRegistrationSkipped(true)}
          />
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={embedded ? "max-w-none" : "mt-10 max-w-xl"}
    >
      {!firebaseReady && (
        <div className="mb-8 border border-taupe/40 bg-ivory-dark p-4 text-sm text-soft-black-muted">
          Firebase keys are missing. Form submission is disabled until{" "}
          <code className="text-soft-black">.env.local</code> is configured.
          You can still reach us at{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-soft-black underline"
          >
            {siteConfig.email}
          </a>
          .
        </div>
      )}

      {attachedQuote && (
        <div className="mb-8 border border-soft-black bg-ivory-dark p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="label-editorial text-soft-black">Your instant quote</p>
              <p className="mt-1.5 text-sm text-soft-black">
                {attachedQuote.categoryLabel} · {attachedQuote.hours}h ·{" "}
                {formatUSD(attachedQuote.budget)} budget
              </p>
              {attachedQuote.packages.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-soft-black-muted">
                  {attachedQuote.packages.map((pkg) => (
                    <li key={pkg.name}>
                      {pkg.name} — {formatUSD(pkg.price)}
                      {pkg.recommended ? " (recommended)" : ""}
                    </li>
                  ))}
                </ul>
              )}
              {attachedQuote.addOnLabels.length > 0 && (
                <p className="mt-2 text-xs text-soft-black-muted">
                  Add-ons: {attachedQuote.addOnLabels.join(", ")}
                </p>
              )}
              <p className="mt-2 text-xs text-soft-black-muted">
                These details were added to your message — edit them freely.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedQuote(null);
                setForm((prev) => {
                  const marker = "— Instant quote details —";
                  const index = prev.message.indexOf(marker);
                  const withoutQuote =
                    index === -1 ? prev.message : prev.message.slice(0, index);
                  return { ...prev, message: withoutQuote.trimEnd() };
                });
              }}
              className="label-editorial text-soft-black-muted underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {user && (
        <div className="mb-8 border border-taupe/40 bg-ivory-dark px-4 py-3 text-sm text-soft-black-muted">
          Signed in as{" "}
          <span className="text-soft-black">{user.email}</span>. This inquiry
          will be linked to your account automatically.
        </div>
      )}

      <div className="grid gap-6">
        <Field label="Name" required>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Email" required>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </Field>

          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={inputClass}
              autoComplete="tel"
            />
          </Field>
        </div>

        <Field label="Service type" required>
          <select
            required
            value={form.serviceType}
            onChange={(e) =>
              updateField("serviceType", e.target.value as ServiceType)
            }
            className={inputClass}
          >
            {SERVICE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Preferred Date">
            <input
              type="date"
              value={form.preferredDate}
              onChange={(e) => updateField("preferredDate", e.target.value)}
              disabled={dateUnknown}
              className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-soft-black-muted">
              <input
                type="checkbox"
                checked={dateUnknown}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setDateUnknown(checked);
                  if (checked) updateField("preferredDate", "");
                }}
                className="size-4 accent-soft-black"
              />
              I haven&apos;t confirmed my date yet
            </label>
          </Field>

          <Field label="Location">
            <input
              type="text"
              placeholder="Park City, Moab, etc."
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Budget Range" required>
          <input
            type="text"
            required
            placeholder="e.g. $2,000 – $2,500"
            value={form.budget}
            onChange={(e) => updateField("budget", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Message" required>
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            className={`${inputClass} resize-y min-h-[9rem]`}
            placeholder="Tell us about your date, vision, and anything we should know."
          />
        </Field>

        <Field
          label="Photos / Videos"
          hint={`Optional. Up to ${MAX_ATTACHMENT_COUNT} files, images or videos.`}
        >
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => handleFileChange(e.target.files)}
            className="block w-full text-sm text-soft-black-muted file:mr-4 file:border file:border-taupe/40 file:bg-ivory file:px-4 file:py-2 file:text-[0.6875rem] file:font-medium file:tracking-[0.14em] file:text-soft-black file:uppercase"
          />
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {files.map((file) => (
                <li key={`${file.name}-${file.size}`}>{file.name}</li>
              ))}
            </ul>
          )}
        </Field>
      </div>

      {errorMessage && (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      {uploadLabel && (
        <p className="mt-4 text-sm text-soft-black-muted">{uploadLabel}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || !firebaseReady}
        className="label-editorial mt-8 min-h-[3rem] border border-soft-black bg-soft-black px-8 py-3.5 text-ivory transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "submitting" ? "Sending…" : "Send Inquiry"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-editorial text-soft-black">
        {label}
        {required ? " *" : ""}
      </span>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full border border-taupe/40 bg-ivory px-4 py-3 text-sm text-soft-black outline-none transition-colors focus:border-soft-black/40";
