"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DashboardPageHeader,
  DashboardStat,
  dashboardSelectClass,
} from "@/components/dashboard/dashboard-layout";
import {
  analyticsDelta,
  fetchAnalyticsReport,
  formatAnalyticsCount,
  formatAnalyticsDate,
  formatAnalyticsDuration,
  formatAnalyticsPercent,
} from "@/lib/firebase/analytics-report";
import { analyticsEventLabel, type AnalyticsReport } from "@/types/analytics";

type Range = 7 | 28 | 90;
type Tab = "overview" | "acquisition" | "content" | "events";

const CLICK_EVENT_NAMES = new Set([
  "click",
  "inquiry_cta_click",
  "contact_click",
  "quote_book_click",
  "select_item",
  "select_content",
  "file_download",
]);

function currentEngagementTime(report: AnalyticsReport): number {
  return report.current.userEngagementDuration / Math.max(report.current.activeUsers, 1);
}

function interactionRows(report: AnalyticsReport) {
  return report.events
    .filter((row) => CLICK_EVENT_NAMES.has(row.eventName))
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 8);
}

function EngagementRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3">
      <dt className="text-sm text-soft-black-muted">{label}</dt>
      <dd className="shrink-0 text-sm font-medium text-soft-black">{value}</dd>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border border-taupe/40 bg-ivory-dark"><div className="border-b border-taupe/30 px-5 py-4"><p className="label-editorial">{title}</p></div>{children}</section>;
}

function DataTable({ headers, children, empty }: { headers: string[]; children: ReactNode; empty: boolean }) {
  if (empty) return <p className="p-6 text-sm text-soft-black-muted">No data for this period.</p>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[34rem] text-left text-sm"><thead className="border-b border-taupe/30"><tr className="label-editorial text-[0.5625rem] text-muted">{headers.map((header) => <th key={header} className="px-5 py-3 font-normal">{header}</th>)}</tr></thead><tbody className="divide-y divide-taupe/25">{children}</tbody></table></div>;
}

function Delta({ current, previous }: { current: number; previous: number }) {
  const change = analyticsDelta(current, previous);
  if (change === null) return <span className="text-xs text-muted">New</span>;
  return <span className={`text-xs ${change >= 0 ? "text-emerald-800" : "text-red-800"}`}>{change > 0 ? "+" : ""}{(change * 100).toFixed(1)}% vs previous</span>;
}

function TrendChart({ report }: { report: AnalyticsReport }) {
  const [metric, setMetric] = useState<"activeUsers" | "sessions" | "leads" | "quoteOpens">("activeUsers");
  const values = report.daily.map((point) => point[metric]);
  const max = Math.max(...values, 1);
  const label = metric === "activeUsers" ? "Active users" : metric === "sessions" ? "Sessions" : metric === "leads" ? "Inquiries" : "Quote opens";

  return <Panel title="Traffic & conversion trend"><div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4"><p className="text-sm text-soft-black-muted">Daily {label.toLowerCase()} · {formatAnalyticsDate(report.range.startDate.replaceAll("-", ""))} – {formatAnalyticsDate(report.range.endDate.replaceAll("-", ""))}</p><select aria-label="Trend metric" value={metric} onChange={(event) => setMetric(event.target.value as typeof metric)} className={`${dashboardSelectClass} mt-0 w-auto py-2`}><option value="activeUsers">Active users</option><option value="sessions">Sessions</option><option value="leads">Inquiries</option><option value="quoteOpens">Quote opens</option></select></div><div className="mt-5 flex h-48 items-end gap-1 border-b border-taupe/30 px-5">{report.daily.map((point) => <div key={point.date} className="group relative flex h-full flex-1 items-end" title={`${formatAnalyticsDate(point.date)} · ${formatAnalyticsCount(point[metric])}`}><div className="w-full rounded-t-sm bg-soft-black/80 transition-colors group-hover:bg-taupe" style={{ height: `${Math.max(2, (point[metric] / max) * 100)}%` }} /></div>)}</div><div className="flex justify-between px-5 py-3 text-[0.625rem] text-muted"><span>{report.daily[0] ? formatAnalyticsDate(report.daily[0].date) : ""}</span><span>{report.daily.at(-1) ? formatAnalyticsDate(report.daily.at(-1)!.date) : ""}</span></div></Panel>;
}

