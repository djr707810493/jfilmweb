import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type {
  AnalyticsChannelRow,
  AnalyticsCountryRow,
  AnalyticsDailyPoint,
  AnalyticsDeviceRow,
  AnalyticsEventRow,
  AnalyticsFunnelStep,
  AnalyticsLandingRow,
  AnalyticsPageRow,
  AnalyticsReport,
  AnalyticsSourceRow,
  AnalyticsTotals,
} from "./types";

const TOTALS_METRICS = [
  "activeUsers",
  "totalUsers",
  "newUsers",
  "sessions",
  "engagedSessions",
  "screenPageViews",
  "averageSessionDuration",
  "engagementRate",
  "bounceRate",
  "userEngagementDuration",
];

const TOTALS_INDEX = Object.fromEntries(
  TOTALS_METRICS.map((name, index) => [name, index]),
) as Record<(typeof TOTALS_METRICS)[number], number>;

const CLICK_EVENTS = [
  "click",
  "inquiry_cta_click",
  "contact_click",
  "quote_book_click",
  "select_item",
  "select_content",
  "file_download",
];

const ACTIVITY_EVENTS = [
  "page_view",
  "session_start",
  "click",
  "scroll",
  "form_start",
  "form_submit",
  "video_start",
  "video_progress",
  "file_download",
  "select_item",
  "section_dwell",
  "quote_open",
  "quote_complete",
  "inquiry_cta_click",
  "contact_click",
  "generate_lead",
];

export const FUNNEL_EVENTS = [
  { id: "page_view", label: "Page view" },
  { id: "inquiry_cta_click", label: "Inquiry CTA click" },
  { id: "quote_open", label: "Quote calculator opened" },
  { id: "quote_complete", label: "Quote completed" },
  { id: "quote_book_click", label: "Book package click" },
  { id: "generate_lead", label: "Inquiry submitted" },
];

type RawRow = {
  dimensionValues?: ({ value?: string | null } | null)[] | null;
  metricValues?: ({ value?: string | null } | null)[] | null;
};

type DateRange = { startDate: string; endDate: string };

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function resolveRanges(days: number): {
  current: DateRange;
  previous: DateRange;
} {
  const today = new Date();
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const previousEnd = new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - (days - 1));

  return {
    current: { startDate: isoDate(start), endDate: isoDate(end) },
    previous: { startDate: isoDate(previousStart), endDate: isoDate(previousEnd) },
  };
}

function dimensionValues(row: RawRow): string[] {
  return (row.dimensionValues ?? []).map((value) => value?.value ?? "(not set)");
}

function metricValues(row: RawRow): number[] {
  return (row.metricValues ?? []).map((value) => Number(value?.value ?? 0));
}

function rowsOf(
  response: { rows?: RawRow[] | null } | undefined,
): { dimensions: string[]; metrics: number[] }[] {
  return (response?.rows ?? []).map((row) => ({
    dimensions: dimensionValues(row),
    metrics: metricValues(row),
  }));
}

function totalsOf(response: { rows?: RawRow[] | null } | undefined): AnalyticsTotals {
  const metrics = metricValues(response?.rows?.[0] ?? {});

  return {
    activeUsers: metrics[TOTALS_INDEX.activeUsers] ?? 0,
    totalUsers: metrics[TOTALS_INDEX.totalUsers] ?? 0,
    newUsers: metrics[TOTALS_INDEX.newUsers] ?? 0,
    sessions: metrics[TOTALS_INDEX.sessions] ?? 0,
    engagedSessions: metrics[TOTALS_INDEX.engagedSessions] ?? 0,
    screenPageViews: metrics[TOTALS_INDEX.screenPageViews] ?? 0,
    averageSessionDuration: metrics[TOTALS_INDEX.averageSessionDuration] ?? 0,
    engagementRate: metrics[TOTALS_INDEX.engagementRate] ?? 0,
    bounceRate: metrics[TOTALS_INDEX.bounceRate] ?? 0,
    userEngagementDuration: metrics[TOTALS_INDEX.userEngagementDuration] ?? 0,
    eventsPerSession: 0,
    sessionsPerUser: 0,
    totalEvents: 0,
    clicks: 0,
    activityEvents: 0,
    leads: 0,
    quoteOpens: 0,
    quoteCompletes: 0,
    quoteBookClicks: 0,
    inquiryCtaClicks: 0,
    contactClicks: 0,
  };
}

