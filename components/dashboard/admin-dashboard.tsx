"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DashboardPageHeader,
  DashboardStat,
  dashboardInputClass,
  dashboardSelectClass,
} from "@/components/dashboard/dashboard-layout";
import { InquiryDetail } from "@/components/dashboard/inquiry-detail";
import { AdminQuoteEditor } from "@/components/dashboard/admin-quote-editor";
import { StatusBadge, statusFilterStyles } from "@/components/dashboard/status-badge";
import {
  deleteSubmission,
  formatSubmissionDate,
  getAllSubmissions,
  updateSubmissionAdmin,
  updateSubmissionStatus,
} from "@/lib/firebase/submissions";
import {
  SERVICE_TYPE_OPTIONS,
  SUBMISSION_STATUS_OPTIONS,
  serviceTypeLabel,
  submissionStatusLabel,
  type SubmissionRecord,
  type SubmissionStatus,
} from "@/types/submission";
import { isQuoteVisibleToClient } from "@/types/inquiry-quote";
import type { InquiryQuote } from "@/types/inquiry-quote";

type StatusFilter = SubmissionStatus | "all";
type InquiryDetailTab = "details" | "quote";

const INQUIRY_PAGE_SIZE = 8;

type EditFormState = {
  name: string;
  email: string;
  phone: string;
  serviceType: SubmissionRecord["serviceType"];
  preferredDate: string;
  location: string;
  budget: string;
  message: string;
  status: SubmissionStatus;
};

