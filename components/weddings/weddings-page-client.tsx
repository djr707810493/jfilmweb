"use client";

import { useCallback, useMemo, useState } from "react";
import { WeddingStoryShowcase } from "@/components/weddings/wedding-story-showcase";
import { StoryTabs } from "@/components/weddings/story-tabs";
import { useWeddingStories } from "@/hooks/use-wedding-stories";

function StoryLoading() {
  return (
    <div className="container-editorial pt-20 pb-24 md:pt-28 md:pb-32 flex flex-col items-center justify-center gap-3">
      <svg
        className="animate-spin h-10 w-10 text-taupe"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-sm text-soft-black-muted">Loading wedding stories…</p>
    </div>
  );
}

export function WeddingsPageClient() {
  const { stories, loading, reload } = useWeddingStories();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const slugs = useMemo(() => stories.map((story) => story.slug), [stories]);

  // Deep links: /weddings#moab-desert-elopement opens that story directly.
  const hashSlug = useMemo(
    () => (typeof window === "undefined" ? "" : window.location.hash.replace(/^#/, "")),
    [],
  );

  const selectedSlugMemo = useMemo(() => {
    if (selectedSlug && slugs.includes(selectedSlug)) return selectedSlug;
    if (hashSlug && slugs.includes(hashSlug)) return hashSlug;
    return slugs[0] ?? null;
  }, [selectedSlug, hashSlug, slugs]);

  const activeIndex = Math.max(
    0,
    stories.findIndex((story) => story.slug === selectedSlugMemo),
  );
  const activeStory = stories[activeIndex] ?? null;

  const move = useCallback(
    (delta: number) => {
      if (!slugs.length) return;
      const next = (activeIndex + delta + slugs.length) % slugs.length;
      const slug = slugs[next];
      setSelectedSlug(slug);
      window.history.replaceState(null, "", `#${slug}`);
    },
    [activeIndex, slugs],
  );

  if (loading) return <StoryLoading />;

  if (stories.length === 0) {
    return (
      <>
        <div className="container-editorial border-b border-taupe/40 pt-12 pb-10 md:pt-20 md:pb-14 lg:pt-24">
          <p className="label-editorial">Stories</p>
          <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3.75rem)] leading-snug text-soft-black md:mt-4">
            Utah Wedding Stories
          </h1>
        </div>
        <div className="container-editorial pt-16 pb-24 text-center">
          <p className="text-soft-black-muted">No published wedding stories yet.</p>
          <button
            type="button"
            onClick={reload}
            className="label-editorial link-underline mt-6 inline-flex text-soft-black"
          >
            Retry
          </button>
        </div>
      </>
    );
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
          <StoryTabs
            stories={stories}
            activeSlug={selectedSlugMemo}
            mode="switch"
            onSelect={(slug) => setSelectedSlug(slug)}
            onMove={move}
          />
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
                  className="label-editorial tap-link text-soft-black-muted hover:text-soft-black"
                >
                  ← {stories[(activeIndex - 1 + stories.length) % stories.length].couple}
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  className="label-editorial tap-link text-right text-soft-black-muted hover:text-soft-black"
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
