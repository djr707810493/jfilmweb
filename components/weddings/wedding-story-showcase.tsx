import { SiteImage } from "@/components/site-image";
import type { WeddingStory } from "@/types/wedding-story";

type WeddingStoryShowcaseProps = {
  story: WeddingStory;
  index: number;
  headingLevel?: "h1" | "h2";
};

export function WeddingStoryShowcase({
  story,
  index,
  headingLevel = "h2",
}: WeddingStoryShowcaseProps) {
  return (
    <article
      id={story.slug}
      className={index > 0 ? "border-t border-taupe/40 pt-12 md:pt-20 lg:pt-24" : ""}
    >
      <div className="relative overflow-hidden">
        <div className={`relative w-full ${story.cover.aspect ?? "aspect-[4/5] md:aspect-[16/10]"}`}>
          <SiteImage
            src={story.cover.src}
            alt={story.cover.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="container-editorial mt-8 md:mt-12 lg:mt-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <header className="lg:col-span-5">
            <p className="label-editorial">{story.location}</p>
            {headingLevel === "h1" ? (
              <h1 className="font-display mt-3 text-[clamp(1.75rem,5vw,3rem)] leading-snug text-soft-black md:mt-4">
                {story.couple}
              </h1>
            ) : (
              <h2 className="font-display mt-3 text-[clamp(1.75rem,5vw,3rem)] leading-snug text-soft-black md:mt-4">
                {story.couple}
              </h2>
            )}
            <p className="font-display mt-2 text-xl text-soft-black-muted md:text-2xl">
              {story.title}
            </p>
            <p className="label-editorial mt-4 text-taupe">{story.date}</p>
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-soft-black-muted md:text-base">
              {story.excerpt}
            </p>
          </header>

          <div className="space-y-5 lg:col-span-7 lg:pt-2">
            {story.story.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="text-[0.9375rem] leading-relaxed text-soft-black-muted md:text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-12 md:gap-5">
          {story.gallery.map((image) => (
            <div
              key={image.src + image.alt}
              className={`relative overflow-hidden ${image.span ?? "md:col-span-6"} ${image.aspect ?? "aspect-[4/5] md:aspect-[4/5]"}`}
            >
              <SiteImage
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-opacity duration-500 hover:opacity-95"
              />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
