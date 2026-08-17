import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Stories CMS",
  description: "Manage wedding story posts.",
  path: "/studio/dashboard/stories",
  noIndex: true,
});

export default function AdminStoriesPage() {
  return <DashboardApp section="stories" />;
}
