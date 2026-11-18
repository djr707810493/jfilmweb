"use client";

import Link from "next/link";
import { heroContent } from "@/data/homepage";
import type { HeroButton } from "@/types/website";

export function HeroSection() {
  const { label, headline, serviceLine, subheadline: body, cta: buttons } = heroContent;
  const { image } = heroContent;

  return (
    <section
      className="relative overflow-hidden min-h-[85svh] md:min-h-[88vh] lg:min-h-[90vh]"
      aria-label="Hero"
    >
      {/* Background image — single responsive asset, fetched with high priority */}
      <div className="absolute inset-0 size-full z-0">
        <picture className="block size-full">
          <source
            media="(max-width: 640px)"
            srcSet={image.mobile}
            type="image/webp"
          />
          <source
            media="(max-width: 1024px)"
            srcSet={image.tablet}
            type="image/webp"
          />
          <source srcSet={image.desktop} type="image/webp" />
          <img
            src={image.fallback}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="size-full object-cover object-[50%_45%] md:object-center"
          />
        </picture>

        {/* Legibility scrims — copy sits in a darkened left column, subject stays clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-soft-black/85 via-soft-black/0 via-40% to-transparent lg:from-soft-black/90 lg:via-soft-black/40 lg:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-soft-black/70 via-soft-black/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-soft-black/25 to-transparent" />
      </div>

      {/* Editorial copy */}
      <div className="absolute inset-0 z-10 flex flex-col items-start justify-end pt-16 pb-24 px-6 md:pt-24 md:pb-28 md:px-0">
        <div className="container-editorial">
          <div className="max-w-[44rem]">
          <div className="flex flex-col items-start gap-1.5 md:gap-2.5">
            <p className="label-editorial text-ivory/80">{label}</p>
            <span className="h-[1px] w-16 bg-ivory/40" />
          </div>

          <h1
            className="font-display text-[clamp(3rem,8.5vw,6.5rem)] leading-[1.04] tracking-[-0.03em] text-ivory"
          >
            <span className="block">{headline}</span>
            <span className="mt-4 flex items-center gap-3 text-[clamp(0.6875rem,1.5vw,0.875rem)] font-normal italic leading-snug tracking-[0.16em] text-ivory/75 uppercase md:mt-6">
              <span className="h-[1px] w-8 shrink-0 bg-ivory/40" aria-hidden="true" />
              {serviceLine}
            </span>
          </h1>

          {body ? (
            <p className="mt-7 max-w-[38rem] text-[0.9375rem] leading-relaxed text-ivory/90 md:mt-9 md:text-base">
              {body}
            </p>
          ) : null}

          {buttons.length > 0 ? (
            <div className="mt-11 flex flex-col gap-3.5 sm:mt-13 sm:flex-row sm:items-start sm:gap-4">
              {buttons.map((button) => (
                <HeroCta key={button.id} button={button} />
              ))}
            </div>
          ) : null}
          </div>
        </div>
      </div>

      {/* Vertical editorial sideline (desktop only) */}
      <div className="hidden md:block absolute top-1/2 right-4 -translate-y-1/2 lg:right-6">
        <p className="label-editorial text-ivory/45 tracking-[0.55em] [writing-mode:vertical-rl]">
          J FILM STUDIO &middot; UTAH
        </p>
      </div>

      {/* Scroll cue */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-10 flex flex-col items-center gap-2 opacity-60 md:bottom-12">
        <span className="label-editorial text-ivory/50 tracking-[0.35em] uppercase">
          Scroll
        </span>
        <svg
          viewBox="0 0 24 24"
          className="size-5 stroke-ivory/60"
          fill="none"
          strokeWidth="1.5"
        >
          <path d="M12 19V5M8 9l4 4m0 0 4-4m-4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}

function HeroCta({ button }: { button: HeroButton }) {
  const className =
    button.style === "primary"
      ? "inline-flex min-h-[3rem] items-center justify-center bg-ivory px-8 py-3.5 text-[0.6875rem] font-medium tracking-[0.2em] text-soft-black uppercase transition-opacity duration-300 hover:opacity-90"
      : "inline-flex min-h-[3rem] items-center justify-center border border-ivory/60 px-8 py-3.5 text-[0.6875rem] font-medium tracking-[0.2em] text-ivory uppercase backdrop-blur-[2px] transition-colors duration-300 hover:border-ivory hover:bg-ivory/10";

  const isExternal = /^https?:\/\//i.test(button.href);

  if (isExternal) {
    return (
      <a
        href={button.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {button.label}
      </a>
    );
  }

  return (
    <Link href={button.href} className={className}>
      {button.label}
    </Link>
  );
}
