"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  dashboardInputClass,
  dashboardSelectClass,
} from "@/components/dashboard/dashboard-layout";
import { InquiryQuoteView } from "@/components/dashboard/inquiry-quote-view";
import { updateSubmissionQuote } from "@/lib/firebase/submissions";
import {
  createEmptyQuote,
  createEmptyQuotePackage,
  formatMultilineList,
  parseMultilineList,
  sanitizeQuote,
  type InquiryQuote,
  type InquiryQuotePackage,
} from "@/types/inquiry-quote";
import {
  SERVICE_TYPE_OPTIONS,
  type SubmissionRecord,
  type ServiceType,
} from "@/types/submission";

type AdminQuoteEditorProps = {
  inquiry: SubmissionRecord;
  onQuoteUpdated: (quote: InquiryQuote | null) => void;
};

type PackageDraft = InquiryQuotePackage & {
  includesText: string;
  bonusesText: string;
  optionalAddonsText: string;
};

function toPackageDraft(
  pkg: InquiryQuotePackage,
): PackageDraft {
  return {
    ...pkg,
    includesText: formatMultilineList(pkg.includes),
    bonusesText: formatMultilineList(pkg.bonuses),
    optionalAddonsText: formatMultilineList(pkg.optionalAddons),
  };
}

function fromPackageDraft(pkg: PackageDraft): InquiryQuotePackage {
  return {
    id: pkg.id,
    name: pkg.name,
    serviceType: pkg.serviceType,
    price: pkg.price,
    duration: pkg.duration,
    includes: parseMultilineList(pkg.includesText),
    bonuses: parseMultilineList(pkg.bonusesText),
    optionalAddons: parseMultilineList(pkg.optionalAddonsText),
    notes: pkg.notes ?? null,
    recommended: pkg.recommended ?? false,
  };
}

