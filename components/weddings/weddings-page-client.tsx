"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { WeddingStoryShowcase } from "@/components/weddings/wedding-story-showcase";
import { useWeddingStories } from "@/hooks/use-wedding-stories";

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function readHash() {
  return window.location.hash.replace(/^#/, "");
}

export function WeddingsPageClient() {
  const { stories, loading } = useWeddingStories();
  const [pickedSlug, setPickedSlug] = useState<string | null>(null);

  // Deep links: /weddings#moab-desert-elopement opens that story directly.
  const hashSlug = useSyncExternalStore(subscribeToHash, readHash, () => "");

  const slugs = useMemo(() => stories.map((story) => story.slug), [stories]);

  const selectedSlug = useMemo(() => {
    if (pickedSlug && slugs.includes(pickedSlug)) return pickedSlug;
    if (hashSlug && slugs.includes(hashSlug)) return hashSlug;
    return slugs[0] ?? null;
  }, [pickedSlug, hashSlug, slugs]);

  const activeIndex = Math.max(
    0,
    stories.findIndex((story) => story.slug === selectedSlug),
  );
  const activeStory = stories[activeIndex] ?? null;

  const select = useCallback((slug: string) => {
    setPickedSlug(slug);
    window.history.replaceState(null, "", `#${slug}`);
  }, []);

  const move = useCallback(
    (delta: number) => {
      if (!slugs.length) return;
      const next = (activeIndex + delta + slugs.length) % slugs.length;
      select(slugs[next]);
    },
    [activeIndex, select, slugs],
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
  }

  return (
    <>
      <div className="container-editorial border-b border-taupe/40 pt-12 pb-10 md:pt-20 md:pb-14 lg:pt-24">
        <p className="label-editorial">Stories</p>
        <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3.75rem)] leading-snug text-soft-black md:mt-4">
          Utah Wedding Stories
        </h1>
        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-soft-black-muted md:mt-6 md:text-base">
          Each celebration, told as its own chapter — honest moments, refined
          composition, and true-to-color delivery. Choose a story above to read it.
        </p>
      </div>

      <div className="border-b border-taupe/40">
        <div className="container-editorial">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="min-w-0 flex-1 overflow-x-auto no-scrollbar">
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
                    const active = story.slug === selectedSlug;
                    return (
                      <li key={story.slug} className="shrink-0 lg:min-w-0 lg:flex-1">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={active}
                          aria-controls="story-panel"
                          onClick={() => select(story.slug)}
                          className={`group flex h-full w-[14.5rem] flex-col gap-1 border-b-2 px-4 py-5 text-left transition-colors md:w-[16.5rem] md:px-5 md:py-6 lg:w-full lg:px-6 lg:py-7 ${
                            active
                              ? "border-soft-black bg-ivory"
                              : "border-transparent hover:border-taupe/60 hover:bg-ivory/50"
                          }`}
                        >
                          <span className="label-editorial text-taupe">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`font-display mt-1 text-lg leading-snug md:text-xl ${
                              active
                                ? "text-soft-black"
                                : "text-soft-black-muted group-hover:text-soft-black"
                            }`}
                          >
                            {story.couple}
                          </span>
                          <span
                            className={`font-display text-sm italic leading-snug ${active ? "text-soft-black" : "text-muted"}`}
                          >
                            {story.title}
                          </span>
                          <span className="mt-1.5 text-[0.6875rem] tracking-[0.14em] text-taupe uppercase">
                            {story.location}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {stories.length > 1 ? (
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Previous story"
                  className="flex size-10 items-center justify-center rounded-full border border-taupe/50 text-lg text-soft-black transition-all hover:-translate-x-0.5 hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-black"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Next story"
                  className="flex size-10 items-center justify-center rounded-full border border-taupe/50 text-lg text-soft-black transition-all hover:translate-x-0.5 hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-black"
                >
                  →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        id="story-panel"
        role="tabpanel"
        aria-live="polite"
        className="pb-16 md:pb-24"
      >
        {activeStory ? (
          <div key={activeStory.slug} className="story-fade-in">
            <WeddingStoryShowcase story={activeStory} index={0} />

            {stories.length > 1 ? (
              <div className="container-editorial mt-14 flex items-center justify-between gap-6 border-t border-taupe/40 pt-6 md:mt-20 md:pt-8">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  className="label-editorial tap-link min-h-11 text-soft-black-muted hover:text-soft-black"
                >
                  ← {stories[(activeIndex - 1 + stories.length) % stories.length].couple}
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  className="label-editorial tap-link min-h-11 text-right text-soft-black-muted hover:text-soft-black"
                >
                  {stories[(activeIndex + 1) % stories.length].couple} →
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
