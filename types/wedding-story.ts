export type WeddingStoryImage = {
  src: string;
  alt: string;
  aspect?: string;
  span?: string;
};

export type WeddingStory = {
  slug: string;
  couple: string;
  title: string;
  location: string;
  date: string;
  excerpt: string;
  story: string[];
  cover: WeddingStoryImage;
  gallery: WeddingStoryImage[];
};

export interface WeddingStoryRecord extends WeddingStory {
  id: string;
  published: boolean;
  sortOrder: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type WeddingStoryInput = Omit<
  WeddingStoryRecord,
  "id" | "createdAt" | "updatedAt"
>;
