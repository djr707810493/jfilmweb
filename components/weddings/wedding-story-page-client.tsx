"use client";

import Link from "next/link";
import { WeddingStoryShowcase } from "@/components/weddings/wedding-story-showcase";
import { useWeddingStory } from "@/hooks/use-wedding-stories";

export function WeddingStoryPageClient({ slug }: { slug: string }) {
  const { story, loading } = useWeddingStory(slug);

  if (loading) {
    return (
      <div className="container-editorial section-y text-center text-sm text-soft-black-muted">
        Loading story…
      </div>
    );
  }

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

      <div className="section-y-compact md:section-y">
        <WeddingStoryShowcase story={story} index={0} headingLevel="h1" />
      </div>
    </>
  );
}
