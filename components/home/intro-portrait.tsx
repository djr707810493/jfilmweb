import { SiteImage } from "@/components/site-image";
import { introContent } from "@/data/homepage";

export function IntroPortrait() {
  const { image } = introContent;

  return (
    <div className="relative ml-auto aspect-[3/4] w-full max-w-[9rem] sm:max-w-xs md:max-w-md lg:max-w-none">
      <SiteImage
        src={image.src}
        alt={image.alt}
        fill
        sizes="(max-width: 640px) 35vw, (max-width: 1024px) 40vw, 33vw"
        className="object-cover image-hover"
      />
    </div>
  );
}
