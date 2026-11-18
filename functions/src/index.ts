import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { buildAnalyticsReport } from "./ga4";
export { googleReviews } from "./reviews";

const adminEmails = new Set(["hello@jfilmstudio.com", "djr707810493@gmail.com"]);

function analyticsClient(): BetaAnalyticsDataClient {
  const email = process.env.GA_CLIENT_EMAIL;
  const key = process.env.GA_PRIVATE_KEY;

  return email && key
    ? new BetaAnalyticsDataClient({
        credentials: {
          client_email: email,
          private_key: key.replace(/\\n/g, "\n"),
        },
      })
    : new BetaAnalyticsDataClient();
}

export const getAnalyticsReport = onCall({ region: "us-central1" }, async (request) => {
  const email = request.auth?.token.email?.toLowerCase();
  if (!email || !adminEmails.has(email)) {
    throw new HttpsError("permission-denied", "Admin access is required.");
  }

  const propertyId = (process.env.GA_PROPERTY_ID ?? "").replace(/^properties\//, "");
  if (!propertyId) {
    throw new HttpsError("failed-precondition", "GA_PROPERTY_ID is not configured.");
  }

  const days = Math.min(Math.max(Number(request.data?.days) || 28, 1), 90);

  try {
    return await buildAnalyticsReport({
      client: analyticsClient(),
      propertyId,
      days,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown GA4 API error.";
    console.error("GA4 report failed", message);
    throw new HttpsError("internal", `Could not retrieve GA4 report: ${message}`);
  }
});
