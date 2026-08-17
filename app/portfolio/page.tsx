import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Portfolio | Park City & Moab Wedding Photographer",
  description:
    "View our portfolio of editorial wedding photography and films. True-to-color storytelling across Park City, Moab, Zion, and Utah's stunning landscapes.",
  path: "/portfolio",
  ogImage: "/og-portfolio.jpg",
});

export default function PortfolioPage() {
  return (
    <>
      <div className="container-editorial border-b border-taupe/40 pt-12 pb-10 md:pt-20 md:pb-14 lg:pt-24">
        <p className="label-editorial">Portfolio</p>
        <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3.75rem)] leading-snug text-soft-black md:mt-4">
          Selected Work | Utah Wedding Photography
        </h1>
        <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-soft-black-muted md:mt-6 md:text-base">
          Editorial stills and wedding films — true-to-color storytelling across
          Utah&apos;s mountains, desert, and canyon light.
        </p>
      </div>

      <PortfolioGallery />
    </>
  );
}
