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
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getPublishedWeddingStories()
      .then((results) => {
        if (cancelled) return;
        if (results.length > 0) {
          setStories(results);
          setSource("firestore");
        } else {
          setStories(staticStories);
          setSource("static");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStories(staticStories);
          setSource("static");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const reload = useCallback(() => {
    setLoading(true);
    setReloadCount((count) => count + 1);
  }, []);

  return { stories, loading, source, reload };
}

export function useWeddingStory(slug: string | null) {
  const staticStory = slug ? (getWeddingStoryBySlug(slug) ?? null) : null;
  const [remoteStory, setRemoteStory] = useState<WeddingStory | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    getWeddingStoryFromFirestore(slug)
      .then((remote) => {
        if (!cancelled && remote) setRemoteStory(remote);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const story = remoteStory ?? staticStory;

  return { story, loading: !story && !resolved };
}
