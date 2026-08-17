import { SiteImage } from "@/components/site-image";
import type { PortfolioImageMedia } from "@/types/portfolio";

type PortfolioMasonryGalleryProps = {
  images: PortfolioImageMedia[];
};

export function PortfolioMasonryGallery({
  images,
}: PortfolioMasonryGalleryProps) {
  return (
    <div className="columns-2 gap-3 md:columns-3 md:gap-5">
      {images.map((image, index) => (
        <figure
          key={`${image.src}-${index}`}
          className="mb-3 break-inside-avoid overflow-hidden md:mb-5"
        >
          <SiteImage
            src={image.src}
            alt={image.alt}
            width={image.width || 1600}
            height={image.height || 1200}
            priority={index < 2}
            sizes="(max-width: 768px) 50vw, 33vw"
            className="h-auto w-full bg-taupe/10 object-cover transition-transform duration-700 hover:scale-[1.01]"
          />
        </figure>
      ))}
    </div>
  );
}
