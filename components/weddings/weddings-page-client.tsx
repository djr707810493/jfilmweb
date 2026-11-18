"use client";

import { useCallback, useMemo, useState } from "react";
import { WeddingStoryShowcase } from "@/components/weddings/wedding-story-showcase";
import { StoryTabs } from "@/components/weddings/story-tabs";
import { useWeddingStories } from "@/hooks/use-wedding-stories";

export function WeddingsPageClient() {
  const { stories, loading } = useWeddingStories();
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
            loading={loading}
            onSelect={(slug) => setSelectedSlug(slug)}
            onMove={move}
          />
        </div>
      </div>

      <div id="story-panel" role="tabpanel" aria-live="polite" className="pb-16 md:pb-24">
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
