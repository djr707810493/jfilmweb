import { siteConfig } from "@/data/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Photography Services | Utah Destination Wedding Photographer",
  description: "Explore our photography services including full-day editorial wedding coverage, film and digital packages, and destination elopements in Utah.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-medium">Photography Services in Utah</h1>
      <p className="mt-2 max-w-xl text-neutral-600">
        Detailed service pages and pricing can be added here later.
      </p>
      <ul className="mt-10 grid gap-8 md:grid-cols-3">
        {siteConfig.services.map((service) => (
          <li key={service.title} className="rounded-lg border border-neutral-200 p-6">
            <h2 className="font-medium">{service.title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{service.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
