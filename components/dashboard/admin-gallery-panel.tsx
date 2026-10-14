"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPortfolioEditor } from "@/components/dashboard/admin-portfolio-editor";
import {
  DashboardPageHeader,
  DashboardStat,
} from "@/components/dashboard/dashboard-layout";
import {
  createPortfolioProject,
  deletePortfolioProject,
  getAllPortfolioProjectsAdmin,
  projectHasVideo,
  seedPortfolioFromStatic,
  slugifyPortfolioTitle,
  updatePortfolioProject,
} from "@/lib/firebase/portfolio";
import type {
  PortfolioProjectInput,
  PortfolioProjectRecord,
} from "@/types/portfolio";

function createEmptyProject(sortOrder: number): PortfolioProjectInput {
  return {
    slug: "",
    title: "",
    description: "",
    location: "",
    category: "wedding",
    year: new Date().getFullYear().toString(),
    featured: false,
    published: false,
    sortOrder,
    cover: {
      type: "image",
      src: "",
      alt: "",
      width: 1600,
      height: 1200,
    },
    media: [],
  };
}

function recordToInput(record: PortfolioProjectRecord): PortfolioProjectInput {
  return {
    slug: record.slug,
    title: record.title,
    description: record.description,
    location: record.location,
    category: record.category,
    year: record.year,
    featured: record.featured,
    published: record.published,
    sortOrder: record.sortOrder,
    gridSpan: record.gridSpan,
    gridAspect: record.gridAspect,
    cover: record.cover,
    media: record.media,
  };
}

export function AdminGalleryPanel() {
  const [projects, setProjects] = useState<PortfolioProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<PortfolioProjectInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [seeding, setSeeding] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const results = await getAllPortfolioProjectsAdmin();
      setProjects(results);
      if (!isCreating) {
        setSelectedSlug((prev) => prev ?? results[0]?.slug ?? null);
      }
    } catch {
      setError("Could not load portfolio projects. Check admin access and Firestore rules.");
    } finally {
      setLoading(false);
    }
  }, [isCreating]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const selected = useMemo(
    () => projects.find((project) => project.slug === selectedSlug) ?? null,
    [projects, selectedSlug],
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
      total: projects.length,
      published: projects.filter((project) => project.published).length,
      film: projects.filter((project) => projectHasVideo(project)).length,
    };
  }, [projects]);

  function startCreate() {
    setIsCreating(true);
    setSelectedSlug(null);
    setDraft(createEmptyProject(projects.length));
    setActionError("");
  }

  function cancelCreate() {
    setIsCreating(false);
    setSelectedSlug(projects[0]?.slug ?? null);
    setActionError("");
  }

  async function handleSeed() {
    setSeeding(true);
    setActionError("");
    try {
      await seedPortfolioFromStatic();
      setIsCreating(false);
      await loadProjects();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not import sample portfolio.",
      );
    } finally {
      setSeeding(false);
    }
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setActionError("");

    const payload: PortfolioProjectInput = {
      ...draft,
      slug: draft.slug.trim() || slugifyPortfolioTitle(draft.title),
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
        await createPortfolioProject(payload);
        setIsCreating(false);
        setSelectedSlug(payload.slug);
      } else if (selectedSlug) {
        await updatePortfolioProject(selectedSlug, payload);
      }

      await loadProjects();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not save portfolio project.",
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
      await deletePortfolioProject(selectedSlug);
      setSelectedSlug(null);
      setDraft(null);
      await loadProjects();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not delete portfolio project.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Portfolio CMS"
        title="Gallery"
        description="Manage portfolio projects, photos, and films shown on the public site."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <DashboardStat label="Projects" value={stats.total} />
        <DashboardStat label="Published" value={stats.published} />
        <DashboardStat label="With Film" value={stats.film} />
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!loading && projects.length === 0 && !isCreating && (
        <div className="mb-6 border border-taupe/40 bg-ivory-dark p-5">
          <p className="text-sm text-soft-black-muted">
            No portfolio projects in Firestore yet. Import the sample portfolio or
            create your first project.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              className="label-editorial border border-soft-black bg-soft-black px-4 py-2.5 text-ivory disabled:opacity-40"
            >
              {seeding ? "Importing…" : "Import Sample Portfolio"}
            </button>
            <button
              type="button"
              onClick={startCreate}
              className="label-editorial border border-taupe/40 px-4 py-2.5 text-soft-black"
            >
              Create Project
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="border border-taupe/40 bg-ivory-dark p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="label-editorial text-soft-black">Projects</p>
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
              {projects.map((project) => (
                <li key={project.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setSelectedSlug(project.slug);
                      setActionError("");
                    }}
                    className={`w-full border px-3 py-3 text-left transition-colors ${
                      selectedSlug === project.slug && !isCreating
                        ? "border-soft-black bg-ivory"
                        : "border-transparent hover:border-taupe/40 hover:bg-ivory"
                    }`}
                  >
                    <p className="font-display text-base text-soft-black">
                      {project.title}
                    </p>
                    <p className="mt-1 text-xs text-soft-black-muted">
                      {project.location}
                      {!project.published && " · Draft"}
                      {projectHasVideo(project) && " · Film"}
                    </p>
                  </button>
                </li>
              ))}

              {isCreating && (
                <li className="border border-dashed border-taupe/50 px-3 py-3">
                  <p className="font-display text-base text-soft-black">
                    New Project
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
                    {isCreating ? "Create project" : "Edit project"}
                  </p>
                  {selected && !isCreating && (
                    <a
                      href={`/portfolio/item/?slug=${selected.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="label-editorial link-underline mt-2 inline-flex text-soft-black-muted hover:text-soft-black"
                    >
                      Preview on site
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap--2">
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

              <AdminPortfolioEditor
                value={draft}
                isNew={isCreating}
                saving={saving}
                uploading={uploading}
                onChange={(next) => {
                  setDraft((prev) => {
                    const merged = { ...next };
                    if (
                      isCreating &&
                      (!prev?.slug || prev.slug === slugifyPortfolioTitle(prev.title ?? "")) &&
                      merged.title
                    ) {
                      merged.slug = slugifyPortfolioTitle(merged.title);
                    }
                    return merged;
                  });
                }}
                onSave={handleSave}
                onCommit={(next) => {
                  if (isCreating || !selectedSlug) return;
                  updatePortfolioProject(selectedSlug, {
                    ...next,
                    slug: next.slug.trim() || selectedSlug,
                  }).catch((err) => {
                    setActionError(
                      err instanceof Error
                        ? err.message
                        : "Could not save the featured image.",
                    );
                  });
                }}
                onUploadState={setUploading}
              />
            </>
          ) : (
            !loading && (
              <div className="border border-taupe/40 bg-ivory-dark p-8 text-center">
                <p className="text-sm text-soft-black-muted">
                  Select a project or create a new one.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
