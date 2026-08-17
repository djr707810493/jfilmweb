import Link from "next/link";
import type { PortfolioItem } from "@/types/portfolio";

type PortfolioCardProps = {
  item: PortfolioItem;
};

export function PortfolioCard({ item }: PortfolioCardProps) {
  const cover = item.images[0];

  return (
    <article className="group">
      <Link href={`/portfolio/${item.slug}`} className="block">
        <div
          className="aspect-[4/3] w-full bg-neutral-200"
          role="img"
          aria-label={cover?.alt ?? item.title}
        />
        <div className="mt-3 space-y-1">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            {item.category}
            {item.location ? ` · ${item.location}` : ""}
          </p>
          <h3 className="text-base font-medium text-neutral-900 group-hover:underline">
            {item.title}
          </h3>
          <p className="text-sm text-neutral-600">{item.description}</p>
        </div>
      </Link>
    </article>
  );
}
