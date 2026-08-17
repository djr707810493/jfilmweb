import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Website",
  description: "Manage homepage hero carousel images.",
  path: "/studio/dashboard/website",
  noIndex: true,
});

export default function Page() {
  return <DashboardApp section="website" />;
}
