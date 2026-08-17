"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminStoryEditor } from "@/components/dashboard/admin-story-editor";
import {
  DashboardPageHeader,
  DashboardStat,
} from "@/components/dashboard/dashboard-layout";
import {
  createWeddingStory,
  deleteWeddingStory,
  getAllWeddingStoriesAdmin,
  seedStoriesFromStatic,
  slugifyStoryTitle,
  updateWeddingStory,
} from "@/lib/firebase/story";
import type {
  WeddingStoryInput,
  WeddingStoryRecord,
} from "@/types/wedding-story";

function createEmptyStory(sortOrder: number): WeddingStoryInput {
  return {
    slug: "",
    couple: "",
    title: "",
    location: "",
    date: "",
    excerpt: "",
    story: [],
    published: false,
    sortOrder,
    cover: {
      src: "",
      alt: "",
    },
    gallery: [],
  };
}

function recordToInput(record: WeddingStoryRecord): WeddingStoryInput {
  return {
    slug: record.slug,
    couple: record.couple,
    title: record.title,
    location: record.location,
    date: record.date,
    excerpt: record.excerpt,
    story: record.story,
    published: record.published,
    sortOrder: record.sortOrder,
    cover: record.cover,
    gallery: record.gallery,
  };
}

export function AdminStoriesPanel() {
  const [stories, setStories] = useState<WeddingStoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<WeddingStoryInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [seeding, setSeeding] = useState(false);

  const loadStories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const results = await getAllWeddingStoriesAdmin();
      setStories(results);
      if (!isCreating) {
        setSelectedSlug((prev) => prev ?? results[0]?.slug ?? null);
      }
    } catch {
      setError("Could not load stories. Check admin access and Firestore rules.");
    } finally {
      setLoading(false);
    }
  }, [isCreating]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const selected = useMemo(
    () => stories.find((story) => story.slug === selectedSlug) ?? null,
    [stories, selectedSlug],
  );

  useEffect(() => {
    if (isCreating) return;
    if (selected) {
      setDraft(recordToInput(selected));
    } else {
      setDraft(null);
    }
  }, [isCreating, selected]);

  const stats = useMemo(() => {
    return {
      total: stories.length,
      published: stories.filter((story) => story.published).length,
    };
  }, [stories]);

  function startCreate() {
    setIsCreating(true);
    setSelectedSlug(null);
    setDraft(createEmptyStory(stories.length));
    setActionError("");
  }

  function cancelCreate() {
    setIsCreating(false);
    setSelectedSlug(stories[0]?.slug ?? null);
    setActionError("");
  }

  async function handleSeed() {
    setSeeding(true);
    setActionError("");
    try {
      await seedStoriesFromStatic();
      setIsCreating(false);
      await loadStories();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not import sample stories.",
      );
    } finally {
      setSeeding(false);
    }
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setActionError("");

    const payload: WeddingStoryInput = {
      ...draft,
      slug: draft.slug.trim() || slugifyStoryTitle(draft.title),
    };

    if (!payload.title.trim()) {
      setActionError("Title is required.");
      setSaving(false);
      return;
    }

    if (!payload.slug) {
      setActionError("Slug is required.");
      setSaving(false);
      return;
    }

    try {
      if (isCreating) {
        await createWeddingStory(payload);
        setIsCreating(false);
        setSelectedSlug(payload.slug);
      } else if (selectedSlug) {
        await updateWeddingStory(selectedSlug, payload);
      }

      await loadStories();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not save story.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedSlug || isCreating) return;
    const confirmed = window.confirm(
      `Delete "${selected?.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setActionError("");
    try {
      await deleteWeddingStory(selectedSlug);
      setSelectedSlug(null);
      setDraft(null);
      await loadStories();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not delete story.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Story CMS"
        title="Wedding Stories"
        description="Manage the wedding story posts displayed on the frontend."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <DashboardStat label="Total Stories" value={stats.total} />
        <DashboardStat label="Published" value={stats.published} />
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!loading && stories.length === 0 && !isCreating && (
        <div className="mb-6 border border-taupe/40 bg-ivory-dark p-5">
          <p className="text-sm text-soft-black-muted">
            No wedding stories in Firestore yet. Import the sample stories or
            create your first story.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              className="label-editorial border border-soft-black bg-soft-black px-4 py-2.5 text-ivory disabled:opacity-40"
            >
              {seeding ? "Importing…" : "Import Sample Stories"}
            </button>
            <button
              type="button"
              onClick={startCreate}
              className="label-editorial border border-taupe/40 px-4 py-2.5 text-soft-black"
            >
              Create Story
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="border border-taupe/40 bg-ivory-dark p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="label-editorial text-soft-black">Stories</p>
            <button
              type="button"
              onClick={startCreate}
              className="label-editorial text-[0.625rem] text-soft-black-muted hover:text-soft-black"
            >
              + New
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-soft-black-muted">Loading…</p>
          ) : (
            <ul className="space-y-1">
              {stories.map((story) => (
                <li key={story.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setSelectedSlug(story.slug);
                      setActionError("");
                    }}
                    className={`w-full border px-3 py-3 text-left transition-colors ${
                      selectedSlug === story.slug && !isCreating
                        ? "border-soft-black bg-ivory"
                        : "border-transparent hover:border-taupe/40 hover:bg-ivory"
                    }`}
                  >
                    <p className="font-display text-base text-soft-black">
                      {story.title}
                    </p>
                    <p className="mt-1 text-xs text-soft-black-muted">
                      {story.couple}
                      {!story.published && " · Draft"}
                    </p>
                  </button>
                </li>
              ))}

              {isCreating && (
                <li className="border border-dashed border-taupe/50 px-3 py-3">
                  <p className="font-display text-base text-soft-black">
                    New Story
                  </p>
                  <p className="mt-1 text-xs text-soft-black-muted">Draft</p>
                </li>
              )}
            </ul>
          )}
        </aside>

        <div>
          {actionError && (
            <p className="mb-4 text-sm text-red-700" role="alert">
              {actionError}
            </p>
          )}

          {draft ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="label-editorial text-muted">
                    {isCreating ? "Create story" : "Edit story"}
                  </p>
                  {selected && !isCreating && (
                    <a
                      href={`/weddings/${selected.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="label-editorial link-underline mt-2 inline-flex text-soft-black-muted hover:text-soft-black"
                    >
                      Preview on site
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {isCreating ? (
                    <button
                      type="button"
                      onClick={cancelCreate}
                      className="label-editorial border border-taupe/40 px-4 py-2 text-soft-black"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting || uploading || saving}
                      className="label-editorial border border-red-200 px-4 py-2 text-red-700 disabled:opacity-40"
                    >
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </div>
              </div>

              <AdminStoryEditor
                value={draft}
                isNew={isCreating}
                saving={saving}
                uploading={uploading}
                onChange={(next) => {
                  setDraft((prev) => {
                    const merged = { ...next };
                    if (
                      isCreating &&
                      (!prev?.slug || prev.slug === slugifyStoryTitle(prev.title ?? "")) &&
                      merged.title
                    ) {
                      merged.slug = slugifyStoryTitle(merged.title);
                    }
                    return merged;
                  });
                }}
                onSave={handleSave}
                onUploadState={setUploading}
              />
            </>
          ) : (
            !loading && (
              <div className="border border-taupe/40 bg-ivory-dark p-8 text-center">
                <p className="text-sm text-soft-black-muted">
                  Select a story or create a new one.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
