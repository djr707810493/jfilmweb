import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Dashboard",
  description: "J FILM STUDIO client and admin dashboard.",
  path: "/studio/dashboard",
  noIndex: true,
});

export default function Page() {
  return <DashboardApp section="overview" />;
}
