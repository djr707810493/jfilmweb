"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { heroContent } from "@/data/homepage";
import {
  createDefaultHeroSlide,
  getHeroSettings,
  HERO_INTERVAL_MS,
} from "@/lib/firebase/website";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { HeroButton, HeroSlide } from "@/types/website";

function HeroSlideImage({
  slide,
  priority,
  isDefault,
}: {
  slide: HeroSlide;
  priority?: boolean;
  isDefault?: boolean;
}) {
  const { image } = heroContent;

  if (isDefault) {
    return (
      <picture className="block size-full">
        <source
          srcSet={image.mobile}
          media="(max-width: 640px)"
          type="image/webp"
        />
        <source
          srcSet={image.tablet}
          media="(max-width: 1200px)"
          type="image/webp"
        />
        <source srcSet={image.desktop} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.fallback}
          alt={slide.alt}
          loading="eager"
          fetchPriority={priority ? "high" : "low"}
          decoding="async"
          className="size-full object-cover object-[72%_35%] sm:object-[78%_center] md:object-right md:object-center"
        />
      </picture>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={slide.src}
      alt={slide.alt}
      loading="eager"
      fetchPriority={priority ? "high" : "low"}
      decoding="async"
      className="size-full object-cover object-center"
    />
  );
}

export function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>([createDefaultHeroSlide()]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    let cancelled = false;

    getHeroSettings()
      .then((settings) => {
        if (cancelled) return;
        if (settings.slides.length > 0) {
          setSlides(settings.slides);
          setActiveIndex(0);
        }
      })
      .catch(() => {
        // Keep the built-in hero if remote settings fail to load
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, HERO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [activeIndex, paused, slides.length]);

  useEffect(() => {
    function onVisibility() {
      setPaused(document.hidden);
    }

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const showControls = slides.length > 1;

  function goTo(index: number) {
    setActiveIndex((index + slides.length) % slides.length);
  }

  return (
    <section
      className="relative min-h-[80svh] md:min-h-[92vh] lg:min-h-[95vh]"
      aria-roledescription={showControls ? "carousel" : undefined}
      aria-label="Homepage hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          const isDefault =
            slide.id === "default" &&
            slide.src === heroContent.image.fallback;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              <HeroSlideImage
                slide={slide}
                priority={index === 0}
                isDefault={isDefault}
              />
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-soft-black/80 from-0% via-soft-black/45 via-50% to-soft-black/10 to-100%" />
      <div className="absolute inset-0 bg-gradient-to-t from-soft-black/30 via-transparent to-soft-black/10 md:from-soft-black/20" />

      <div className="absolute inset-0 z-10 flex items-end md:items-center">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          const TitleTag = isActive ? "h1" : "p";

          return (
            <div
              key={slide.id}
              className={`container-editorial absolute inset-x-0 top-0 bottom-0 flex items-end pt-24 md:items-center md:pt-0 ${
                showControls ? "pb-24" : "pb-14"
              } transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              <div className="max-w-xl lg:max-w-2xl">
                {slide.copy.label ? (
                  <p className="label-editorial mb-5 text-ivory/75 md:mb-6">
                    {slide.copy.label}
                  </p>
                ) : null}

                <TitleTag className="font-display text-[clamp(2.125rem,6.5vw,4.25rem)] leading-[1.08] tracking-[-0.02em] text-ivory">
                  {slide.copy.headline}
                </TitleTag>

                {slide.copy.body ? (
                  <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ivory/88 md:mt-7 md:max-w-lg md:text-lg md:leading-relaxed">
                    {slide.copy.body}
                  </p>
                ) : null}

                {slide.copy.buttons.length > 0 ? (
                  <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
                    {slide.copy.buttons.map((button) => (
                      <HeroCta key={button.id} button={button} />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {showControls && (
        <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2 md:bottom-8 md:gap-3">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous image"
            className="tap-target text-ivory/70 transition-colors hover:text-ivory"
          >
            <ChevronLeft />
          </button>

          <div className="flex items-center gap-1.5 md:gap-2" role="tablist" aria-label="Hero images">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-label={`Show image ${index + 1} of ${slides.length}`}
                  aria-selected={isActive}
                  onClick={() => goTo(index)}
                  className="tap-target"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-7 bg-ivory md:w-8"
                        : "w-1.5 bg-ivory/40 hover:bg-ivory/70"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next image"
            className="tap-target text-ivory/70 transition-colors hover:text-ivory"
          >
            <ChevronRight />
          </button>
        </div>
      )}
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

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="size-5 stroke-current md:size-6"
      fill="none"
      strokeWidth="1.5"
    >
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="size-5 stroke-current md:size-6"
      fill="none"
      strokeWidth="1.5"
    >
      <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
