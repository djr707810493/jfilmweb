import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Messages",
  description: "Studio communication.",
  path: "/studio/dashboard/messages",
  noIndex: true,
});

export default function Page() {
  return <DashboardApp section="messages" />;
}
