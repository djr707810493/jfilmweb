"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClientQuoteSelector } from "@/components/dashboard/client-quote-selector";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-layout";
import { InquiryDetail } from "@/components/dashboard/inquiry-detail";
import { InquiryQuoteView } from "@/components/dashboard/inquiry-quote-view";
import {
  getClientSubmissions,
  linkUnclaimedSubmissionsForUser,
} from "@/lib/firebase/submissions";
import { isQuoteVisibleToClient } from "@/types/inquiry-quote";
import { submissionStatusLabel } from "@/types/submission";
import type { SubmissionRecord } from "@/types/submission";
import type { UserProfile } from "@/types/user";

type ClientInquiriesPanelProps = {
  user: UserProfile;
};

export function ClientInquiriesPanel({ user }: ClientInquiriesPanelProps) {
  const [inquiries, setInquiries] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const { uid, email } = user;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        await linkUnclaimedSubmissionsForUser(uid, email);
        const results = await getClientSubmissions(uid, email);
        if (!cancelled) {
          setInquiries(results);
          if (results.length === 1) setExpandedId(results[0].id);
        }
      } catch {
        if (!cancelled) setError("Could not load your inquiries.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Client Portal"
        title="Inquiries"
        description="Your inquiries, quotes, and package selections."
      />

      <div className="mb-4 flex flex-wrap justify-end sm:mb-6">
        <Link
          href="/contact"
          className="label-editorial border border-soft-black/20 px-3 py-2 text-soft-black transition-colors hover:bg-soft-black hover:text-ivory sm:px-4 sm:py-2.5"
        >
          New Inquiry
        </Link>
      </div>

      {loading && (
        <p className="text-sm text-soft-black-muted">Loading inquiries…</p>
      )}
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && inquiries.length === 0 && (
        <div className="border border-dashed border-taupe/40 p-6 text-center sm:p-8">
          <p className="text-sm text-soft-black-muted">
            No inquiries linked to your account yet.
          </p>
          <Link
            href="/contact"
            className="label-editorial mt-4 inline-block text-soft-black underline-offset-2 hover:underline"
          >
            Send your first inquiry
          </Link>
        </div>
      )}

      {!loading && inquiries.length > 0 && (
        <ul className="divide-y divide-taupe/30 border-y border-taupe/30">
          {inquiries.map((inquiry) => {
            const expanded = expandedId === inquiry.id;
            const hasQuote = isQuoteVisibleToClient(inquiry.quote);

            return (
              <li key={inquiry.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : inquiry.id)}
                  className="flex w-full items-center justify-between gap-3 py-4 text-left transition-colors hover:bg-ivory-dark/30 sm:py-5"
                >
                  <div className="min-w-0">
                    <p className="font-display truncate text-base text-soft-black sm:text-lg">
                      {inquiry.name}
                    </p>
                    <p className="mt-0.5 truncate text-[0.6875rem] text-muted sm:text-xs">
                      {submissionStatusLabel(inquiry.status)}
                      {inquiry.location ? ` · ${inquiry.location}` : ""}
                      {hasQuote ? " · Quote ready" : ""}
                    </p>
                  </div>
                  <span className="label-editorial shrink-0 text-[0.5625rem] text-muted sm:text-[0.625rem]">
                    {expanded ? "Hide" : "Open"}
                  </span>
                </button>

                {expanded && (
                  <div className="space-y-5 border-t border-taupe/20 pb-5 pt-4">
                    <InquiryDetail inquiry={inquiry} compact />

                    {hasQuote ? (
                      <ClientQuoteSelector
                        inquiry={inquiry}
                        userId={user.uid}
                      />
                    ) : (
                      <div>
                        <p className="label-editorial mb-2 text-[0.5625rem] sm:text-[0.625rem]">
                          Your Quote
                        </p>
                        <InquiryQuoteView
                          quote={inquiry.quote}
                          mode="client"
                          compact
                        />
                      </div>
                    )}
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