export function AdminInquiriesPanel() {
  const [inquiries, setInquiries] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SubmissionRecord | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [detailTab, setDetailTab] = useState<InquiryDetailTab>("details");

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const results = await getAllSubmissions();
      setInquiries(results);
      setSelectedId((prev) => prev ?? results[0]?.id ?? null);
    } catch {
      setError("Could not load inquiries. Check Firestore rules and admin access.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  useEffect(() => {
    setDetailTab("details");
  }, [selectedId]);

  function handleQuoteUpdated(quote: InquiryQuote | null) {
    if (!selectedId) return;
    setInquiries((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, quote } : item,
      ),
    );
  }

  const filtered = useMemo(() => {
    if (statusFilter === "all") return inquiries;
    return inquiries.filter((item) => item.status === statusFilter);
  }, [inquiries, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / INQUIRY_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(
    currentPage * INQUIRY_PAGE_SIZE,
    currentPage * INQUIRY_PAGE_SIZE + INQUIRY_PAGE_SIZE,
  );

  const selected = filtered.find((item) => item.id === selectedId)
    ?? filtered[0]
    ?? null;

  const stats = useMemo(() => {
    const counts: Record<SubmissionStatus, number> = {
      new: 0,
      reviewing: 0,
      contacted: 0,
      booked: 0,
      declined: 0,
      archived: 0,
    };
    for (const item of inquiries) counts[item.status] += 1;
    return counts;
  }, [inquiries]);

  function openEdit(inquiry: SubmissionRecord) {
    setEditing(inquiry);
    setEditForm({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone ?? "",
      serviceType: inquiry.serviceType,
      preferredDate: inquiry.preferredDate ?? "",
      location: inquiry.location ?? "",
      budget: inquiry.budget ?? "",
      message: inquiry.message,
      status: inquiry.status,
    });
    setActionError("");
  }

  function closeEdit() {
    setEditing(null);
    setEditForm(null);
    setActionError("");
  }

  async function handleStatusChange(
    inquiry: SubmissionRecord,
    status: SubmissionStatus,
  ) {
    setActionError("");
    try {
      await updateSubmissionStatus(inquiry.id, status);
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === inquiry.id ? { ...item, status } : item,
        ),
      );
    } catch {
      setActionError("Could not update status.");
    }
  }

  async function handleDelete(inquiry: SubmissionRecord) {
    if (
      !window.confirm(
        `Delete inquiry from ${inquiry.name}? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingId(inquiry.id);
    setActionError("");
    try {
      await deleteSubmission(inquiry.id);
      setInquiries((prev) => prev.filter((item) => item.id !== inquiry.id));
      if (selectedId === inquiry.id) setSelectedId(null);
      if (editing?.id === inquiry.id) closeEdit();
    } catch {
      setActionError("Could not delete inquiry.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || !editForm) return;

    setSaving(true);
    setActionError("");
    try {
      await updateSubmissionAdmin(editing.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || null,
        serviceType: editForm.serviceType,
        preferredDate: editForm.preferredDate || null,
        location: editForm.location || null,
        budget: editForm.budget || null,
        message: editForm.message,
        status: editForm.status,
        attachmentUrls: editing.attachmentUrls ?? [],
        userId: editing.userId ?? null,
      });

      setInquiries((prev) =>
        prev.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                name: editForm.name.trim(),
                email: editForm.email.trim().toLowerCase(),
                phone: editForm.phone || null,
                serviceType: editForm.serviceType,
                preferredDate: editForm.preferredDate || null,
                location: editForm.location || null,
                budget: editForm.budget || null,
                message: editForm.message.trim(),
                status: editForm.status,
              }
            : item,
        ),
      );
      closeEdit();
    } catch {
      setActionError("Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Admin Workspace"
        title="Inquiries"
        description="Review, update status, edit details, and manage all client inquiries."
      />

      <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-4 lg:grid-cols-4">
        <DashboardStat label="Total" value={inquiries.length} />
        <DashboardStat label="New" value={stats.new} hint="Awaiting review" />
        <DashboardStat label="In Progress" value={stats.reviewing + stats.contacted} />
        <DashboardStat label="Booked" value={stats.booked} />
      </div>

      {actionError && (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {actionError}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterButton
          active={statusFilter === "all"}
          onClick={() => {
            setStatusFilter("all");
            setPage(0);
          }}
          label={`All (${inquiries.length})`}
        />
        {SUBMISSION_STATUS_OPTIONS.map((option) => (
          <FilterButton
            key={option.value}
            active={statusFilter === option.value}
            onClick={() => {
              setStatusFilter(option.value);
              setPage(0);
            }}
            label={`${option.label} (${stats[option.value]})`}
          />
        ))}
      </div>

      {loading && (
        <p className="mt-10 text-sm text-soft-black-muted">Loading inquiries…</p>
      )}
      {error && (
        <p className="mt-10 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-10 border border-dashed border-taupe/40 p-10 text-center">
          <p className="text-sm text-soft-black-muted">
            No inquiries match this filter.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <section className="border border-taupe/40 bg-ivory-dark">
            <div className="border-b border-taupe/30 px-5 py-4">
              <p className="label-editorial">Inquiry List</p>
            </div>
            <ul className="divide-y divide-taupe/25">
              {pageItems.map((inquiry) => (
                <li key={inquiry.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(inquiry.id)}
                    className={`w-full px-5 py-4 text-left transition-colors ${selected?.id === inquiry.id ? "bg-ivory" : "hover:bg-ivory/70"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-soft-black">
                          {inquiry.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted">
                          {inquiry.email}
                        </p>
                        <p className="mt-2 text-xs text-soft-black-muted">
                          {serviceTypeLabel(inquiry.serviceType)}
                          {inquiry.location ? ` · ${inquiry.location}` : ""}
                        </p>
                      </div>
                      <StatusBadge
                        status={inquiry.status}
                        label={submissionStatusLabel(inquiry.status)}
                        showDot={false}
                      />
                    </div>
                    <p className="mt-2 text-[0.6875rem] text-muted">
                      {formatSubmissionDate(inquiry.createdAt)}
                      {isQuoteVisibleToClient(inquiry.quote) ? " · Quote sent" : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            {pageCount > 1 && (
              <div className="flex items-center justify-between gap-3 border-t border-taupe/30 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="label-editorial text-[0.625rem] text-soft-black disabled:opacity-30"
                >
                  Previous
                </button>
                <p className="text-xs text-soft-black-muted">
                  {currentPage + 1} / {pageCount}
                </p>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= pageCount - 1}
                  className="label-editorial text-[0.625rem] text-soft-black disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </section>

          {selected && (
            <section className="border border-taupe/40 bg-ivory p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="label-editorial">Inquiry Detail</p>
                  <h2 className="font-display mt-2 text-2xl text-soft-black">
                    {selected.name}
                  </h2>
                  <p className="mt-1 text-sm text-soft-black-muted">
                    {selected.email}
                    {selected.phone ? ` · ${selected.phone}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(selected)}
                    className="label-editorial border border-soft-black/20 px-4 py-2 text-soft-black transition-colors hover:bg-soft-black hover:text-ivory"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selected)}
                    disabled={deletingId === selected.id}
                    className="label-editorial border border-red-200 px-4 py-2 text-red-800 transition-colors hover:bg-red-50 disabled:opacity-40"
                  >
                    {deletingId === selected.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-2 border-b border-taupe/30">
                <DetailTabButton
                  active={detailTab === "details"}
                  onClick={() => setDetailTab("details")}
                  label="Details"
                />
                <DetailTabButton
                  active={detailTab === "quote"}
                  onClick={() => setDetailTab("quote")}
                  label="Quote"
                />
              </div>

              {detailTab === "details" ? (
                <>
              <div className="mt-6">
                <label className="block">
                  <span className="label-editorial text-soft-black">Status</span>
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selected,
                        e.target.value as SubmissionStatus,
                      )
                    }
                    className={dashboardSelectClass}
                  >
                    {SUBMISSION_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-8 border-t border-taupe/30 pt-8">
                <InquiryDetail inquiry={selected} />
              </div>

              <dl className="mt-8 grid gap-3 border-t border-taupe/30 pt-6 text-xs text-muted sm:grid-cols-2">
                <div>
                  <dt>Linked account</dt>
                  <dd className="mt-1 text-soft-black">
                    {selected.userId ? "Yes" : "Not linked"}
                  </dd>
                </div>
                <div>
                  <dt>Last updated</dt>
                  <dd className="mt-1 text-soft-black">
                    {formatSubmissionDate(selected.updatedAt)}
                  </dd>
                </div>
              </dl>
                </>
              ) : (
                <div className="mt-6">
                  <AdminQuoteEditor
                    inquiry={selected}
                    onQuoteUpdated={handleQuoteUpdated}
                  />
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {editing && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-soft-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-inquiry-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-taupe/40 bg-ivory p-6 shadow-xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-editorial">Edit Inquiry</p>
                <h2
                  id="edit-inquiry-title"
                  className="font-display mt-2 text-2xl text-soft-black"
                >
                  {editing.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="label-editorial text-muted hover:text-soft-black"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name">
                  <input
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className={dashboardInputClass}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className={dashboardInputClass}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone">
                  <input
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className={dashboardInputClass}
                  />
                </Field>
                <Field label="Service">
                  <select
                    value={editForm.serviceType}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        serviceType: e.target.value as EditFormState["serviceType"],
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preferred date">
                  <input
                    type="date"
                    value={editForm.preferredDate}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        preferredDate: e.target.value,
                      })
                    }
                    className={dashboardInputClass}
                  />
                </Field>
                <Field label="Location">
                  <input
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    className={dashboardInputClass}
                  />
                </Field>
              </div>

              <Field label="Budget">
                <input
                  value={editForm.budget}
                  onChange={(e) =>
                    setEditForm({ ...editForm, budget: e.target.value })
                  }
                  className={dashboardInputClass}
                />
              </Field>

              <Field label="Status">
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value as SubmissionStatus,
                    })
                  }
                  className={dashboardSelectClass}
                >
                  {SUBMISSION_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Message">
                <textarea
                  required
                  rows={5}
                  value={editForm.message}
                  onChange={(e) =>
                    setEditForm({ ...editForm, message: e.target.value })
                  }
                  className={`${dashboardInputClass} min-h-[8rem] resize-y`}
                />
              </Field>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="label-editorial min-h-[3rem] border border-soft-black bg-soft-black px-6 py-3 text-ivory disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="label-editorial min-h-[3rem] border border-taupe/40 px-6 py-3 text-soft-black-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function DetailTabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`label-editorial border-b-2 px-4 py-2 text-[0.625rem] transition-colors ${active ? "border-soft-black text-soft-black" : "border-transparent text-muted hover:text-soft-black"}`}
    >
      {label}
    </button>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`label-editorial border px-3 py-2 text-[0.625rem] transition-colors ${statusFilterStyles(active)}`}
    >
      {label}
    </button>
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
