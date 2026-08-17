import type { InquiryQuote } from "@/types/inquiry-quote";

export type ServiceType = "photography" | "videography" | "both";

export type SubmissionStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "booked"
  | "declined"
  | "archived";

export interface Submission {
  name: string;
  email: string;
  phone?: string | null;
  serviceType: ServiceType;
  preferredDate?: string | null;
  location?: string | null;
  budget?: string | null;
  message: string;
  attachmentUrls?: string[];
  status: SubmissionStatus;
  userId?: string | null;
  createdAt: Date | string;
  linkedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  quote?: InquiryQuote | null;
}

export interface SubmissionRecord extends Submission {
  id: string;
}

/** Client-side form payload before persistence */
export type SubmissionInput = {
  name: string;
  email: string;
  phone?: string;
  serviceType: ServiceType;
  preferredDate?: string;
  location?: string;
  budget?: string;
  message: string;
};

export const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "both", label: "Both" },
];

const LEGACY_SERVICE_TYPE_LABELS: Record<string, string> = {
  wedding: "Photography",
  elopement: "Photography",
  "film-digital": "Photography",
  other: "Photography",
};

export const SUBMISSION_STATUS_OPTIONS: {
  value: SubmissionStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "new",
    label: "New",
    description: "Inquiry received — awaiting review",
  },
  {
    value: "reviewing",
    label: "Reviewing",
    description: "Studio is reviewing your inquiry",
  },
  {
    value: "contacted",
    label: "Contacted",
    description: "We've reached out to discuss details",
  },
  {
    value: "booked",
    label: "Booked",
    description: "Booking confirmed",
  },
  {
    value: "declined",
    label: "Declined",
    description: "Not moving forward at this time",
  },
  {
    value: "archived",
    label: "Archived",
    description: "Closed for reference",
  },
];

export const MAX_ATTACHMENT_COUNT = 5;
export const MAX_ATTACHMENT_SIZE_MB = 50;
export const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export function submissionStatusLabel(status: SubmissionStatus): string {
  return (
    SUBMISSION_STATUS_OPTIONS.find((option) => option.value === status)
      ?.label ?? status
  );
}

export function submissionStatusDescription(status: SubmissionStatus): string {
  return (
    SUBMISSION_STATUS_OPTIONS.find((option) => option.value === status)
      ?.description ?? ""
  );
}

export function serviceTypeLabel(value: ServiceType | string): string {
  const match = SERVICE_TYPE_OPTIONS.find((option) => option.value === value);
  if (match) return match.label;
  return LEGACY_SERVICE_TYPE_LABELS[value] ?? value;
}

export function normalizeServiceType(value: unknown): ServiceType {
  if (value === "photography" || value === "videography" || value === "both") {
    return value;
  }
  return "photography";
}
