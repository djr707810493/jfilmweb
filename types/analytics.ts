export type AnalyticsTotals = {
  activeUsers: number;
  totalUsers: number;
  newUsers: number;
  sessions: number;
  engagedSessions: number;
  screenPageViews: number;
  averageSessionDuration: number;
  userEngagementDuration: number;
  engagementRate: number;
  bounceRate: number;
  eventsPerSession: number;
  sessionsPerUser: number;
  totalEvents: number;
  clicks: number;
  activityEvents: number;
  leads: number;
  quoteOpens: number;
  quoteCompletes: number;
  quoteBookClicks: number;
  inquiryCtaClicks: number;
  contactClicks: number;
};

export type AnalyticsDailyPoint = {
  date: string;
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  leads: number;
  quoteOpens: number;
};

export type AnalyticsChannelRow = {
  channel: string;
  sessions: number;
  activeUsers: number;
  engagementRate: number;
  leads: number;
};

export type AnalyticsSourceRow = {
  sourceMedium: string;
  sessions: number;
  activeUsers: number;
};

export type AnalyticsPageRow = {
  pagePath: string;
  screenPageViews: number;
  activeUsers: number;
  averageSessionDuration: number;
};

export type AnalyticsLandingRow = {
  landingPage: string;
  sessions: number;
  activeUsers: number;
};

export type AnalyticsEventRow = {
  eventName: string;
  eventCount: number;
  totalUsers: number;
};

export type AnalyticsDeviceRow = {
  device: string;
  activeUsers: number;
  sessions: number;
};

export type AnalyticsCountryRow = {
  country: string;
  activeUsers: number;
  sessions: number;
};

export type AnalyticsFunnelStep = {
  id: string;
  label: string;
  users: number;
  droppedFromPrevious: number;
};

export type AnalyticsReport = {
  generatedAt: string;
  range: { days: number; startDate: string; endDate: string };
  previousRange: { startDate: string; endDate: string };
  realtime: {
    activeUsers: number;
    pages: { pagePath: string; activeUsers: number }[];
  };
  current: AnalyticsTotals;
  previous: AnalyticsTotals;
  daily: AnalyticsDailyPoint[];
  channels: AnalyticsChannelRow[];
  sources: AnalyticsSourceRow[];
  topPages: AnalyticsPageRow[];
  landingPages: AnalyticsLandingRow[];
  events: AnalyticsEventRow[];
  devices: AnalyticsDeviceRow[];
  countries: AnalyticsCountryRow[];
  funnel: AnalyticsFunnelStep[];
};

export type AnalyticsRangeDays = 7 | 28 | 90;

export const ANALYTICS_EVENT_LABELS: Record<string, string> = {
  page_view: "Page view",
  session_start: "Session start",
  first_visit: "First visit",
  user_engagement: "User engagement",
  generate_lead: "Inquiry submitted",
  inquiry_cta_click: "Inquiry CTA click",
  contact_click: "Contact click",
  quote_open: "Quote calculator opened",
  quote_step: "Quote step completed",
  quote_complete: "Quote completed",
  quote_book_click: "Quote booking click",
  quote_close: "Quote closed",
  section_dwell: "Section dwell",
  section_exit: "Section exit",
  select_item: "Portfolio item click",
  select_content: "Content click",
};

export function analyticsEventLabel(eventName: string): string {
  return ANALYTICS_EVENT_LABELS[eventName] ?? eventName;
}
