import Link from "next/link";
import {
  DashboardPageHeader,
  DashboardStat,
} from "@/components/dashboard/dashboard-layout";
import { getDashboardNavForRole } from "@/data/dashboard-nav";
import { siteConfig } from "@/data/site";
import type { UserProfile } from "@/types/user";

type OverviewPanelProps = {
  user: UserProfile;
  inquiryCount?: number;
  activeInquiryCount?: number;
  newInquiryCount?: number;
};

export function OverviewPanel({
  user,
  inquiryCount = 0,
  activeInquiryCount = 0,
  newInquiryCount = 0,
}: OverviewPanelProps) {
  const isAdmin = user.role === "admin";
  const navItems = getDashboardNavForRole(user.role).filter(
    (item) => item.id !== "overview",
  );

  return (
    <div>
      <DashboardPageHeader
        eyebrow={isAdmin ? "Admin Workspace" : "Client Portal"}
        title={
          isAdmin
            ? "Studio Dashboard"
            : `Welcome${user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}`
        }
        description={
          isAdmin
            ? "Manage inquiries, client work, galleries, and studio operations from one place."
            : `Track your inquiries and project progress with ${siteConfig.name}.`
        }
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
        {isAdmin ? (
          <>
            <DashboardStat label="Total Inquiries" value={inquiryCount} />
            <DashboardStat label="New" value={newInquiryCount} hint="Awaiting review" />
            <DashboardStat label="Active" value={activeInquiryCount} />
            <DashboardStat label="Modules" value={navItems.length} hint="Available sections" />
          </>
        ) : (
          <>
            <DashboardStat label="Your Inquiries" value={inquiryCount} />
            <DashboardStat label="Active" value={activeInquiryCount} />
            <DashboardStat
              label="Studio Email"
              value="Contact"
              hint={siteConfig.email}
              compact
            />
            <DashboardStat label="Work" value="Open" hint="Project progress" compact />
          </>
        )}
      </div>

      <section className="mt-6 md:mt-10">
        <p className="label-editorial">Quick Access</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-4 xl:grid-cols-3">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group border border-taupe/40 bg-ivory-dark p-3 transition-colors hover:border-soft-black/20 hover:bg-ivory sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="label-editorial text-[0.5625rem] text-soft-black sm:text-[0.625rem]">
                  {item.label}
                </p>
                {item.comingSoon && (
                  <span className="text-[0.5rem] tracking-[0.1em] text-muted uppercase sm:text-[0.5625rem]">
                    Soon
                  </span>
                )}
              </div>
              <p className="mt-2 hidden text-sm leading-relaxed text-soft-black-muted sm:mt-3 sm:block">
                {item.description}
              </p>
              <p className="label-editorial mt-2 text-[0.5625rem] text-muted transition-colors group-hover:text-soft-black sm:mt-4 sm:text-[0.625rem]">
                Open →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {!isAdmin && (
        <section className="mt-6 border border-taupe/40 bg-ivory p-4 md:mt-10 md:p-8">
          <p className="label-editorial">Need to reach us?</p>
          <p className="mt-3 text-sm text-soft-black-muted">
            Send a new inquiry or email the studio directly.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="label-editorial border border-soft-black bg-soft-black px-5 py-2.5 text-ivory"
            >
              New Inquiry
            </Link>
            <a
              href={`mailto:${siteConfig.email}`}
              className="label-editorial border border-taupe/40 px-5 py-2.5 text-soft-black"
            >
              Email Studio
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
