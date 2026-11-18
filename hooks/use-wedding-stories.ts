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

/**
 * Static stories render server-side so crawlers always see real content.
 * Firestore replaces them once loaded; if the fetch fails the static copy stays.
 */
type StoriesState = {
  stories: WeddingStory[];
  loading: boolean;
};

export function useWeddingStories() {
  const [state, setState] = useState<StoriesState>({
    stories: staticStories,
    loading: true,
  });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getPublishedWeddingStories()
      .then((results) => {
        if (cancelled) return;
        setState({
          stories: results.length > 0 ? results : staticStories,
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ stories: staticStories, loading: false });
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
    story: slug ? (getWeddingStoryBySlug(slug) ?? null) : null,
    loading: Boolean(slug),
  });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    getWeddingStoryFromFirestore(slug)
      .then((remote) => {
        if (cancelled) return;
        setState({
          story: remote ?? getWeddingStoryBySlug(slug) ?? null,
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            story: getWeddingStoryBySlug(slug) ?? null,
            loading: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
