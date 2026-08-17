"use client";

import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-layout";
import { InquiryQuoteView } from "@/components/dashboard/inquiry-quote-view";
import { WorkOrderClientResources } from "@/components/dashboard/work-order-client-resources";
import { WorkOrderProgress } from "@/components/dashboard/work-order-progress";
import { WorkOrderStatusBadge } from "@/components/dashboard/work-order-status-badge";
import {
  formatWorkOrderDate,
  getClientWorkOrders,
} from "@/lib/firebase/work-orders";
import {
  workOrderStatusShortLabel,
  type WorkOrderRecord,
} from "@/types/work-order";
import type { UserProfile } from "@/types/user";

type ClientWorkPanelProps = {
  user: UserProfile;
};

export function ClientWorkPanel({ user }: ClientWorkPanelProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const results = await getClientWorkOrders(user.uid);
        if (!cancelled) {
          setWorkOrders(results);
          if (results.length === 1) setExpandedId(results[0].id);
        }
      } catch {
        if (!cancelled) setError("Could not load your work orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user.uid]);

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Client Portal"
        title="Work"
        description="Track your selected packages and project progress."
      />

      {loading && (
        <p className="text-sm text-soft-black-muted">Loading work orders…</p>
      )}
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && workOrders.length === 0 && (
        <div className="border border-dashed border-taupe/40 p-6 text-center sm:p-8">
          <p className="text-sm text-soft-black-muted">
            No work orders yet. Select a package from your inquiry quote to
            get started.
          </p>
        </div>
      )}

      {!loading && workOrders.length > 0 && (
        <ul className="divide-y divide-taupe/30 border-y border-taupe/30">
          {workOrders.map((workOrder) => {
            const expanded = expandedId === workOrder.id;
            return (
              <li key={workOrder.id}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(expanded ? null : workOrder.id)
                  }
                  className="flex w-full items-start gap-3 py-4 text-left transition-colors active:bg-ivory-dark/40 sm:gap-4 sm:py-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base text-soft-black sm:text-lg">
                      {workOrder.packageSnapshot.name}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <WorkOrderStatusBadge
                        status={workOrder.status}
                        label={workOrderStatusShortLabel(workOrder.status)}
                        dense
                      />
                      <span className="text-[0.6875rem] text-muted sm:text-xs">
                        {formatWorkOrderDate(workOrder.createdAt)}
                      </span>
                    </div>
                    {!expanded && (
                      <div className="mt-3 pr-1">
                        <WorkOrderProgress
                          status={workOrder.status}
                          compact
                        />
                      </div>
                    )}
                  </div>
                  <span className="label-editorial shrink-0 pt-0.5 text-[0.5625rem] text-muted sm:text-[0.625rem]">
                    {expanded ? "Hide" : "Open"}
                  </span>
                </button>

                {expanded && (
                  <div className="space-y-4 border-t border-taupe/20 pb-4 pt-3 sm:space-y-5 sm:pb-5 sm:pt-4">
                    <WorkOrderProgress status={workOrder.status} />

                    <WorkOrderClientResources workOrder={workOrder} />

                    <div>
                      <p className="label-editorial mb-2 text-[0.5625rem] sm:mb-3 sm:text-[0.625rem]">
                        Package details
                      </p>
                      <InquiryQuoteView
                        quote={{
                          introMessage: null,
                          status: "published",
                          packages: [workOrder.packageSnapshot],
                        }}
                        mode="client"
                        compact
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
