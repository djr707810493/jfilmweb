"use client";

import { useState } from "react";
import { formatSubmissionDate } from "@/lib/firebase/submissions";
import {
  serviceTypeLabel,
  submissionStatusDescription,
  submissionStatusLabel,
  type SubmissionRecord,
  type SubmissionStatus,
} from "@/types/submission";
import { StatusBadge } from "@/components/dashboard/status-badge";

type InquiryDetailProps = {
  inquiry: SubmissionRecord;
  compact?: boolean;
};

export function InquiryDetail({ inquiry, compact = false }: InquiryDetailProps) {
  const [messageOpen, setMessageOpen] = useState(false);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="label-editorial text-[0.5625rem] text-soft-black sm:text-[0.625rem]">
            {serviceTypeLabel(inquiry.serviceType)}
          </p>
          {!compact && (
            <p className="mt-1 text-sm text-soft-black-muted">
              {submissionStatusDescription(inquiry.status)}
            </p>
          )}
        </div>
        <StatusBadge
          status={inquiry.status}
          label={submissionStatusLabel(inquiry.status)}
        />
      </div>

      <dl
        className={`grid text-xs sm:text-sm ${
          compact
            ? "grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3"
            : "gap-4 sm:grid-cols-2"
        }`}
      >
        <DetailItem
          label="Submitted"
          value={formatSubmissionDate(inquiry.createdAt)}
          compact={compact}
        />
        {inquiry.preferredDate && (
          <DetailItem
            label="Preferred date"
            value={inquiry.preferredDate}
            compact={compact}
          />
        )}
        {inquiry.location && (
          <DetailItem label="Location" value={inquiry.location} compact={compact} />
        )}
        {inquiry.budget && (
          <DetailItem label="Budget" value={inquiry.budget} compact={compact} />
        )}
        {!compact && inquiry.phone && (
          <DetailItem label="Phone" value={inquiry.phone} compact={compact} />
        )}
        {!compact && (
          <DetailItem label="Email" value={inquiry.email} compact={compact} />
        )}
      </dl>

      {compact ? (
        <div>
          <button
            type="button"
            onClick={() => setMessageOpen((open) => !open)}
            className="label-editorial text-[0.5625rem] text-muted underline-offset-2 hover:underline"
          >
            {messageOpen ? "Hide inquiry message" : "View inquiry message"}
          </button>
          {messageOpen && (
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-soft-black sm:text-sm">
              {inquiry.message}
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="label-editorial text-muted">Message</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-soft-black">
            {inquiry.message}
          </p>
        </div>
      )}

      {inquiry.attachmentUrls && inquiry.attachmentUrls.length > 0 && (
        <div>
          <p className="label-editorial text-[0.5625rem] text-muted sm:text-[0.625rem]">
            Attachments
          </p>
          <ul className="mt-1 space-y-1">
            {inquiry.attachmentUrls.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-soft-black underline-offset-2 hover:underline sm:text-sm"
                >
                  View attachment
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  label,
  value,
  compact,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div>
      <dt className={`text-muted ${compact ? "text-[0.625rem]" : "text-xs"}`}>
        {label}
      </dt>
      <dd
        className={`text-soft-black ${compact ? "mt-0.5 truncate" : "mt-1"}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

export function inquiryIsActive(status: SubmissionStatus): boolean {
  return !["declined", "archived", "booked"].includes(status);
}
