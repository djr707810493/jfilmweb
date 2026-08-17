"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkOrderProgress } from "@/components/dashboard/work-order-progress";
import { WorkOrderStatusBadge } from "@/components/dashboard/work-order-status-badge";
import {
  createWorkOrderFromPackageSelection,
  getWorkOrderBySubmission,
} from "@/lib/firebase/work-orders";
import {
  isQuoteVisibleToClient,
  type InquiryQuote,
  type InquiryQuotePackage,
} from "@/types/inquiry-quote";
import { serviceTypeLabel } from "@/types/submission";
import type { SubmissionRecord } from "@/types/submission";
import {
  workOrderStatusLabel,
  type WorkOrderRecord,
} from "@/types/work-order";

type ClientQuoteSelectorProps = {
  inquiry: SubmissionRecord;
  userId: string;
};

export function ClientQuoteSelector({
  inquiry,
  userId,
}: ClientQuoteSelectorProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [existingWorkOrder, setExistingWorkOrder] =
    useState<WorkOrderRecord | null>(null);
  const [loadingWorkOrder, setLoadingWorkOrder] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWorkOrder() {
      setLoadingWorkOrder(true);
      try {
        const workOrder = await getWorkOrderBySubmission(inquiry.id, userId);
        if (!cancelled) {
          setExistingWorkOrder(workOrder);
          if (workOrder) {
            setSelectedPackageId(workOrder.packageId);
          } else if (inquiry.quote?.packages.length === 1) {
            setSelectedPackageId(inquiry.quote.packages[0].id);
          } else {
            const recommended = inquiry.quote?.packages.find(
              (pkg) => pkg.recommended,
            );
            if (recommended) setSelectedPackageId(recommended.id);
          }
        }
      } catch {
        if (!cancelled) setExistingWorkOrder(null);
      } finally {
        if (!cancelled) setLoadingWorkOrder(false);
      }
    }

    loadWorkOrder();
    return () => {
      cancelled = true;
    };
  }, [inquiry.id, inquiry.quote?.packages, userId]);

  if (!isQuoteVisibleToClient(inquiry.quote)) {
    return null;
  }

  async function handleSubmit() {
    if (!selectedPackageId || existingWorkOrder) return;

    setSubmitting(true);
    setError("");

    try {
      const workOrder = await createWorkOrderFromPackageSelection(
        inquiry,
        selectedPackageId,
        userId,
      );
      setExistingWorkOrder(workOrder);
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      setError(
        code === "permission-denied"
          ? "Permission denied. Ask the studio to deploy the latest Firestore rules, then try again."
          : err instanceof Error
            ? err.message
            : "Could not submit your selection. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingWorkOrder) {
    return (
      <p className="text-xs text-soft-black-muted sm:text-sm">
        Checking work order status…
      </p>
    );
  }

  if (existingWorkOrder) {
    return (
      <div className="rounded-sm border border-emerald-300/60 bg-emerald-50/50 p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="label-editorial text-[0.5625rem] text-emerald-900 sm:text-[0.625rem]">
              Package submitted
            </p>
            <p className="font-display mt-1 text-base text-soft-black sm:text-lg">
              {existingWorkOrder.packageSnapshot.name}
            </p>
            <p className="mt-0.5 text-xs text-soft-black-muted sm:text-sm">
              {existingWorkOrder.packageSnapshot.price}
            </p>
          </div>
        <WorkOrderStatusBadge
          status={existingWorkOrder.status}
          label={workOrderStatusLabel(existingWorkOrder.status)}
        />
      </div>
      <div className="mt-4">
        <WorkOrderProgress status={existingWorkOrder.status} compact />
      </div>
      <p className="mt-3 text-xs text-soft-black-muted sm:text-sm">
          Track progress in{" "}
          <Link
            href="/studio/dashboard/work"
            className="text-soft-black underline-offset-2 hover:underline"
          >
            Work
          </Link>
          .
        </p>
      </div>
    );
  }

  const selectedPackage = inquiry.quote!.packages.find(
    (pkg) => pkg.id === selectedPackageId,
  );

  return (
    <div className="space-y-3">
      <p className="label-editorial text-[0.5625rem] text-muted sm:text-[0.625rem]">
        Quote & Selection
      </p>

      {inquiry.quote!.introMessage && (
        <p className="text-xs leading-relaxed text-soft-black-muted sm:text-sm">
          {inquiry.quote!.introMessage}
        </p>
      )}

      <SelectableQuoteView
        quote={inquiry.quote!}
        selectedPackageId={selectedPackageId}
        onSelectPackage={setSelectedPackageId}
      />

      {error && (
        <p className="text-xs text-red-700 sm:text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedPackageId || submitting}
        className="label-editorial w-full border border-soft-black bg-soft-black px-4 py-2.5 text-ivory transition-colors hover:bg-soft-black/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-5"
      >
        {submitting
          ? "Submitting…"
          : selectedPackage
            ? `Submit · ${selectedPackage.name}`
            : "Submit selection"}
      </button>
    </div>
  );
}

type SelectableQuoteViewProps = {
  quote: InquiryQuote;
  selectedPackageId: string | null;
  onSelectPackage: (packageId: string) => void;
};

function SelectableQuoteView({
  quote,
  selectedPackageId,
  onSelectPackage,
}: SelectableQuoteViewProps) {
  return (
    <div className="space-y-2">
      {quote.packages.map((pkg) => {
        const selected = selectedPackageId === pkg.id;
        return (
          <PackageOption
            key={pkg.id}
            pkg={pkg}
            selected={selected}
            onSelect={() => onSelectPackage(pkg.id)}
          />
        );
      })}
    </div>
  );
}

function PackageOption({
  pkg,
  selected,
  onSelect,
}: {
  pkg: InquiryQuotePackage;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`border-l-2 transition-colors ${
        selected
          ? "border-l-soft-black bg-ivory-dark/40 pl-3"
          : "border-l-transparent pl-3"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start gap-2.5 py-2 text-left"
      >
        <span
          className={`mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
            selected
              ? "border-soft-black bg-soft-black"
              : "border-taupe bg-ivory"
          }`}
          aria-hidden
        >
          {selected && <span className="h-1 w-1 rounded-full bg-ivory" />}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="label-editorial block text-[0.5625rem] text-muted">
                {serviceTypeLabel(pkg.serviceType)}
              </span>
              <span className="font-display block text-base text-soft-black">
                {pkg.name}
              </span>
            </span>
            {pkg.recommended && (
              <span className="label-editorial shrink-0 text-[0.5625rem] text-muted">
                Top pick
              </span>
            )}
          </span>
          <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-sm">
            <span className="font-display text-soft-black">{pkg.price}</span>
            {pkg.duration && (
              <span className="text-xs text-soft-black-muted">{pkg.duration}</span>
            )}
          </span>
        </span>
      </button>

      {selected && (
        <div className="pb-2 pl-6">
          <CompactPackageDetails pkg={pkg} />
        </div>
      )}
    </div>
  );
}

function CompactPackageDetails({ pkg }: { pkg: InquiryQuotePackage }) {
  return (
    <div className="space-y-2 text-xs text-soft-black">
      {pkg.includes.length > 0 && (
        <DetailGroup title="Includes" items={pkg.includes} />
      )}
      {pkg.bonuses.length > 0 && (
        <DetailGroup title="Complimentary" items={pkg.bonuses} />
      )}
      {pkg.optionalAddons.length > 0 && (
        <DetailGroup title="Add-ons" items={pkg.optionalAddons} />
      )}
      {pkg.notes && (
        <p className="text-soft-black-muted">{pkg.notes}</p>
      )}
    </div>
  );
}

function DetailGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="label-editorial text-[0.5625rem] text-muted">{title}</p>
      <ul className="mt-1 space-y-0.5">
        {items.map((item) => (
          <li
            key={item}
            className="leading-snug before:mr-1 before:text-muted before:content-['·']"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
