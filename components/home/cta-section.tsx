import { SiteImage } from "@/components/site-image";
import Link from "next/link";
import { ctaContent } from "@/data/homepage";

export function CtaSection() {
  return (
    <section className="relative">
      {/* Mobile: stacked layout for readability */}
      <div className="md:hidden">
        <div className="relative aspect-[4/3] w-full">
          <SiteImage
            src={ctaContent.image.src}
            alt={ctaContent.image.alt}
            fill
            sizes="100vw"
            className="object-cover object-center grayscale"
          />
        </div>
        <div className="bg-soft-black px-5 py-12">
          <p className="label-editorial text-ivory/70">{ctaContent.label}</p>
          <h2 className="font-display mt-4 text-[clamp(1.75rem,5vw,2.5rem)] leading-snug text-ivory">
            {ctaContent.heading}
          </h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ivory/85">
            {ctaContent.body}
          </p>
          <Link
            href="/contact"
            className="label-editorial mt-8 flex min-h-[3rem] w-full items-center justify-center border border-ivory/60 px-8 py-3.5 text-ivory transition-colors duration-300 active:bg-ivory active:text-soft-black"
          >
            Send an Inquiry
          </Link>
        </div>
      </div>

      {/* Desktop: overlay layout */}
      <div className="relative hidden md:block md:aspect-[21/9]">
        <SiteImage
          src={ctaContent.image.src}
          alt={ctaContent.image.alt}
          fill
          sizes="100vw"
          className="object-cover object-center grayscale"
        />
        <div className="absolute inset-0 bg-soft-black/55" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-editorial text-center">
            <p className="label-editorial text-ivory/70">{ctaContent.label}</p>
            <h2 className="font-display mx-auto mt-6 max-w-3xl text-4xl leading-snug text-ivory lg:text-5xl">
              {ctaContent.heading}
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ivory/80">
              {ctaContent.body}
            </p>
            <Link
              href="/contact"
              className="label-editorial mt-10 inline-flex min-h-[3rem] items-center border border-ivory/60 px-10 py-4 text-ivory transition-colors duration-300 hover:bg-ivory hover:text-soft-black"
            >
              Send an Inquiry
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
