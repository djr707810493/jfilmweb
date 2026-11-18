"use client";

import { useWeddingStories } from "@/hooks/use-wedding-stories";
import type { WeddingStory } from "@/types/wedding-story";

function isPublished(story: WeddingStory) {
  return (story as { published?: boolean }).published === true;
}

function sortOrderOf(story: WeddingStory) {
  return (story as { sortOrder?: number }).sortOrder ?? 0;
}

export default function DebugStoriesPage() {
  const { stories, loading, reload } = useWeddingStories();

  return (
    <div className="bg-white p-3 font-mono text-black">
      <div className="mb-4 flex items-center gap-3">
        <p className="text-sm font-bold">
          {loading ? "LOADING…" : `${stories.length} STORIES`}
        </p>
        <button
          type="button"
          onClick={reload}
          className="border border-black px-2 py-1 text-[11px]"
        >
          Reload
        </button>
      </div>

      {loading ? (
        <p className="text-sm">Loading…</p>
      ) : (
        <div className="space-y-6">
          {stories.map((story, index) => (
            <section
              key={story.slug}
              id={`s${index}`}
              className="border-2 border-black p-2 scroll-mt-2"
            >
              <p className="text-[11px] font-bold">
                #{index} · {story.slug}
              </p>
              <p className="text-[10px]">
                pub={isPublished(story) ? "YES" : "NO"} · sort=
                {sortOrderOf(story)}
              </p>
              <p className="mt-1 text-[10px] font-bold">COUPLE</p>
              <p className="text-[11px]">{story.couple}</p>
              <p className="mt-1 text-[10px] font-bold">TITLE</p>
              <p className="text-[11px]">{story.title}</p>
              <p className="mt-1 text-[10px] font-bold">LOCATION</p>
              <p className="text-[11px]">{story.location}</p>
              <p className="mt-1 text-[10px] font-bold">DATE</p>
              <p className="text-[11px]">{story.date}</p>
              <p className="mt-1 text-[10px] font-bold">EXCERPT</p>
              <p className="text-[10px] leading-snug">{story.excerpt}</p>

              <p className="mt-2 text-[10px] font-bold">COVER · {story.cover.alt}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.cover.src}
                alt=""
                className="h-32 w-32 border border-gray-400 object-cover"
              />

              <p className="mt-2 text-[10px] font-bold">
                GALLERY · {story.gallery.length}
              </p>
              <div className="flex flex-wrap gap-1">
                {story.gallery.map((image, i) => (
                  <div key={`${image.src}-${i}`} className="w-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.src}
                      alt=""
                      className="h-20 w-20 border border-gray-400 object-cover"
                    />
                    <span className="block text-[8px] leading-tight">
                      {image.alt}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-[10px] font-bold">
                STORY · {story.story.length} paragraphs
              </p>
              {story.story.map((paragraph, i) => (
                <p key={i} className="mb-1 text-[9px] leading-snug">
                  [{i}] {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
