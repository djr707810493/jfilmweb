"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { InquiryRegistrationPanel } from "@/components/auth/inquiry-registration-panel";
import { useAuth } from "@/contexts/auth-provider";
import { isFirebaseConfigured } from "@/lib/firebase";
import emailjs from "@emailjs/browser";
import { createSubmission } from "@/lib/firebase/submissions";
import { uploadSubmissionMedia, validateMediaFile } from "@/lib/firebase/storage";
import { siteConfig } from "@/data/site";
import {
  MAX_ATTACHMENT_COUNT,
  SERVICE_TYPE_OPTIONS,
  type ServiceType,
  type SubmissionInput,
} from "@/types/submission";

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

  const firebaseReady = isFirebaseConfigured();

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
      await createSubmission(
        form,
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
            preferred_date: form.preferredDate || "Not provided",
            location: form.location || "Not provided",
            budget: form.budget || "Not provided",
            message: form.message,
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
              className={inputClass}
            />
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

        <Field label="Budget Range">
          <input
            type="text"
            placeholder="Optional"
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
