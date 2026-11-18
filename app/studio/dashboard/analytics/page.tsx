import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Analytics",
  description: "GA4 traffic, engagement, and conversion reports.",
  path: "/studio/dashboard/analytics",
  noIndex: true,
});

export default function Page() {
  return <DashboardApp section="analytics" />;
}
