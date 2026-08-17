import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Gallery",
  description: "Manage portfolio projects, photos, and film.",
  path: "/studio/dashboard/gallery",
  noIndex: true,
});

export default function Page() {
  return <DashboardApp section="gallery" />;
}
