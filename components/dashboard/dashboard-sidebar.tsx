"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getDashboardNavForRole,
  type DashboardNavItem,
} from "@/data/dashboard-nav";
import type { UserProfile } from "@/types/user";

type DashboardSidebarProps = {
  user: UserProfile;
  onSignOut: () => void;
  onNavigate?: () => void;
};

function isNavActive(pathname: string, item: DashboardNavItem): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const href = item.href.replace(/\/$/, "") || "/";

  if (item.id === "overview") {
    return normalized === href;
  }

  return normalized === href || normalized.startsWith(`${href}/`);
}

export function DashboardSidebar({
  user,
  onSignOut,
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const navItems = getDashboardNavForRole(user.role);
  const isAdmin = user.role === "admin";

  return (
    <aside className="flex h-full flex-col border-r border-taupe/40 bg-ivory-dark">
      <div className="border-b border-taupe/30 px-5 py-6">
        <Link
          href="/"
          onClick={onNavigate}
          className="font-display text-sm tracking-[0.18em] text-soft-black uppercase"
        >
          Studio
        </Link>
        <p className="mt-2 truncate text-sm text-soft-black-muted">
          {user.displayName ?? user.email}
        </p>
        <p className="label-editorial mt-1 text-[0.625rem] text-taupe">
          {isAdmin ? "Admin" : "Client Portal"}
        </p>
      </div>

      <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center justify-between gap-3 px-3 py-3 transition-colors ${active ? "bg-soft-black text-ivory" : "text-soft-black-muted hover:bg-ivory hover:text-soft-black"}`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="label-editorial text-[0.625rem]">
                    {item.label}
                  </span>
                  {item.comingSoon && (
                    <span
                      className={`text-[0.5625rem] tracking-[0.1em] uppercase ${active ? "text-ivory/70" : "text-muted"}`}
                    >
                      Soon
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-taupe/30 px-5 py-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="label-editorial block text-[0.625rem] text-muted transition-colors hover:text-soft-black"
        >
          ← Back to website
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="label-editorial mt-4 text-[0.625rem] text-soft-black-muted transition-colors hover:text-soft-black"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
