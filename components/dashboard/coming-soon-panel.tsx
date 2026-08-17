import { DashboardPageHeader } from "@/components/dashboard/dashboard-layout";
import { getDashboardNavItem, type DashboardSectionId } from "@/data/dashboard-nav";

type ComingSoonPanelProps = {
  section: DashboardSectionId;
};

export function ComingSoonPanel({ section }: ComingSoonPanelProps) {
  const navItem = getDashboardNavItem(section);

  return (
    <div>
      <DashboardPageHeader
        title={navItem?.label ?? "Coming Soon"}
        description={navItem?.description}
      />
      <div className="border border-dashed border-taupe/40 bg-ivory-dark px-6 py-16 text-center md:px-10">
        <p className="label-editorial text-soft-black">Coming Soon</p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-soft-black-muted">
          This section is part of the studio dashboard roadmap. We&apos;re
          building {navItem?.label.toLowerCase() ?? "this module"} next —
          check back soon.
        </p>
      </div>
    </div>
  );
}
