import { ContactForm } from "@/components/contact-form";
import { siteConfig } from "@/data/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact | Utah Destination Wedding Photographer",
  description:
    "Get in touch with J FILM STUDIO to discuss your Utah wedding, elopement, or destination photography. We serve Park City, Salt Lake City, Moab, Zion, and beyond.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-editorial section-y">
      <div className="max-w-2xl">
        <p className="label-editorial">Inquire</p>
        <h1 className="font-display mt-4 text-4xl text-soft-black lg:text-5xl">
          Contact Your Utah Wedding Photographer
        </h1>
        <p className="mt-6 text-soft-black-muted">
          Share your date, location, and vision. We accept a limited number of
          weddings each year.
        </p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-soft-black-muted">
          <div>
            <dt className="label-editorial mb-1">Email</dt>
            <dd>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-soft-black hover:underline"
              >
                {siteConfig.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="label-editorial mb-1">Phone</dt>
            <dd>{siteConfig.phone}</dd>
          </div>
        </dl>
      </div>

      <ContactForm />
    </div>
  );
}
