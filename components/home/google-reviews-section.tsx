"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { googleBusinessConfig } from "@/data/site";
import { manualGoogleReviews } from "@/data/google-reviews";
import type { GoogleReview } from "@/types/google-reviews";

type ReviewsResponse = {
  rating: number;
  total: number;
  reviews: GoogleReview[];
};

const MAX_EXCERPT_CHARS = 260;
const GOOGLE_REVIEWS_ENDPOINT =
  "https://us-central1-jfilmstudio-f53f3.cloudfunctions.net/googleReviews";

export function GoogleReviewsSection() {
  const [apiData, setApiData] = useState<ReviewsResponse | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = () => setVisibleCount(mq.matches ? 3 : 1);
    mq.addEventListener("change", handler);
    handler();
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(GOOGLE_REVIEWS_ENDPOINT)
      .then((response) => (response.ok ? response.json() : null))
      .then((result: ReviewsResponse | null) => {
        if (!cancelled && result?.reviews?.length) setApiData(result);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const apiReviews: GoogleReview[] = useMemo(() => apiData?.reviews ?? [], [apiData]);

  const reviews = useMemo<GoogleReview[]>(() => {
    const staticReviews = manualGoogleReviews.map((r) => ({ ...r }));
    if (apiReviews.length > 0) {
      return [...apiReviews, ...staticReviews];
    }
    return staticReviews.length > 0 ? staticReviews : [];
  }, [apiReviews]);

  const sortedReviews = useMemo<GoogleReview[]>(() => {
    return [...reviews].sort((a, b) => {
      const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bTime - aTime;
    });
  }, [reviews]);

  const totalRating = useMemo(() => {
    if (apiData?.rating) return apiData.rating;
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [apiData, reviews]);

  const totalCount = useMemo(() => {
    if (apiData?.total) return apiData.total;
    return apiReviews.length > 0 ? reviews.length : undefined;
  }, [apiData, apiReviews, reviews]);

  const pageCount = Math.max(1, Math.ceil(sortedReviews.length / visibleCount));

  // Exact non-overlapping chunks: page i always shows the same set of reviews,
  // and the last page shows the remainder (e.g. 14 reviews / 3 per page =
  // 5 pages: 3, 3, 3, 3, 2 → 14 reviews total).
  const pages = useMemo<GoogleReview[][]>(() => {
    const chunks: GoogleReview[][] = [];
    for (let i = 0; i < sortedReviews.length; i += visibleCount) {
      chunks.push(sortedReviews.slice(i, i + visibleCount));
    }
    return chunks.length > 0 ? chunks : [[]];
  }, [sortedReviews, visibleCount]);

  const activePage = Math.min(
    Math.max(Math.floor(startIndex / visibleCount), 0),
    pages.length - 1,
  );
  const visibleReviews = pages[activePage];

  const movePage = useCallback(
    (direction: number) => {
      setStartIndex((current) => {
        const nextPage = Math.floor(current / visibleCount) + direction;
        const maxPage = pages.length - 1;
        const page = Math.min(Math.max(nextPage, 0), maxPage);
        return page * visibleCount;
      });
    },
    [visibleCount, pages.length],
  );

  useEffect(() => {
    if (!reviews.length || paused || reviews.length <= visibleCount) return;
    const timer = window.setInterval(() => movePage(1), 8000);
    return () => window.clearInterval(timer);
  }, [reviews, paused, visibleCount, movePage]);

  if (reviews.length === 0) return null;

  const fallbackReviewLink =
    googleBusinessConfig.reviewsUrl || googleBusinessConfig.profileUrl;

  return (
    <section
      aria-labelledby="google-reviews-title"
      className="relative overflow-hidden border-b border-taupe/40 bg-[#eee9e1] py-16 sm:py-20 md:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-8 size-72 rounded-full border border-taupe/20" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full border border-taupe/20" />
      <div className="container-editorial relative">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <p className="label-editorial">Kind words</p>
            <h2 id="google-reviews-title" className="font-display mt-3 text-3xl leading-tight text-soft-black sm:text-4xl md:text-5xl">
              From the people who were there.
            </h2>
            <a
              href={googleBusinessConfig.profileUrl || "https://www.google.com/search?q=J+FILM+STUDIO+Utah+reviews"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-taupe/40 bg-ivory/70 px-4 py-2 text-sm text-soft-black transition-colors hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-black"
            >
              <GoogleMark />
              <span className="font-medium">{totalRating.toFixed(1)}</span>
              <span className="text-amber-700" aria-label={`${totalRating} out of 5 stars`}>
                ★★★★★
              </span>
              {totalCount && <span className="text-soft-black-muted">· {totalCount} Google reviews</span>}
              <span aria-hidden="true" className="ml-1">↗</span>
            </a>
          </div>

          <div className="mt-9 md:mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleReviews.map((review, i) => (
                <ReviewCard
                  key={review.id ?? `${review.author}-${i}`}
                  review={review}
                  reviewLink={review.reviewUrl || fallbackReviewLink}
                  animationDelay={i * 100}
                />
              ))}
            </div>

            {pageCount > 1 && (
              <div className="mt-8 flex items-center justify-center gap-5">
                <button
                  type="button"
                  onClick={() => movePage(-1)}
                  disabled={activePage === 0}
                  aria-label="Previous reviews"
                  className="flex size-11 items-center justify-center rounded-full border border-taupe/50 text-xl text-soft-black transition-all disabled:opacity-40 disabled:pointer-events-none hover:-translate-x-0.5 hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-black"
                >
                  ←
                </button>
                <div className="flex items-center gap-2" aria-label={`Review page ${activePage + 1} of ${pageCount}`}>
                  {Array.from({ length: pageCount }).map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      type="button"
                      aria-label={`Show review page ${dotIndex + 1}`}
                      aria-current={dotIndex === activePage ? "true" : undefined}
                      onClick={() => setStartIndex(dotIndex * visibleCount)}
                      className={`h-2 rounded-full transition-all duration-500 ${dotIndex === activePage ? "w-7 bg-soft-black" : "w-2 bg-taupe/70 hover:bg-soft-black/50"}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => movePage(1)}
                  disabled={activePage === pageCount - 1}
                  aria-label="Next reviews"
                  className="flex size-11 items-center justify-center rounded-full border border-taupe/50 text-xl text-soft-black transition-all disabled:opacity-40 disabled:pointer-events-none hover:translate-x-0.5 hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-black"
                >
                  →
                </button>
              </div>
            )}
            <p className="mt-5 text-center text-xs text-muted">
              Reviews are displayed from our Google Business Profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({
  review,
  reviewLink,
  animationDelay,
}: {
  review: GoogleReview;
  reviewLink: string | null;
  animationDelay?: number;
}) {
  const excerpt =
    review.text.length > MAX_EXCERPT_CHARS
      ? review.text.slice(0, MAX_EXCERPT_CHARS).trim().replace(/\s+\S*$/, "…")
      : review.text;

  return (
    <div
      className="review-card-enter relative flex min-h-[24rem] flex-col border border-taupe/30 bg-ivory px-6 py-10 text-center shadow-[0_18px_60px_rgba(39,34,29,0.07)] sm:px-8 md:px-12 md:py-12"
      style={{ animationDelay: `${animationDelay ?? 0}ms` }}
    >
      <span aria-hidden="true" className="font-display absolute left-4 top-3 text-7xl leading-none text-taupe/45 sm:left-6 sm:top-4 sm:text-8xl">
        “
      </span>
      <div
        className="relative flex justify-center gap-1.5 text-lg tracking-[0.2em] text-amber-700"
        aria-label={`${review.rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, star) => (
          <span key={star} aria-hidden="true">
            {star < review.rating ? "★" : "☆"}
          </span>
        ))}
      </div>
      <p className="font-display mt-6 max-w-none text-lg leading-relaxed text-soft-black sm:text-xl md:text-lg">
        {excerpt}
        {review.text.length > MAX_EXCERPT_CHARS && reviewLink && (
          <a
            href={reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-xs font-medium underline underline-offset-2 hover:text-taupe"
          >
            Full ↗
          </a>
        )}
      </p>
      <div className="mt-auto pt-8">
        <ReviewerLink review={review} href={reviewLink} />
        <p className="mt-3 text-xs text-muted">
          Google review{reviewDateLabel(review) ? ` · ${reviewDateLabel(review)}` : ""}
        </p>
      </div>
    </div>
  );
}

const AVATAR_PALETTE = [
  "#c05621",
  "#1a73e8",
  "#546e7a",
  "#5c6bc0",
  "#00897b",
  "#8e24aa",
  "#8d6e63",
  "#d81b60",
  "#2e7d32",
  "#455a64",
];

function avatarColorFor(review: GoogleReview): string {
  if (review.avatarColor) return review.avatarColor;
  let hash = 0;
  for (let i = 0; i < review.author.length; i += 1) {
    hash = (hash * 31 + review.author.charCodeAt(i)) % 9973;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function ReviewerLink({ review, href }: { review: GoogleReview; href: string | null }) {
  const content = (
    <>
      <ReviewAvatar review={review} />
      <span className="text-sm font-medium text-soft-black underline-offset-4 group-hover/name:underline">
        {review.author}
      </span>
    </>
  );

  if (!href) {
    return <div className="flex items-center justify-center gap-3">{content}</div>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Read ${review.author}'s review on Google`}
      className="group/name flex items-center justify-center gap-3 rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-black"
    >
      {content}
    </a>
  );
}

function ReviewAvatar({ review }: { review: GoogleReview }) {
  const imageSrc = review.avatarUrl || review.photoUrl;

  if (imageSrc) {
    return (
      // Reviewer photos come from Google's image host, not a Next image source.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        className="size-10 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full font-display text-lg text-white"
      style={{ backgroundColor: avatarColorFor(review) }}
    >
      {review.author.slice(0, 1).toUpperCase()}
    </span>
  );
}

function reviewDateLabel(review: GoogleReview): string {
  if (review.displayDate) return review.displayDate;
  const hasYear = /\b(19|20)\d{2}\b/.test(review.relativeDate);
  if (hasYear || !review.publishedAt) return review.relativeDate;
  const parsed = new Date(`${review.publishedAt}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return review.relativeDate;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="size-4"
    >
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.9 6-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5.1c-1.8 1.2-4.1 2-6.8 2-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.8 27.9a12 12 0 0 1 0-7.8v-5.2H5.9a20 20 0 0 0 0 18.2l6.9-5.2Z"
      />
      <path
        fill="#EA4335"
        d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.9 14.9l6.9 5.2c1.6-4.7 6-8.2 11.2-8.2Z"
      />
    </svg>
  );
}
