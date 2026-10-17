import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Quote Rates",
  description: "Manage instant quote rates, add-ons, and pricing rules.",
  path: "/studio/dashboard/quote",
  noIndex: true,
});

export default function Page() {
  return <DashboardApp section="quote" />;
}
