import Link from "next/link";
import { SiteImage } from "@/components/site-image";
import { PortfolioMasonryGallery } from "@/components/portfolio/portfolio-masonry-gallery";
import { PortfolioVideo } from "@/components/portfolio/portfolio-video";
import type {
  PortfolioMedia,
  PortfolioProject,
  PortfolioVideoMedia,
} from "@/types/portfolio";

function getProjectFilms(project: PortfolioProject): PortfolioVideoMedia[] {
  const films = project.media.filter(
    (item): item is PortfolioVideoMedia =>
      item.type === "video" && Boolean(item.src.trim()),
  );

  if (project.cover.type !== "video" || !project.cover.src.trim()) {
    return films;
  }

  const coverSrc = project.cover.src.trim();
  const alreadyListed = films.some((film) => film.src.trim() === coverSrc);

  return alreadyListed ? films : [project.cover, ...films];
}

type PortfolioDetailViewProps = {
  project: PortfolioProject;
};

export function PortfolioDetailView({ project }: PortfolioDetailViewProps) {
  const stills = project.media.filter((item) => item.type === "image");
  const films = getProjectFilms(project);

  return (
    <article>
      <div className="container-editorial border-b border-taupe/40 pt-10 pb-8 md:pt-16 md:pb-12">
        <Link
          href="/portfolio"
          className="label-editorial link-underline text-soft-black-muted transition-colors hover:text-soft-black"
        >
          All Work
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-16">
          <header className="lg:col-span-5">
            <p className="label-editorial">
              {project.location} · {project.year}
            </p>
            <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3.5rem)] leading-snug text-soft-black md:mt-4">
              {project.title}
            </h1>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-soft-black-muted md:text-base">
              {project.description}
            </p>
            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-taupe/30 pt-6 text-sm">
              <div>
                <dt className="label-editorial mb-1">Location</dt>
                <dd className="text-soft-black-muted">{project.location}</dd>
              </div>
              <div>
                <dt className="label-editorial mb-1">Year</dt>
                <dd className="text-soft-black-muted">{project.year}</dd>
              </div>
              <div>
                <dt className="label-editorial mb-1">Medium</dt>
                <dd className="text-soft-black-muted">
                  {films.length > 0 ? "Photography & Film" : "Photography"}
                </dd>
              </div>
            </dl>
          </header>

          <div className="lg:col-span-7">
            <DetailMedia media={project.cover} priority featured />
          </div>
        </div>
      </div>

      {films.length > 0 && (
        <section className="section-y-compact border-b border-taupe/40 bg-ivory-dark md:section-y">
          <div className="container-editorial">
            <p className="label-editorial">Film</p>
            <h2 className="font-display mt-3 text-2xl text-soft-black md:text-3xl">
              Moving Images
            </h2>
            <div className="mt-8 space-y-5 md:mt-10">
              {films.map((film) => (
                <div key={film.src + film.alt}>
                  <PortfolioVideo media={film} layout="inline" />
                  {film.title && (
                    <p className="label-editorial mt-3 text-soft-black-muted">
                      {film.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {stills.length > 0 && (
        <section className="section-y-compact md:section-y">
          <div className="container-editorial">
            <p className="label-editorial">Stills</p>
            <h2 className="font-display mt-3 text-2xl text-soft-black md:text-3xl">
              Selected Frames
            </h2>
            <div className="mt-8 md:mt-10">
              <PortfolioMasonryGallery images={stills} />
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

function DetailMedia({
  media,
  priority = false,
  featured = false,
}: {
  media: PortfolioMedia;
  priority?: boolean;
  featured?: boolean;
}) {
  if (media.type === "video") {
    return (
      <div
        className={`relative overflow-hidden ${featured ? "aspect-[4/5] md:aspect-[16/10]" : "aspect-video"}`}
      >
        <PortfolioVideo
          media={media}
          layout={featured ? "facade" : "inline"}
          fit="fill"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${featured ? "aspect-[4/5] md:aspect-[16/10]" : "aspect-[4/5]"}`}
    >
      <SiteImage
        src={media.src}
        alt={media.alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-cover"
      />
    </div>
  );
}
