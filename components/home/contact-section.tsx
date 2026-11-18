import { ContactForm } from "@/components/contact-form";
import { ctaContent } from "@/data/homepage";
import { siteConfig } from "@/data/site";

export function ContactSection() {
  return (
    <section id="contact" className="section-y-compact border-b border-taupe/40 bg-ivory-dark">
      <div className="container-editorial">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="label-editorial">{ctaContent.label}</p>
            <h2 className="font-display mt-2 text-[clamp(1.375rem,4.5vw,3rem)] leading-snug text-soft-black md:mt-6">
              {ctaContent.heading}
            </h2>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-6 md:text-base">
              {ctaContent.body}
            </p>
            <p className="mt-4 flex items-start gap-2.5 border-l-2 border-soft-black/30 pl-3.5 text-[0.8125rem] leading-relaxed text-soft-black md:mt-6 md:text-sm">
              <span aria-hidden="true" className="mt-[0.15rem] text-soft-black">↳</span>
              {ctaContent.responsePromise}
            </p>
            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-soft-black-muted md:mt-10 md:gap-x-8 md:gap-y-4">
              <div>
                <dt className="label-editorial mb-1">Email</dt>
                <dd>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="break-all text-soft-black hover:underline"
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

          <div className="lg:col-span-7">
            <ContactForm embedded />
          </div>
        </div>
      </div>
    </section>
  );
}
