"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getPortfolioProjectFromFirestore,
  getPublishedPortfolioProjects,
} from "@/lib/firebase/portfolio";
import {
  getPortfolioProjectBySlug,
  portfolioProjects as staticPortfolioProjects,
} from "@/data/portfolio";
import type { PortfolioProject } from "@/types/portfolio";

export function usePortfolioProjects() {
  const [projects, setProjects] = useState<PortfolioProject[]>(
    staticPortfolioProjects,
  );
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"static" | "firestore">("static");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await getPublishedPortfolioProjects();
      if (results.length > 0) {
        setProjects(results);
        setSource("firestore");
      } else {
        setProjects(staticPortfolioProjects);
        setSource("static");
      }
    } catch {
      setProjects(staticPortfolioProjects);
      setSource("static");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, loading, source, reload: load };
}

export function usePortfolioProject(slug: string | null) {
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));

  useEffect(() => {
    if (!slug) {
      setProject(null);
      setLoading(false);
      return;
    }

    const activeSlug = slug;
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const remote = await getPortfolioProjectFromFirestore(activeSlug);
        if (cancelled) return;
        if (remote) {
          setProject(remote);
          return;
        }
      } catch {
        // fall through to static
      }

      if (cancelled) return;
      setProject(getPortfolioProjectBySlug(activeSlug) ?? null);
    }

    load().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { project, loading };
}
