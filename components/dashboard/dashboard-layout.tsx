"use client";

import { useState, type ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import type { UserProfile } from "@/types/user";

type DashboardLayoutProps = {
  user: UserProfile;
  onSignOut: () => void;
  children: ReactNode;
};

export function DashboardLayout({
  user,
  onSignOut,
  children,
}: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ivory">
      <div className="flex min-h-screen">
        <div className="hidden w-56 shrink-0 lg:block xl:w-60">
          <div className="fixed inset-y-0 left-0 w-56 xl:w-60">
            <DashboardSidebar user={user} onSignOut={onSignOut} />
          </div>
        </div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-soft-black/40"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[min(100%,16rem)] shadow-xl">
              <DashboardSidebar
                user={user}
                onSignOut={onSignOut}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-taupe/40 bg-ivory/95 px-5 py-4 backdrop-blur-sm lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="label-editorial text-soft-black"
              aria-expanded={mobileNavOpen}
            >
              Menu
            </button>
            <p className="label-editorial text-muted">Dashboard</p>
            <button
              type="button"
              onClick={onSignOut}
              className="label-editorial text-[0.625rem] text-soft-black-muted"
            >
              Out
            </button>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-5 md:px-8 md:py-10 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-5 md:mb-8 lg:mb-10">
      {eyebrow && <p className="label-editorial text-muted">{eyebrow}</p>}
      <h1 className="font-display mt-1.5 text-2xl text-soft-black sm:mt-2 sm:text-3xl md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-soft-black-muted md:mt-3 md:text-base">
          {description}
        </p>
      )}
    </header>
  );
}

export function DashboardStat({
  label,
  value,
  hint,
  compact,
}: {
  label: string;
  value: string | number;
  hint?: string;
  /** Use smaller typography — good for long values like email hints */
  compact?: boolean;
}) {
  return (
    <div className="border border-taupe/40 bg-ivory-dark p-3 sm:p-5 md:p-6">
      <p className="label-editorial text-[0.5625rem] text-muted sm:text-[0.625rem]">
        {label}
      </p>
      <p
        className={`font-display mt-1 text-soft-black sm:mt-2 ${compact ? "text-lg sm:text-xl md:text-2xl" : "text-2xl sm:text-3xl"}`}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 truncate text-[0.6875rem] text-soft-black-muted sm:mt-2 sm:text-xs">
          {hint}
        </p>
      )}
    </div>
  );
}

export const dashboardInputClass =
  "mt-2 w-full border border-taupe/40 bg-ivory px-3 py-2.5 text-base text-soft-black outline-none focus:border-soft-black/40 sm:px-4 sm:py-3 sm:text-sm";

export const dashboardSelectClass = dashboardInputClass;
