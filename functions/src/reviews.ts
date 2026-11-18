import { onRequest } from "firebase-functions/v2/https";

export type GoogleReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  relativeDate: string;
  photoUrl: string | null;
  reviewUrl: string | null;
};

type PlacesReview = {
  name?: string;
  rating?: number;
  text?: { text?: string };
  relativePublishTimeDescription?: string;
  googleMapsUri?: string;
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
    uri?: string;
  };
};

type PlacesResponse = {
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesReview[];
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cache: { expiresAt: number; payload: unknown } | null = null;

function normalize(reviews: PlacesReview[] | undefined): GoogleReview[] {
  return (reviews ?? [])
    .filter((review) => (review.text?.text ?? "").trim().length > 0)
    .map((review, index) => ({
      id: review.name ?? `review-${index}`,
      author: review.authorAttribution?.displayName?.trim() || "Google reviewer",
      rating: review.rating ?? 0,
      text: (review.text?.text ?? "").trim(),
      relativeDate: review.relativePublishTimeDescription ?? "",
      photoUrl: review.authorAttribution?.photoUri ?? null,
      reviewUrl: review.googleMapsUri ?? null,
    }));
}

/**
 * Public, cache-friendly endpoint used by the homepage testimonial carousel.
 * Returns the most recent Google Business Profile reviews.
 */
export const googleReviews = onRequest(
  { region: "us-central1", cors: true, invoker: "public" },
  async (request, response) => {
    const placeId = process.env.GOOGLE_PLACE_ID;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const query =
      process.env.GOOGLE_PLACES_QUERY ?? "J FILM STUDIO Utah wedding photographer";

    if (!apiKey) {
      response.status(503).json({ error: "Google reviews are not configured." });
      return;
    }

    if (cache && cache.expiresAt > Date.now()) {
      response.set("Cache-Control", "public, max-age=1800");
      response.status(200).json(cache.payload);
      return;
    }

    try {
      const placeResponse = placeId
        ? await fetch(
            `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
            {
              headers: {
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "rating,userRatingCount,reviews",
              },
            },
          )
        : await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey,
              "X-Goog-FieldMask": "places.rating,places.userRatingCount,places.reviews",
            },
            body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
          });

      if (!placeResponse.ok) {
        response.status(502).json({ error: "Google Places request failed." });
        return;
      }

      const raw = (await placeResponse.json()) as PlacesResponse & {
        places?: PlacesResponse[];
      };
      const place: PlacesResponse = raw.places?.[0] ?? raw;
      const payload = {
        rating: place.rating ?? 0,
        total: place.userRatingCount ?? 0,
        reviews: normalize(place.reviews),
      };

      cache = { expiresAt: Date.now() + CACHE_TTL_MS, payload };
      response.set("Cache-Control", "public, max-age=1800");
      response.status(200).json(payload);
    } catch {
      response.status(502).json({ error: "Could not load Google reviews." });
    }
  },
);
