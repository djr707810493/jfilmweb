"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getPublishedWeddingStories,
  getWeddingStoryFromFirestore,
} from "@/lib/firebase/story";
import type { WeddingStory } from "@/types/wedding-story";

type StoriesState = {
  stories: WeddingStory[];
  loading: boolean;
};

export function useWeddingStories() {
  const [state, setState] = useState<StoriesState>({ stories: [], loading: true });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getPublishedWeddingStories()
      .then((results) => {
        if (!cancelled) setState({ stories: results, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ stories: [], loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const reload = useCallback(() => {
    setState((current) => ({ ...current, loading: true }));
    setReloadCount((count) => count + 1);
  }, []);

  return { ...state, reload };
}

type StoryState = {
  story: WeddingStory | null;
  loading: boolean;
};

export function useWeddingStory(slug: string | null) {
  const [state, setState] = useState<StoryState>({
    story: null,
    loading: Boolean(slug),
  });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    getWeddingStoryFromFirestore(slug)
      .then((remote) => {
        if (!cancelled) setState({ story: remote ?? null, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ story: null, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
