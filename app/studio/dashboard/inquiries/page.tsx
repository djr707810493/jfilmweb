import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Inquiries",
  description: "Manage and view client inquiries.",
  path: "/studio/dashboard/inquiries",
  noIndex: true,
});

export default function Page() {
  return <DashboardApp section="inquiries" />;
}
