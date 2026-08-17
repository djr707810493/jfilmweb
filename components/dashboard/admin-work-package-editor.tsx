"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  dashboardInputClass,
  dashboardSelectClass,
} from "@/components/dashboard/dashboard-layout";
import { InquiryQuoteView } from "@/components/dashboard/inquiry-quote-view";
import {
  formatMultilineList,
  parseMultilineList,
  sanitizeQuotePackage,
  type InquiryQuotePackage,
} from "@/types/inquiry-quote";
import { SERVICE_TYPE_OPTIONS, type ServiceType } from "@/types/submission";

type PackageDraft = InquiryQuotePackage & {
  includesText: string;
  bonusesText: string;
  optionalAddonsText: string;
};

function toPackageDraft(pkg: InquiryQuotePackage): PackageDraft {
  return {
    ...pkg,
    includesText: formatMultilineList(pkg.includes),
    bonusesText: formatMultilineList(pkg.bonuses),
    optionalAddonsText: formatMultilineList(pkg.optionalAddons),
  };
}

function fromPackageDraft(pkg: PackageDraft): InquiryQuotePackage {
  return sanitizeQuotePackage({
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
  });
}

type AdminWorkPackageEditorProps = {
  packageSnapshot: InquiryQuotePackage;
  onChange: (pkg: InquiryQuotePackage) => void;
};

export function AdminWorkPackageEditor({
  packageSnapshot,
  onChange,
}: AdminWorkPackageEditorProps) {
  const [draft, setDraft] = useState<PackageDraft>(() =>
    toPackageDraft(packageSnapshot),
  );
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setDraft(toPackageDraft(packageSnapshot));
    setPreview(false);
  }, [packageSnapshot]);

  function updateDraft(patch: Partial<PackageDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      onChange(fromPackageDraft(next));
      return next;
    });
  }

  const previewQuote = {
    introMessage: null,
    status: "published" as const,
    packages: [fromPackageDraft(draft)],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-editorial">Package details</p>
          <p className="mt-1 text-sm text-soft-black-muted">
            Update the selected package content for this work order.
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
        <div className="border border-taupe/40 bg-ivory-dark p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Package name">
              <input
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value })}
                className={dashboardInputClass}
              />
            </Field>
            <Field label="Service type">
              <select
                value={draft.serviceType}
                onChange={(e) =>
                  updateDraft({ serviceType: e.target.value as ServiceType })
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
                value={draft.price}
                onChange={(e) => updateDraft({ price: e.target.value })}
                className={dashboardInputClass}
              />
            </Field>
            <Field label="Duration / coverage">
              <input
                value={draft.duration}
                onChange={(e) => updateDraft({ duration: e.target.value })}
                className={dashboardInputClass}
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Includes (one per line)">
              <textarea
                rows={5}
                value={draft.includesText}
                onChange={(e) => updateDraft({ includesText: e.target.value })}
                className={`${dashboardInputClass} min-h-[7rem] resize-y`}
              />
            </Field>
            <Field label="Complimentary (one per line)">
              <textarea
                rows={5}
                value={draft.bonusesText}
                onChange={(e) => updateDraft({ bonusesText: e.target.value })}
                className={`${dashboardInputClass} min-h-[7rem] resize-y`}
              />
            </Field>
            <Field label="Optional add-ons (one per line)">
              <textarea
                rows={5}
                value={draft.optionalAddonsText}
                onChange={(e) =>
                  updateDraft({ optionalAddonsText: e.target.value })
                }
                className={`${dashboardInputClass} min-h-[7rem] resize-y`}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Notes">
              <input
                value={draft.notes ?? ""}
                onChange={(e) => updateDraft({ notes: e.target.value })}
                className={dashboardInputClass}
              />
            </Field>
          </div>
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
