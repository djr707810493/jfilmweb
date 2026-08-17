"use client";

import { WeddingStoryShowcase } from "@/components/weddings/wedding-story-showcase";
import { useWeddingStories } from "@/hooks/use-wedding-stories";

export function WeddingsPageClient() {
  const { stories, loading } = useWeddingStories();

  return (
    <>
      <div className="container-editorial border-b border-taupe/40 pt-12 pb-10 md:pt-20 md:pb-14 lg:pt-24">
        <p className="label-editorial">Weddings</p>
        <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3.75rem)] leading-snug text-soft-black md:mt-4">
          Utah Wedding Stories
        </h1>
        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-soft-black-muted md:mt-6 md:text-base">
          Each celebration, told as its own chapter — honest moments, refined
          composition, and true-to-color delivery.
        </p>
      </div>

      <div className="section-y-compact md:section-y">
        {loading ? (
          <p className="text-center text-sm text-soft-black-muted">
            Loading stories…
          </p>
        ) : (
          <div className="space-y-12 md:space-y-0">
            {stories.map((story, index) => (
              <WeddingStoryShowcase key={story.slug} story={story} index={index} />
            ))}
          </div>
        )}
        
        {!loading && stories.length === 0 && (
          <p className="text-center text-sm text-soft-black-muted">
            No wedding stories available yet.
          </p>
        )}
      </div>
    </>
  );
}
