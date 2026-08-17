import type { SubmissionStatus } from "@/types/submission";

const STATUS_STYLES: Record<
  SubmissionStatus,
  { badge: string; dot: string }
> = {
  new: {
    badge: "border-blue-200 bg-blue-50 text-blue-900",
    dot: "bg-blue-500",
  },
  reviewing: {
    badge: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
  },
  contacted: {
    badge: "border-violet-200 bg-violet-50 text-violet-900",
    dot: "bg-violet-500",
  },
  booked: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-900",
    dot: "bg-emerald-500",
  },
  declined: {
    badge: "border-stone-300 bg-stone-100 text-stone-700",
    dot: "bg-stone-400",
  },
  archived: {
    badge: "border-taupe/50 bg-ivory-dark text-muted",
    dot: "bg-taupe",
  },
};

type StatusBadgeProps = {
  status: SubmissionStatus;
  label: string;
  showDot?: boolean;
};

export function StatusBadge({ status, label, showDot = true }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.new;

  return (
    <span
      className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[0.625rem] font-medium tracking-[0.12em] uppercase ${styles.badge}`}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden />
      )}
      {label}
    </span>
  );
}

export function statusFilterStyles(active: boolean): string {
  return active
    ? "border-soft-black bg-soft-black text-ivory"
    : "border-taupe/40 bg-ivory text-soft-black-muted hover:border-soft-black/30 hover:text-soft-black";
}