function eventCountsFrom(rows: { dimensions: string[]; metrics: number[] }[]): Map<string, number> {
  return new Map(rows.map((row) => [row.dimensions[0] ?? "", row.metrics[0] ?? 0]));
}

function withEventTotals(
  totals: AnalyticsTotals,
  rows: { dimensions: string[]; metrics: number[] }[],
): AnalyticsTotals {
  const counts = eventCountsFrom(rows);
  return {
    ...totals,
    totalEvents: rows.reduce((sum, row) => sum + (row.metrics[0] ?? 0), 0),
    clicks: rows.reduce(
      (sum, row) => sum + (CLICK_EVENTS.includes(row.dimensions[0] ?? "") ? row.metrics[0] ?? 0 : 0),
      0,
    ),
    activityEvents: rows.reduce(
      (sum, row) => sum + (ACTIVITY_EVENTS.includes(row.dimensions[0] ?? "") ? row.metrics[0] ?? 0 : 0),
      0,
    ),
    eventsPerSession: totals.sessions > 0 ? rows.reduce((sum, row) => sum + (row.metrics[0] ?? 0), 0) / totals.sessions : 0,
    sessionsPerUser: totals.activeUsers > 0 ? totals.sessions / totals.activeUsers : 0,
    leads: counts.get("generate_lead") ?? 0,
    quoteOpens: counts.get("quote_open") ?? 0,
    quoteCompletes: counts.get("quote_complete") ?? 0,
    quoteBookClicks: counts.get("quote_book_click") ?? 0,
    inquiryCtaClicks: counts.get("inquiry_cta_click") ?? 0,
    contactClicks: counts.get("contact_click") ?? 0,
  };
}

