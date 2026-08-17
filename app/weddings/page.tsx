import { WeddingsPageClient } from "@/components/weddings/weddings-page-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Wedding Stories | Salt Lake City & Park City Wedding Photographer",
  description:
    "Editorial wedding stories from Park City, Salt Lake City, and celebrations across Utah. View our full galleries of documentary wedding photography.",
  path: "/weddings",
  ogImage: "/og-weddings.jpg",
});

export default function WeddingsPage() {
  return <WeddingsPageClient />;
}
