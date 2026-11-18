"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SiteImage } from "@/components/site-image";
import type { WeddingStory } from "@/types/wedding-story";

type StoryTabsProps = {
  stories: WeddingStory[];
  activeSlug: string | null;
  /** "switch" swaps the story on the current page, "link" navigates to /weddings/[slug]. */
  mode?: "switch" | "link";
  loading?: boolean;
  onSelect?: (slug: string) => void;
  onMove?: (delta: number) => void;
};

export function StoryTabs({
  stories,
  activeSlug,
  mode = "switch",
  loading = false,
  onSelect,
  onMove,
}: StoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const activeIndex = Math.max(
    0,
    stories.findIndex((story) => story.slug === activeSlug),
  );

  function updateScrollHint() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
  }

  function scrollTabIntoView(slug: string) {
    document
      .getElementById(`story-tab-${slug}`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }

  function handleSelect(slug: string) {
    onSelect?.(slug);
    scrollTabIntoView(slug);
  }

  function handleMove(delta: number) {
    onMove?.(delta);
    if (!stories.length) return;
    const target = stories[(activeIndex + delta + stories.length) % stories.length];
    scrollTabIntoView(target.slug);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (mode !== "switch") return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleMove(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      handleMove(-1);
    }
  }

  const showControls = stories.length > 1;

  return (
    <div className="flex items-center gap-4 md:gap-6">
      <div className="relative min-w-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={updateScrollHint}
          className="overflow-x-auto no-scrollbar"
        >
          {stories.length === 0 ? (
            <p className="py-6 text-sm text-soft-black-muted">
              {loading ? "Loading stories…" : "No stories yet."}
            </p>
          ) : (
            <ul
              role="tablist"
              aria-label="Wedding stories"
              className="flex items-stretch"
              onKeyDown={handleKeyDown}
            >
              {stories.map((story, index) => {
                const active = story.slug === activeSlug;
                const inner = (
                  <>
                    <span className="relative size-12 shrink-0 overflow-hidden border border-taupe/40 bg-ivory-dark md:size-14">
                      <SiteImage
                        src={story.cover.src}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex items-center gap-2">
                        <span className="label-editorial text-taupe">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="truncate text-[0.625rem] tracking-[0.14em] text-taupe uppercase">
                          {story.location}
                        </span>
                      </span>
                      <span
                        className={`font-display mt-0.5 truncate text-base leading-snug md:text-lg ${
                          active
                            ? "text-soft-black"
                            : "text-soft-black-muted group-hover:text-soft-black"
                        }`}
                      >
                        {story.couple}
                      </span>
                      <span
                        className={`font-display truncate text-xs italic leading-snug md:text-sm ${
                          active ? "text-soft-black" : "text-muted"
                        }`}
                      >
                        {story.title}
                      </span>
                    </span>
                  </>
                );

                const sharedClass = `group flex h-full w-[15.5rem] items-center gap-3 border-b-2 px-3 py-4 text-left transition-colors md:w-[18rem] md:px-4 md:py-5 lg:w-full lg:gap-4 lg:px-5 lg:py-6 ${
                  active
                    ? "border-soft-black bg-ivory"
                    : "border-transparent hover:border-taupe/60 hover:bg-ivory/50"
                }`;

                return (
                  <li key={story.slug} className="shrink-0 lg:min-w-0 lg:flex-1">
                    {mode === "link" ? (
                      <Link
                        id={`story-tab-${story.slug}`}
                        href={`/weddings/${story.slug}`}
                        aria-current={active ? "page" : undefined}
                        className={sharedClass}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        id={`story-tab-${story.slug}`}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-controls="story-panel"
                        onClick={() => handleSelect(story.slug)}
                        className={sharedClass}
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Scroll affordances on small screens — the strip scrolls until lg */}
        {canScrollLeft ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-ivory to-transparent lg:hidden"
          />
        ) : null}
        {stories.length > 0 ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-ivory to-transparent lg:hidden"
          />
        ) : null}
      </div>

      {showControls ? (
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => handleMove(-1)}
            aria-label="Previous story"
            className="flex size-10 items-center justify-center rounded-full border border-taupe/50 text-lg text-soft-black transition-all hover:-translate-x-0.5 hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-black"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => handleMove(1)}
            aria-label="Next story"
            className="flex size-10 items-center justify-center rounded-full border border-taupe/50 text-lg text-soft-black transition-all hover:translate-x-0.5 hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-black"
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  );
}