export async function buildAnalyticsReport({
  client,
  propertyId,
  days,
}: {
  client: BetaAnalyticsDataClient;
  propertyId: string;
  days: number;
}): Promise<AnalyticsReport> {
  const property = `properties/${propertyId}`;
  const { current, previous } = resolveRanges(days);
  const eventFilter = (names: string[]) => ({
    filter: { fieldName: "eventName", inListFilter: { values: names } },
  });

  const [
    totalsResponse,
    previousTotalsResponse,
    dailyResponse,
    dailyLeadsResponse,
    dailyQuotesResponse,
    channelsResponse,
    channelLeadsResponse,
    sourcesResponse,
    pagesResponse,
    landingResponse,
    eventsResponse,
    funnelResponse,
    devicesResponse,
    countriesResponse,
    realtimeResponse,
  ] = await Promise.all([
    client.runReport({
      property,
      dateRanges: [current],
      metrics: TOTALS_METRICS.map((name) => ({ name })),
    }),
    client.runReport({
      property,
      dateRanges: [previous],
      metrics: TOTALS_METRICS.map((name) => ({ name })),
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: 400,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventFilter(["generate_lead"]),
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: 400,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventFilter(["quote_open"]),
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: 400,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "engagementRate" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 12,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventFilter(["generate_lead"]),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 12,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "sessionSourceMedium" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "averageSessionDuration" },
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 12,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "landingPagePlusQueryString" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 30,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "totalUsers" }],
      dimensionFilter: eventFilter(FUNNEL_EVENTS.map((step) => step.id)),
      limit: 20,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 5,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    }),
    client.runRealtimeReport({
      property,
      dimensions: [{ name: "unifiedScreenName" }],
      metrics: [{ name: "activeUsers" }],
      limit: 5,
    }),
  ]);

  const events = rowsOf(eventsResponse[0]);
  const dailyLeads = new Map(rowsOf(dailyLeadsResponse[0]).map((row) => [row.dimensions[0], row.metrics[0]]));
  const dailyQuotes = new Map(rowsOf(dailyQuotesResponse[0]).map((row) => [row.dimensions[0], row.metrics[0]]));
  const channelLeads = new Map(rowsOf(channelLeadsResponse[0]).map((row) => [row.dimensions[0], row.metrics[0]]));

  const daily: AnalyticsDailyPoint[] = rowsOf(dailyResponse[0]).map((row) => {
    const date = row.dimensions[0] ?? "";
    return {
      date,
      activeUsers: row.metrics[0] ?? 0,
      sessions: row.metrics[1] ?? 0,
      screenPageViews: row.metrics[2] ?? 0,
      leads: dailyLeads.get(date) ?? 0,
      quoteOpens: dailyQuotes.get(date) ?? 0,
    };
  });

  const channels: AnalyticsChannelRow[] = rowsOf(channelsResponse[0]).map((row) => ({
    channel: row.dimensions[0] ?? "(not set)",
    sessions: row.metrics[0] ?? 0,
    activeUsers: row.metrics[1] ?? 0,
    engagementRate: row.metrics[2] ?? 0,
    leads: channelLeads.get(row.dimensions[0] ?? "") ?? 0,
  }));

  const sources: AnalyticsSourceRow[] = rowsOf(sourcesResponse[0]).map((row) => ({
    sourceMedium: row.dimensions[0] ?? "(not set)",
    sessions: row.metrics[0] ?? 0,
    activeUsers: row.metrics[1] ?? 0,
  }));

  const topPages: AnalyticsPageRow[] = rowsOf(pagesResponse[0]).map((row) => ({
    pagePath: row.dimensions[0] ?? "/",
    screenPageViews: row.metrics[0] ?? 0,
    activeUsers: row.metrics[1] ?? 0,
    averageSessionDuration: row.metrics[2] ?? 0,
  }));

  const landingPages: AnalyticsLandingRow[] = rowsOf(landingResponse[0]).map((row) => ({
    landingPage: row.dimensions[0] ?? "/",
    sessions: row.metrics[0] ?? 0,
    activeUsers: row.metrics[1] ?? 0,
  }));

  const eventRows: AnalyticsEventRow[] = events.map((row) => ({
    eventName: row.dimensions[0] ?? "",
    eventCount: row.metrics[0] ?? 0,
    totalUsers: row.metrics[1] ?? 0,
  }));

  const funnelUsers = new Map(
    rowsOf(funnelResponse[0]).map((row) => [row.dimensions[0] ?? "", row.metrics[0] ?? 0]),
  );
  const funnel: AnalyticsFunnelStep[] = FUNNEL_EVENTS.map((step, index, all) => {
    const users = funnelUsers.get(step.id) ?? 0;
    const previousUsers = index === 0 ? users : funnelUsers.get(all[index - 1].id) ?? 0;
    return {
      id: step.id,
      label: step.label,
      users,
      droppedFromPrevious: index === 0 ? 0 : Math.max(0, previousUsers - users),
    };
  });

  const devices: AnalyticsDeviceRow[] = rowsOf(devicesResponse[0]).map((row) => ({
    device: row.dimensions[0] ?? "unknown",
    activeUsers: row.metrics[0] ?? 0,
    sessions: row.metrics[1] ?? 0,
  }));

  const countries: AnalyticsCountryRow[] = rowsOf(countriesResponse[0]).map((row) => ({
    country: row.dimensions[0] ?? "(not set)",
    activeUsers: row.metrics[0] ?? 0,
    sessions: row.metrics[1] ?? 0,
  }));

  const realtimeRows = rowsOf(realtimeResponse[0]);

  return {
    generatedAt: new Date().toISOString(),
    range: { days, startDate: current.startDate, endDate: current.endDate },
    previousRange: { startDate: previous.startDate, endDate: previous.endDate },
    realtime: {
      activeUsers: realtimeRows.reduce((sum, row) => sum + (row.metrics[0] ?? 0), 0),
      pages: realtimeRows.map((row) => ({
        pagePath: row.dimensions[0] ?? "/",
        activeUsers: row.metrics[0] ?? 0,
      })),
    },
    current: withEventTotals(totalsOf(totalsResponse[0]), events),
    previous: withEventTotals(totalsOf(previousTotalsResponse[0]), []),
    daily,
    channels,
    sources,
    topPages,
    landingPages,
    events: eventRows,
    devices,
    countries,
    funnel,
  };
}
