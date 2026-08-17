"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DashboardPageHeader,
  DashboardStat,
  dashboardInputClass,
  dashboardSelectClass,
} from "@/components/dashboard/dashboard-layout";
import { AdminWorkPackageEditor } from "@/components/dashboard/admin-work-package-editor";
import { InquiryQuoteView } from "@/components/dashboard/inquiry-quote-view";
import { WorkOrderClientResources } from "@/components/dashboard/work-order-client-resources";
import { WorkOrderProgress } from "@/components/dashboard/work-order-progress";
import {
  WorkOrderStatusBadge,
  workOrderStatusFilterStyles,
} from "@/components/dashboard/work-order-status-badge";
import {
  formatWorkOrderDate,
  getAllWorkOrders,
  updateWorkOrderAdmin,
} from "@/lib/firebase/work-orders";
import {
  WORK_ORDER_STATUS_OPTIONS,
  isWorkOrderActive,
  workOrderStatusDescription,
  workOrderStatusLabel,
  workOrderStatusShortLabel,
  type WorkOrderRecord,
  type WorkOrderStatus,
} from "@/types/work-order";

type StatusFilter = WorkOrderStatus | "all";

export function AdminWorkPanel() {
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<WorkOrderStatus>("negotiating");
  const [adminNotes, setAdminNotes] = useState("");
  const [contractLink, setContractLink] = useState("");
  const [workDriveLink, setWorkDriveLink] = useState("");
  const [packageSnapshot, setPackageSnapshot] =
    useState<WorkOrderRecord["packageSnapshot"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const detailRef = useRef<HTMLElement | null>(null);

  const loadWorkOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const results = await getAllWorkOrders();
      setWorkOrders(results);
      setSelectedId((prev) => prev ?? results[0]?.id ?? null);
    } catch {
      setError("Could not load work orders. Check Firestore rules and admin access.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkOrders();
  }, [loadWorkOrders]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return workOrders;
    return workOrders.filter((item) => item.status === statusFilter);
  }, [workOrders, statusFilter]);

  const selected = filtered.find((item) => item.id === selectedId)
    ?? filtered[0]
    ?? null;

  useEffect(() => {
    if (!selected) {
      setPackageSnapshot(null);
      return;
    }
    setStatus(selected.status);
    setAdminNotes(selected.adminNotes ?? "");
    setContractLink(selected.contractLink ?? "");
    setWorkDriveLink(selected.workDriveLink ?? "");
    setPackageSnapshot(selected.packageSnapshot);
    setActionError("");
  }, [selected]);

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!filtered.some((item) => item.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const stats = useMemo(() => {
    const counts: Record<WorkOrderStatus, number> = {
      negotiating: 0,
      deposit_contract: 0,
      awaiting_service: 0,
      awaiting_delivery: 0,
      delivered: 0,
      closed: 0,
    };
    for (const item of workOrders) counts[item.status] += 1;
    return counts;
  }, [workOrders]);

  function handleSelectWorkOrder(id: string) {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!selected || !packageSnapshot) return;

    if (!packageSnapshot.name.trim() || !packageSnapshot.price.trim()) {
      setActionError("Package name and price are required.");
      return;
    }

    setSaving(true);
    setActionError("");

    try {
      await updateWorkOrderAdmin(selected.id, {
        status,
        packageSnapshot,
        adminNotes,
        contractLink,
        workDriveLink,
      });

      setWorkOrders((prev) =>
        prev.map((item) =>
          item.id === selected.id
            ? {
                ...item,
                status,
                packageSnapshot,
                adminNotes: adminNotes.trim() || null,
                contractLink: contractLink.trim() || null,
                workDriveLink: workDriveLink.trim() || null,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch {
      setActionError("Could not save work order. Check Firestore rules and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Admin"
        title="Work"
        description="Manage client work orders, package details, and project status."
      />

      <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-8 sm:gap-3 md:grid-cols-3 lg:grid-cols-6">
        {WORK_ORDER_STATUS_OPTIONS.map((option) => (
          <DashboardStat
            key={option.value}
            label={option.label}
            value={stats[option.value]}
            compact
          />
        ))}
      </div>

      <div className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:mb-6 sm:overflow-visible sm:px-0">
        <div className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap">
          <FilterButton
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
            label="All"
          />
          {WORK_ORDER_STATUS_OPTIONS.map((option) => (
            <FilterButton
              key={option.value}
              active={statusFilter === option.value}
              onClick={() => setStatusFilter(option.value)}
              label={option.label}
              shortLabel={workOrderStatusShortLabel(option.value)}
            />
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-sm text-soft-black-muted">Loading work orders…</p>
      )}
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && workOrders.length === 0 && (
        <div className="border border-dashed border-taupe/40 bg-ivory-dark p-6 text-center sm:p-8">
          <p className="text-sm text-soft-black-muted">
            No work orders yet. They appear here when a client submits a package
            selection from their quote.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-6">
          <label className="block lg:hidden">
            <span className="label-editorial text-soft-black">Work order</span>
            <select
              value={selected?.id ?? ""}
              onChange={(e) => handleSelectWorkOrder(e.target.value)}
              className={dashboardSelectClass}
            >
              {filtered.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.clientName} · {item.packageSnapshot.name}
                </option>
              ))}
            </select>
          </label>

          <aside className="hidden border border-taupe/40 bg-ivory-dark lg:block">
            <ul className="divide-y divide-taupe/30">
              {filtered.map((item) => {
                const active = selected?.id === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectWorkOrder(item.id)}
                      className={`w-full px-4 py-4 text-left transition-colors ${
                        active ? "bg-ivory" : "hover:bg-ivory/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display text-base text-soft-black">
                          {item.clientName}
                        </p>
                        {isWorkOrderActive(item.status) && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-muted">
                        {item.packageSnapshot.name}
                      </p>
                      <p className="mt-2">
                        <WorkOrderStatusBadge
                          status={item.status}
                          label={workOrderStatusLabel(item.status)}
                          dense
                        />
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {selected && packageSnapshot && (
            <section
              ref={detailRef}
              className="border border-taupe/40 bg-ivory p-4 sm:p-6 md:p-8"
            >
              <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="label-editorial text-muted">Work order</p>
                  <h2 className="font-display mt-1 truncate text-xl text-soft-black sm:text-2xl">
                    {selected.clientName}
                  </h2>
                  <p className="mt-1 text-xs text-soft-black-muted sm:mt-2 sm:text-sm">
                    Submitted {formatWorkOrderDate(selected.createdAt)}
                    {selected.updatedAt
                      ? ` · Updated ${formatWorkOrderDate(selected.updatedAt)}`
                      : ""}
                  </p>
                </div>
                <WorkOrderStatusBadge
                  status={selected.status}
                  label={workOrderStatusLabel(selected.status)}
                  dense
                />
              </div>

              <form onSubmit={handleSave} className="space-y-6 md:space-y-8">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <InfoField label="Client email" value={selected.clientEmail} />
                  <InfoField
                    label="Inquiry ID"
                    value={selected.submissionId.slice(0, 8) + "…"}
                  />
                </div>

                <label className="block">
                  <span className="label-editorial text-soft-black">Status</span>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as WorkOrderStatus)
                    }
                    className={dashboardSelectClass}
                  >
                    {WORK_ORDER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {workOrderStatusLabel(option.value)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-soft-black-muted">
                    {workOrderStatusDescription(status)}
                  </p>
                </label>

                <WorkOrderProgress status={status} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="label-editorial text-soft-black">
                      Contract link
                    </span>
                    <input
                      type="url"
                      inputMode="url"
                      autoComplete="off"
                      value={contractLink}
                      onChange={(e) => setContractLink(e.target.value)}
                      className={dashboardInputClass}
                      placeholder="https://…"
                    />
                    <p className="mt-1 text-[0.6875rem] text-muted">
                      Visible to client when set
                    </p>
                  </label>
                  <label className="block">
                    <span className="label-editorial text-soft-black">
                      Work Drive link
                    </span>
                    <input
                      type="url"
                      inputMode="url"
                      autoComplete="off"
                      value={workDriveLink}
                      onChange={(e) => setWorkDriveLink(e.target.value)}
                      className={dashboardInputClass}
                      placeholder="https://…"
                    />
                    <p className="mt-1 text-[0.6875rem] text-muted">
                      Visible to client when set
                    </p>
                  </label>
                </div>

                <AdminWorkPackageEditor
                  packageSnapshot={packageSnapshot}
                  onChange={setPackageSnapshot}
                />

                <label className="block">
                  <span className="label-editorial text-soft-black">
                    Internal notes
                  </span>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className={`${dashboardInputClass} min-h-[5rem] resize-y`}
                    placeholder="Notes visible to admin only"
                  />
                </label>

                <div className="space-y-4 border-t border-taupe/30 pt-5 md:space-y-6 md:pt-6">
                  <p className="label-editorial">Client view preview</p>
                  <WorkOrderProgress status={status} compact />
                  <WorkOrderClientResources
                    workOrder={{
                      contractLink: contractLink.trim() || null,
                      workDriveLink: workDriveLink.trim() || null,
                    }}
                  />
                  <InquiryQuoteView
                    quote={{
                      introMessage: null,
                      status: "published",
                      packages: [packageSnapshot],
                    }}
                    mode="client"
                    compact
                  />
                </div>

                {actionError && (
                  <p className="text-sm text-red-700" role="alert">
                    {actionError}
                  </p>
                )}

                <div className="sticky bottom-0 z-10 -mx-4 border-t border-taupe/30 bg-ivory/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                  <button
                    type="submit"
                    disabled={saving}
                    className="label-editorial w-full border border-soft-black bg-soft-black px-5 py-3 text-ivory disabled:opacity-40 sm:w-auto sm:py-2.5"
                  >
                    {saving ? "Saving…" : "Save work order"}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  shortLabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  shortLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`label-editorial shrink-0 border px-3 py-2 text-[0.625rem] transition-colors ${workOrderStatusFilterStyles(active)}`}
    >
      <span className="sm:hidden">{shortLabel ?? label}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-taupe/30 bg-ivory-dark px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="label-editorial text-[0.5625rem] text-muted sm:text-[0.625rem]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm text-soft-black" title={value}>
        {value}
      </p>
    </div>
  );
}
