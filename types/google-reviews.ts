export type GoogleReview = {
  id?: string;
  author: string;
  rating: number;
  text: string;
  relativeDate: string;
  /** Human-readable date shown on the card, e.g. "May 2026". */
  displayDate?: string;
  /** ISO date used to order reviews newest-first. */
  publishedAt?: string;
  photoUrl: string | null;
  /** Local or remote avatar image; falls back to a colored initial. */
  avatarUrl?: string | null;
  /** Hex background for the fallback initial avatar. */
  avatarColor?: string;
  reviewUrl: string | null;
};
