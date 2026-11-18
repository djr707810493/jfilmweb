"use client";

import Link from "next/link";
import { WeddingStoryShowcase } from "@/components/weddings/wedding-story-showcase";
import { StoryTabs } from "@/components/weddings/story-tabs";
import { useWeddingStory, useWeddingStories } from "@/hooks/use-wedding-stories";

function StoryLoading() {
  return (
    <div className="container-editorial section-y flex flex-col items-center justify-center gap-3">
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
      <p className="text-sm text-soft-black-muted">Loading story…</p>
    </div>
  );
}

export function WeddingStoryPageClient({ slug }: { slug: string }) {
  const { story, loading } = useWeddingStory(slug);
  const { stories: allStories } = useWeddingStories();

  if (loading && !story) return <StoryLoading />;

  if (!story) {
    return (
      <div className="container-editorial section-y text-center">
        <p className="text-soft-black-muted">This story could not be found.</p>
        <Link
          href="/weddings"
          className="label-editorial link-underline mt-4 inline-flex text-soft-black"
        >
          Back to all stories
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="container-editorial border-b border-taupe/40 pt-10 pb-6 md:pt-16 md:pb-8">
        <Link
          href="/weddings"
          className="label-editorial link-underline text-soft-black-muted transition-colors hover:text-soft-black"
        >
          All Wedding Stories
        </Link>
      </div>

      {allStories.length > 0 ? (
        <div className="border-b border-taupe/40">
          <div className="container-editorial">
            <StoryTabs stories={allStories} activeSlug={slug} mode="link" />
          </div>
        </div>
      ) : null}

      <div className="section-y-compact md:section-y">
        <WeddingStoryShowcase story={story} index={0} headingLevel="h1" />
      </div>
    </>
  );
}
