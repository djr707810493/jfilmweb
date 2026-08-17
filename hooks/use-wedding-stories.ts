"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getPublishedWeddingStories,
  getWeddingStoryFromFirestore,
} from "@/lib/firebase/story";
import {
  weddingStories as staticStories,
  getWeddingStoryBySlug,
} from "@/data/wedding-stories";
import type { WeddingStory } from "@/types/wedding-story";

export function useWeddingStories() {
  const [stories, setStories] = useState<WeddingStory[]>(staticStories);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"static" | "firestore">("static");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await getPublishedWeddingStories();
      if (results.length > 0) {
        setStories(results);
        setSource("firestore");
      } else {
        setStories(staticStories);
        setSource("static");
      }
    } catch {
      setStories(staticStories);
      setSource("static");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stories, loading, source, reload: load };
}

export function useWeddingStory(slug: string | null) {
  const [story, setStory] = useState<WeddingStory | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));

  useEffect(() => {
    if (!slug) {
      setStory(null);
      setLoading(false);
      return;
    }

    const activeSlug = slug;
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const remote = await getWeddingStoryFromFirestore(activeSlug);
        if (cancelled) return;
        if (remote) {
          setStory(remote);
          return;
        }
      } catch {
        // fall through to static
      }

      if (cancelled) return;
      setStory(getWeddingStoryBySlug(activeSlug) ?? null);
    }

    load().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { story, loading };
}
