import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Users",
  description: "Client accounts and profile details.",
  path: "/studio/dashboard/users",
  noIndex: true,
});

export default function Page() {
  return <DashboardApp section="users" />;
}