function Overview({ report }: { report: AnalyticsReport }) {
  const { current, previous } = report;
  const conversion = current.sessions ? current.leads / current.sessions : 0;
  return <>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
      <div><DashboardStat label="Active Users" value={formatAnalyticsCount(current.activeUsers)} /><div className="mt-2 px-1"><Delta current={current.activeUsers} previous={previous.activeUsers} /></div></div>
      <div><DashboardStat label="Sessions" value={formatAnalyticsCount(current.sessions)} /><div className="mt-2 px-1"><Delta current={current.sessions} previous={previous.sessions} /></div></div>
      <div><DashboardStat label="Page Views" value={formatAnalyticsCount(current.screenPageViews)} /><div className="mt-2 px-1"><Delta current={current.screenPageViews} previous={previous.screenPageViews} /></div></div>
      <div><DashboardStat label="New Users" value={formatAnalyticsCount(current.newUsers)} /><div className="mt-2 px-1"><Delta current={current.newUsers} previous={previous.newUsers} /></div></div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
      <DashboardStat label="Engaged Sessions" value={formatAnalyticsCount(current.engagedSessions)} />
      <DashboardStat label="Engagement Rate" value={formatAnalyticsPercent(current.engagementRate)} />
      <DashboardStat label="Bounce Rate" value={formatAnalyticsPercent(current.bounceRate)} />
      <DashboardStat label="Avg. Session Duration" value={formatAnalyticsDuration(current.averageSessionDuration)} />
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
      <DashboardStat label="Engagement Time / User" value={formatAnalyticsDuration(current.userEngagementDuration / Math.max(current.activeUsers, 1))} hint="Average active time per active user" />
      <DashboardStat label="Events / Session" value={current.eventsPerSession.toFixed(1)} />
      <DashboardStat label="Tracked Clicks" value={formatAnalyticsCount(current.clicks)} hint="GA clicks + tracked site actions" />
      <DashboardStat label="User Activity Events" value={formatAnalyticsCount(current.activityEvents)} hint={`${formatAnalyticsCount(current.totalEvents)} total events`} />
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
      <DashboardStat label="Inquiries" value={formatAnalyticsCount(current.leads)} hint={`${formatAnalyticsPercent(conversion)} of sessions`} />
      <DashboardStat label="Quote Opens" value={formatAnalyticsCount(current.quoteOpens)} />
      <DashboardStat label="Quote Completions" value={formatAnalyticsCount(current.quoteCompletes)} />
      <DashboardStat label="Booking Clicks" value={formatAnalyticsCount(current.quoteBookClicks)} hint={`${formatAnalyticsCount(current.inquiryCtaClicks)} inquiry CTA clicks`} />
    </div>
  </>;
}