export function AdminQuoteEditor({
  inquiry,
  onQuoteUpdated,
}: AdminQuoteEditorProps) {
  const [introMessage, setIntroMessage] = useState("");
  const [packages, setPackages] = useState<PackageDraft[]>([]);
  const [status, setStatus] = useState<InquiryQuote["status"]>("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const quote = inquiry.quote ?? createEmptyQuote();
    setIntroMessage(quote.introMessage ?? "");
    setPackages(quote.packages.map(toPackageDraft));
    setStatus(quote.status);
    setPreview(false);
    setError("");
  }, [inquiry.id, inquiry.quote]);

  function updatePackage(id: string, patch: Partial<PackageDraft>) {
    setPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, ...patch } : pkg)),
    );
  }

  function addPackage() {
    setPackages((prev) => [
      ...prev,
      toPackageDraft(createEmptyQuotePackage(inquiry.serviceType)),
    ]);
  }

  function removePackage(id: string) {
    setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
  }

  function buildQuote(nextStatus: InquiryQuote["status"]): InquiryQuote {
    return sanitizeQuote({
      introMessage,
      status: nextStatus,
      packages: packages.map(fromPackageDraft),
      publishedAt: inquiry.quote?.publishedAt ?? null,
      updatedAt: inquiry.quote?.updatedAt ?? null,
    });
  }

  async function handleSave(publish: boolean) {
    setSaving(true);
    setError("");

    const quote = buildQuote(publish ? "published" : "draft");

    if (quote.packages.length === 0) {
      setError("Add at least one package with a name and price.");
      setSaving(false);
      return;
    }

    try {
      const saved = await updateSubmissionQuote(inquiry.id, quote, publish);
      onQuoteUpdated(saved);
      setStatus(saved.status);
    } catch {
      setError("Could not save quote. Check Firestore rules and try again.");
    } finally {
      setSaving(false);
    }
  }

  const previewQuote = buildQuote(status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-editorial">Quote & Packages</p>
          <p className="mt-1 text-sm text-soft-black-muted">
            Create one or more photography packages for {inquiry.name} to review.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPreview((value) => !value)}
          className="label-editorial border border-taupe/40 px-4 py-2 text-soft-black-muted transition-colors hover:text-soft-black"
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <InquiryQuoteView quote={previewQuote} mode="admin" />
      ) : (
        <>
          <label className="block">
            <span className="label-editorial text-soft-black">
              Message to client
            </span>
            <textarea
              rows={4}
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              className={`${dashboardInputClass} min-h-[6rem] resize-y`}
              placeholder="Introduce the packages and next steps..."
            />
          </label>

          <div className="space-y-4">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className="border border-taupe/40 bg-ivory-dark p-5 md:p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="label-editorial text-soft-black">
                    Package {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removePackage(pkg.id)}
                    className="text-xs text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Package name">
                    <input
                      value={pkg.name}
                      onChange={(e) =>
                        updatePackage(pkg.id, { name: e.target.value })
                      }
                      className={dashboardInputClass}
                      placeholder="e.g. Full Wedding Collection"
                    />
                  </Field>
                  <Field label="Service type">
                    <select
                      value={pkg.serviceType}
                      onChange={(e) =>
                        updatePackage(pkg.id, {
                          serviceType: e.target.value as ServiceType,
                        })
                      }
                      className={dashboardSelectClass}
                    >
                      {SERVICE_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Price">
                    <input
                      value={pkg.price}
                      onChange={(e) =>
                        updatePackage(pkg.id, { price: e.target.value })
                      }
                      className={dashboardInputClass}
                      placeholder="e.g. $4,800"
                    />
                  </Field>
                  <Field label="Duration / coverage">
                    <input
                      value={pkg.duration}
                      onChange={(e) =>
                        updatePackage(pkg.id, { duration: e.target.value })
                      }
                      className={dashboardInputClass}
                      placeholder="e.g. 10 hours · 2 photographers"
                    />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <Field label="Includes (one per line)">
                    <textarea
                      rows={5}
                      value={pkg.includesText}
                      onChange={(e) =>
                        updatePackage(pkg.id, { includesText: e.target.value })
                      }
                      className={`${dashboardInputClass} min-h-[7rem] resize-y`}
                      placeholder={"Full-day coverage\nOnline gallery\n..."}
                    />
                  </Field>
                  <Field label="Complimentary (one per line)">
                    <textarea
                      rows={5}
                      value={pkg.bonusesText}
                      onChange={(e) =>
                        updatePackage(pkg.id, { bonusesText: e.target.value })
                      }
                      className={`${dashboardInputClass} min-h-[7rem] resize-y`}
                      placeholder={"Engagement session\nPrint credit\n..."}
                    />
                  </Field>
                  <Field label="Optional add-ons (one per line)">
                    <textarea
                      rows={5}
                      value={pkg.optionalAddonsText}
                      onChange={(e) =>
                        updatePackage(pkg.id, {
                          optionalAddonsText: e.target.value,
                        })
                      }
                      className={`${dashboardInputClass} min-h-[7rem] resize-y`}
                      placeholder={"Extra hour\nAlbum upgrade\n..."}
                    />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                  <Field label="Notes">
                    <input
                      value={pkg.notes ?? ""}
                      onChange={(e) =>
                        updatePackage(pkg.id, { notes: e.target.value })
                      }
                      className={dashboardInputClass}
                      placeholder="Optional package notes"
                    />
                  </Field>
                  <label className="flex items-end gap-2 pb-3 text-sm text-soft-black">
                    <input
                      type="checkbox"
                      checked={Boolean(pkg.recommended)}
                      onChange={(e) =>
                        updatePackage(pkg.id, { recommended: e.target.checked })
                      }
                    />
                    Recommended
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addPackage}
            className="label-editorial w-full border border-dashed border-taupe/50 py-3 text-soft-black-muted transition-colors hover:border-soft-black/30 hover:text-soft-black"
          >
            + Add Package
          </button>
        </>
      )}

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!preview && (
        <div className="flex flex-wrap gap-3 border-t border-taupe/30 pt-6">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false)}
            className="label-editorial border border-taupe/40 px-5 py-2.5 text-soft-black disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="label-editorial border border-soft-black bg-soft-black px-5 py-2.5 text-ivory disabled:opacity-40"
          >
            {saving ? "Publishing…" : "Publish to Client"}
          </button>
          {status === "published" && (
            <p className="self-center text-xs text-soft-black-muted">
              Client can currently view this quote.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-editorial text-soft-black">{label}</span>
      {children}
    </label>
  );
}
