import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Work",
  description: "Portfolio, deliverables, and projects.",
  path: "/studio/dashboard/work",
  noIndex: true,
});

export default function Page() {
  return <DashboardApp section="work" />;
}