export function AdminAnalyticsPanel() {
  const [days, setDays] = useState<Range>(28);
  const [tab, setTab] = useState<Tab>("overview");
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      fetchAnalyticsReport(days).then((result) => {
        if (!cancelled) setReport(result);
      }).catch((cause: unknown) => {
        if (!cancelled) {
          const detail = cause instanceof Error ? cause.message : "Unknown error";
          setError(`Could not load GA4 report. ${detail}`);
        }
      }).finally(() => { if (!cancelled) setLoading(false); });
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [days, reloadToken]);

  const tabs = useMemo(() => [
    ["overview", "Overview"], ["acquisition", "Acquisition"], ["content", "Content"], ["events", "Events & funnel"],
  ] as const, []);

  return <div>
    <div className="flex flex-wrap items-start justify-between gap-5"><DashboardPageHeader eyebrow="Admin Workspace" title="Analytics" description="GA4 traffic, engagement, acquisition, and conversion performance." /><label className="label-editorial flex items-center gap-3 text-soft-black">Period<select value={days} onChange={(event) => setDays(Number(event.target.value) as Range)} className={`${dashboardSelectClass} mt-0 w-auto`}><option value={7}>Last 7 days</option><option value={28}>Last 28 days</option><option value={90}>Last 90 days</option></select></label></div>
    {report && <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 border border-taupe/40 bg-ivory-dark px-5 py-3 text-xs text-soft-black-muted"><span>Period: {report.range.startDate} – {report.range.endDate}</span><span>Live active users: <strong className="text-soft-black">{formatAnalyticsCount(report.realtime.activeUsers)}</strong></span><span>Updated: {new Date(report.generatedAt).toLocaleString()}</span><button type="button" onClick={() => setReloadToken((value) => value + 1)} className="ml-auto underline underline-offset-2">Refresh</button></div>}
    <div className="mb-6 flex gap-2 overflow-x-auto border-b border-taupe/40">{tabs.map(([id, label]) => <button key={id} type="button" onClick={() => setTab(id)} className={`label-editorial whitespace-nowrap border-b-2 px-4 py-3 text-[0.625rem] ${tab === id ? "border-soft-black text-soft-black" : "border-transparent text-muted hover:text-soft-black"}`}>{label}</button>)}</div>
    {loading && <p className="mt-8 text-sm text-soft-black-muted">Loading GA4 report…</p>}
    {error && <div className="border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p>{error}</p><p className="mt-2 text-xs">Configure GA_PROPERTY_ID and grant the Cloud Functions service account access to the GA4 property.</p><button className="mt-4 underline" onClick={() => setReloadToken((value) => value + 1)}>Try again</button></div>}
    {report && !loading && <>
      {tab === "overview" && <><Overview report={report} /><div className="mt-8"><TrendChart report={report} /></div>
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Panel title="Live user activity">
          <div className="p-5">
            <p className="font-display text-3xl text-soft-black">{formatAnalyticsCount(report.realtime.activeUsers)}</p>
            <p className="mt-1 text-xs text-soft-black-muted">Active users in the last 30 minutes</p>
            <ul className="mt-4 space-y-2">
              {report.realtime.pages.length === 0 && <li className="text-sm text-soft-black-muted">No one on the site right now.</li>}
              {report.realtime.pages.map((page) => <li key={page.pagePath} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-soft-black-muted">{page.pagePath}</span><span className="shrink-0 text-soft-black">{formatAnalyticsCount(page.activeUsers)}</span></li>)}
            </ul>
          </div>
        </Panel>
        <Panel title="User engagement">
          <dl className="divide-y divide-taupe/25">
            <EngagementRow label="Engagement time per user" value={formatAnalyticsDuration(currentEngagementTime(report))} />
            <EngagementRow label="Avg. session duration" value={formatAnalyticsDuration(report.current.averageSessionDuration)} />
            <EngagementRow label="Engaged sessions" value={`${formatAnalyticsCount(report.current.engagedSessions)} · ${formatAnalyticsPercent(report.current.engagementRate)}`} />
            <EngagementRow label="Bounce rate" value={formatAnalyticsPercent(report.current.bounceRate)} />
            <EngagementRow label="Events per session" value={report.current.eventsPerSession.toFixed(2)} />
            <EngagementRow label="Sessions per user" value={report.current.sessionsPerUser.toFixed(2)} />
            <EngagementRow label="Returning users" value={formatAnalyticsCount(Math.max(report.current.totalUsers - report.current.newUsers, 0))} />
          </dl>
        </Panel>
        <Panel title="Clicks & interactions">
          <DataTable headers={["Event", "Count", "Share"]} empty={!interactionRows(report).length}>
            {interactionRows(report).map((row) => <tr key={row.eventName}><td className="px-5 py-3 font-medium">{analyticsEventLabel(row.eventName)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.eventCount)}</td><td className="px-5 py-3">{formatAnalyticsPercent(report.current.activityEvents ? row.eventCount / report.current.activityEvents : 0)}</td></tr>)}
          </DataTable>
        </Panel>
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2"><Panel title="Top acquisition channels"><DataTable headers={["Channel", "Sessions", "Users", "Engagement", "Leads"]} empty={!report.channels.length}>{report.channels.map((row) => <tr key={row.channel}><td className="px-5 py-3 font-medium">{row.channel}</td><td className="px-5 py-3">{formatAnalyticsCount(row.sessions)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.activeUsers)}</td><td className="px-5 py-3">{formatAnalyticsPercent(row.engagementRate)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.leads)}</td></tr>)}</DataTable></Panel><Panel title="Top pages"><DataTable headers={["Page", "Views", "Users", "Avg. time"]} empty={!report.topPages.length}>{report.topPages.slice(0, 8).map((row) => <tr key={row.pagePath}><td className="max-w-[16rem] truncate px-5 py-3 font-medium">{row.pagePath}</td><td className="px-5 py-3">{formatAnalyticsCount(row.screenPageViews)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.activeUsers)}</td><td className="px-5 py-3">{formatAnalyticsDuration(row.averageSessionDuration)}</td></tr>)}</DataTable></Panel></div></>}
      {tab === "acquisition" && <><div className="grid gap-6 xl:grid-cols-2"><Panel title="Channel performance"><DataTable headers={["Channel", "Sessions", "Users", "Engagement", "Leads"]} empty={!report.channels.length}>{report.channels.map((row) => <tr key={row.channel}><td className="px-5 py-3 font-medium">{row.channel}</td><td className="px-5 py-3">{formatAnalyticsCount(row.sessions)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.activeUsers)}</td><td className="px-5 py-3">{formatAnalyticsPercent(row.engagementRate)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.leads)}</td></tr>)}</DataTable></Panel><Panel title="Source / medium"><DataTable headers={["Source / medium", "Sessions", "Users", "Share"]} empty={!report.sources.length}>{report.sources.map((row) => <tr key={row.sourceMedium}><td className="px-5 py-3 font-medium">{row.sourceMedium}</td><td className="px-5 py-3">{formatAnalyticsCount(row.sessions)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.activeUsers)}</td><td className="px-5 py-3">{formatAnalyticsPercent(report.current.sessions ? row.sessions / report.current.sessions : 0)}</td></tr>)}</DataTable></Panel></div><div className="mt-6 grid gap-6 xl:grid-cols-2"><Panel title="Devices"><DataTable headers={["Device", "Active users", "Sessions", "Session share"]} empty={!report.devices.length}>{report.devices.map((row) => <tr key={row.device}><td className="px-5 py-3 font-medium capitalize">{row.device}</td><td className="px-5 py-3">{formatAnalyticsCount(row.activeUsers)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.sessions)}</td><td className="px-5 py-3">{formatAnalyticsPercent(report.current.sessions ? row.sessions / report.current.sessions : 0)}</td></tr>)}</DataTable></Panel><Panel title="Top countries"><DataTable headers={["Country", "Active users", "Sessions", "Session share"]} empty={!report.countries.length}>{report.countries.map((row) => <tr key={row.country}><td className="px-5 py-3 font-medium">{row.country}</td><td className="px-5 py-3">{formatAnalyticsCount(row.activeUsers)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.sessions)}</td><td className="px-5 py-3">{formatAnalyticsPercent(report.current.sessions ? row.sessions / report.current.sessions : 0)}</td></tr>)}</DataTable></Panel></div></>}
      {tab === "content" && <><div className="grid gap-6 xl:grid-cols-2"><Panel title="Most viewed pages"><DataTable headers={["Page path", "Views", "Active users", "Avg. engagement"]} empty={!report.topPages.length}>{report.topPages.map((row) => <tr key={row.pagePath}><td className="max-w-[18rem] truncate px-5 py-3 font-medium">{row.pagePath}</td><td className="px-5 py-3">{formatAnalyticsCount(row.screenPageViews)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.activeUsers)}</td><td className="px-5 py-3">{formatAnalyticsDuration(row.averageSessionDuration)}</td></tr>)}</DataTable></Panel><Panel title="Landing pages"><DataTable headers={["Landing page", "Sessions", "Users", "Session share"]} empty={!report.landingPages.length}>{report.landingPages.map((row) => <tr key={row.landingPage}><td className="max-w-[18rem] truncate px-5 py-3 font-medium">{row.landingPage}</td><td className="px-5 py-3">{formatAnalyticsCount(row.sessions)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.activeUsers)}</td><td className="px-5 py-3">{formatAnalyticsPercent(report.current.sessions ? row.sessions / report.current.sessions : 0)}</td></tr>)}</DataTable></Panel></div><div className="mt-6"><TrendChart report={report} /></div></>}
      {tab === "events" && <><div className="grid gap-6 xl:grid-cols-2"><Panel title="Key conversion events"><DataTable headers={["Event", "Event count", "Users", "Per-session rate"]} empty={!report.events.length}>{report.events.map((row) => <tr key={row.eventName}><td className="px-5 py-3 font-medium">{analyticsEventLabel(row.eventName)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.eventCount)}</td><td className="px-5 py-3">{formatAnalyticsCount(row.totalUsers)}</td><td className="px-5 py-3">{formatAnalyticsPercent(report.current.sessions ? row.eventCount / report.current.sessions : 0)}</td></tr>)}</DataTable></Panel><Panel title="Lead journey · unique users"><div className="space-y-5 p-5">{report.funnel.map((step, index) => { const max = Math.max(report.funnel[0]?.users ?? 0, 1); const previous = report.funnel[index - 1]?.users; return <div key={step.id}><div className="mb-2 flex justify-between gap-3 text-sm"><span>{index + 1}. {step.label}</span><strong>{formatAnalyticsCount(step.users)}</strong></div><div className="h-2 bg-ivory"><div className="h-full bg-soft-black" style={{ width: `${Math.min(100, (step.users / max) * 100)}%` }} /></div>{previous !== undefined && <p className="mt-1 text-xs text-muted">{formatAnalyticsPercent(previous ? step.users / previous : 0)} continued · {formatAnalyticsCount(step.droppedFromPrevious)} fewer users</p>}</div>; })}<p className="border-t border-taupe/30 pt-4 text-xs leading-relaxed text-muted">Funnel steps use event users within the selected period, not sequential path exploration. Visitors may trigger steps in a different order.</p></div></Panel></div><div className="mt-6"><TrendChart report={report} /></div></>}
    </>}
  </div>;
}
