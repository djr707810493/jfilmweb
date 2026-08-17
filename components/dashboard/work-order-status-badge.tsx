import type { WorkOrderStatus } from "@/types/work-order";

const STATUS_STYLES: Record<
  WorkOrderStatus,
  { badge: string; dot: string }
> = {
  negotiating: {
    badge: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
  },
  deposit_contract: {
    badge: "border-violet-200 bg-violet-50 text-violet-900",
    dot: "bg-violet-500",
  },
  awaiting_service: {
    badge: "border-blue-200 bg-blue-50 text-blue-900",
    dot: "bg-blue-500",
  },
  awaiting_delivery: {
    badge: "border-indigo-200 bg-indigo-50 text-indigo-900",
    dot: "bg-indigo-500",
  },
  delivered: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-900",
    dot: "bg-emerald-500",
  },
  closed: {
    badge: "border-taupe/50 bg-ivory-dark text-muted",
    dot: "bg-taupe",
  },
};

type WorkOrderStatusBadgeProps = {
  status: WorkOrderStatus;
  label: string;
  showDot?: boolean;
  /** Tighter badge for narrow mobile layouts */
  dense?: boolean;
};

export function WorkOrderStatusBadge({
  status,
  label,
  showDot = true,
  dense = false,
}: WorkOrderStatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.negotiating;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 border uppercase ${
        dense
          ? "px-2 py-0.5 text-[0.5625rem] tracking-[0.1em]"
          : "gap-2 px-2.5 py-1 text-[0.625rem] tracking-[0.12em]"
      } font-medium ${styles.badge}`}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} aria-hidden />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}

export function workOrderStatusFilterStyles(active: boolean): string {
  return active
    ? "border-soft-black bg-soft-black text-ivory"
    : "border-taupe/40 bg-ivory text-soft-black-muted hover:border-soft-black/30 hover:text-soft-black";
}
