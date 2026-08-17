export type PortfolioCategory = "wedding" | "elopement" | "editorial" | "film";

export type PortfolioMediaType = "image" | "video";

export interface PortfolioMediaBase {
  alt: string;
  title?: string;
}

export interface PortfolioImageMedia extends PortfolioMediaBase {
  type: "image";
  src: string;
  width: number;
  height: number;
}

export interface PortfolioVideoMedia extends PortfolioMediaBase {
  type: "video";
  src: string;
  poster: string;
  duration?: string;
}

export type PortfolioMedia = PortfolioImageMedia | PortfolioVideoMedia;

export interface PortfolioProject {
  slug: string;
  title: string;
  description: string;
  location: string;
  category: PortfolioCategory;
  year: string;
  cover: PortfolioMedia;
  media: PortfolioMedia[];
  featured?: boolean;
  gridSpan?: string;
  gridAspect?: string;
}

export interface PortfolioProjectRecord extends PortfolioProject {
  id: string;
  published: boolean;
  sortOrder: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type PortfolioProjectInput = Omit<
  PortfolioProjectRecord,
  "id" | "createdAt" | "updatedAt"
>;

/** @deprecated Use PortfolioProject */
export type PortfolioCategoryLegacy =
  | "wedding"
  | "portrait"
  | "event"
  | "commercial"
  | "editorial";

/** @deprecated Use PortfolioImageMedia */
export interface PortfolioImage {
  src: string;
  alt: string;
  title: string;
  description?: string;
  width: number;
  height: number;
}

/** @deprecated Use PortfolioProject */
export interface PortfolioItem {
  slug: string;
  title: string;
  description: string;
  location?: string;
  category: PortfolioCategoryLegacy;
  images: PortfolioImage[];
  featured?: boolean;
  publishedAt?: string;
}
