import type { InquiryQuotePackage } from "@/types/inquiry-quote";
import type { ServiceType } from "@/types/submission";

export type WorkOrderStatus =
  | "negotiating"
  | "deposit_contract"
  | "awaiting_service"
  | "awaiting_delivery"
  | "delivered"
  | "closed";

export interface WorkOrder {
  submissionId: string;
  userId: string;
  clientEmail: string;
  clientName: string;
  inquiryServiceType: ServiceType;
  packageId: string;
  packageSnapshot: InquiryQuotePackage;
  status: WorkOrderStatus;
  adminNotes?: string | null;
  contractLink?: string | null;
  workDriveLink?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

export interface WorkOrderRecord extends WorkOrder {
  id: string;
}

export const WORK_ORDER_STATUS_OPTIONS: {
  value: WorkOrderStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "negotiating",
    label: "Negotiating",
    description: "Reviewing package selection and details",
  },
  {
    value: "deposit_contract",
    label: "Deposit & Contract",
    description: "Deposit and contract in progress",
  },
  {
    value: "awaiting_service",
    label: "Awaiting Service",
    description: "Confirmed — awaiting shoot day",
  },
  {
    value: "awaiting_delivery",
    label: "Awaiting Delivery",
    description: "Service complete — preparing deliverables",
  },
  {
    value: "delivered",
    label: "Delivered",
    description: "Deliverables sent to client",
  },
  {
    value: "closed",
    label: "Closed",
    description: "Project complete",
  },
];

export function workOrderStatusLabel(status: WorkOrderStatus): string {
  return (
    WORK_ORDER_STATUS_OPTIONS.find((item) => item.value === status)?.label ??
    status
  );
}

export function workOrderStatusShortLabel(status: WorkOrderStatus): string {
  const short: Record<WorkOrderStatus, string> = {
    negotiating: "Negotiating",
    deposit_contract: "Contract",
    awaiting_service: "Service",
    awaiting_delivery: "Delivery",
    delivered: "Delivered",
    closed: "Closed",
  };
  return short[status] ?? workOrderStatusLabel(status);
}

export function workOrderStatusDescription(status: WorkOrderStatus): string {
  return (
    WORK_ORDER_STATUS_OPTIONS.find((item) => item.value === status)
      ?.description ?? ""
  );
}

export function isWorkOrderActive(status: WorkOrderStatus): boolean {
  return status !== "closed";
}

export function getWorkOrderProgressIndex(status: WorkOrderStatus): number {
  const index = WORK_ORDER_STATUS_OPTIONS.findIndex(
    (item) => item.value === status,
  );
  return index >= 0 ? index : 0;
}

export function hasWorkOrderClientResources(workOrder: {
  contractLink?: string | null;
  workDriveLink?: string | null;
}): boolean {
  return Boolean(
    workOrder.contractLink?.trim() || workOrder.workDriveLink?.trim(),
  );
}

export const MAX_WORK_ORDER_LINK_LENGTH = 2000;
