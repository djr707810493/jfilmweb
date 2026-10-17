"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DashboardPageHeader,
  dashboardInputClass,
} from "@/components/dashboard/dashboard-layout";
import {
  createDefaultQuoteConfig,
  getQuoteConfig,
  saveQuoteConfig,
} from "@/lib/firebase/quote";
import { formatUSD } from "@/components/quote/quote-config";
import type { QuoteConfig } from "@/types/quote";

const HOUR_PRESETS = [2, 4, 5, 8];

export function AdminQuotePanel() {
  const [config, setConfig] = useState<QuoteConfig>(createDefaultQuoteConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setConfig(await getQuoteConfig());
    } catch {
      setError("Could not load quote rates. Check admin access and Firestore rules.");
      setConfig(createDefaultQuoteConfig());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      await saveQuoteConfig(config);
      setStatus("Rates saved. The instant quote tool uses them immediately.");
    } catch {
      setError("Could not save quote rates.");
    } finally {
      setSaving(false);
    }
  }

  function updateCategory(id: string, patch: Partial<QuoteConfig["categories"][number]>) {
    setConfig((current) => ({
      ...current,
      categories: current.categories.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    }));
  }

  function updateAddOn(id: string, patch: Partial<QuoteConfig["addOns"][number]>) {
    setConfig((current) => ({
      ...current,
      addOns: current.addOns.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  }

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Quote"
        title="Rates & Packages"
        description="These numbers drive the instant quote tool on the homepage. Changes go live as soon as you save."
      />

      {loading ? (
        <p className="text-sm text-soft-black-muted">Loading rates…</p>
      ) : (
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="label-editorial text-soft-black">Hourly minimum</h2>
            <p className="text-xs leading-relaxed text-soft-black-muted">
              Hard floor. Budgets below this (per booked hour) get a &ldquo;we can&apos;t serve
              this&rdquo; message instead of a package.
            </p>
            <label className="block max-w-xs text-sm text-soft-black">
              <span className="label-editorial text-soft-black">Minimum $ / hour</span>
              <input
                type="number"
                min={0}
                value={config.minHourlyRate}
                onChange={(e) =>
                  setConfig((current) => ({
                    ...current,
                    minHourlyRate: Number(e.target.value) || 0,
                  }))
                }
                className={dashboardInputClass}
              />
            </label>
          </section>

          <section className="space-y-4 border-t border-taupe/30 pt-10">
            <h2 className="label-editorial text-soft-black">Service rates</h2>
            <p className="text-xs leading-relaxed text-soft-black-muted">
              Hourly rate for each offering. Clients see the label and description, never the rate.
            </p>

            <div className="space-y-4">
              {config.categories.map((row) => {
                const example = HOUR_PRESETS.map(
                  (h) => `${h}h ${formatUSD(row.hourlyRate * h)}`,
                ).join(" · ");
                return (
                  <div key={row.id} className="border border-taupe/40 bg-ivory-dark p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm text-soft-black">
                        <span className="label-editorial text-soft-black">Label</span>
                        <input
                          value={row.label}
                          onChange={(e) => updateCategory(row.id, { label: e.target.value })}
                          className={dashboardInputClass}
                        />
                      </label>
                      <label className="block text-sm text-soft-black">
                        <span className="label-editorial text-soft-black">Rate $ / hour</span>
                        <input
                          type="number"
                          min={0}
                          value={row.hourlyRate}
                          onChange={(e) =>
                            updateCategory(row.id, {
                              hourlyRate: Number(e.target.value) || 0,
                            })
                          }
                          className={dashboardInputClass}
                        />
                      </label>
                    </div>
                    <label className="mt-4 block text-sm text-soft-black">
                      <span className="label-editorial text-soft-black">Description</span>
                      <input
                        value={row.blurb}
                        onChange={(e) => updateCategory(row.id, { blurb: e.target.value })}
                        className={dashboardInputClass}
                      />
                    </label>
                    <p className="mt-3 text-xs text-soft-black-muted">{example}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4 border-t border-taupe/30 pt-10">
            <h2 className="label-editorial text-soft-black">Add-ons</h2>
            <p className="text-xs leading-relaxed text-soft-black-muted">
              Flat prices shown in the quote tool. Set a price to 0 to include it for free.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {config.addOns.map((row) => (
                <div key={row.id} className="border border-taupe/40 bg-ivory-dark p-4">
                  <label className="block text-sm text-soft-black">
                    <span className="label-editorial text-soft-black">Label</span>
                    <input
                      value={row.label}
                      onChange={(e) => updateAddOn(row.id, { label: e.target.value })}
                      className={dashboardInputClass}
                    />
                  </label>
                  <label className="mt-3 block text-sm text-soft-black">
                    <span className="label-editorial text-soft-black">Flat price</span>
                    <input
                      type="number"
                      min={0}
                      value={row.flatPrice}
                      onChange={(e) =>
                        updateAddOn(row.id, { flatPrice: Number(e.target.value) || 0 })
                      }
                      className={dashboardInputClass}
                    />
                  </label>
                  <label className="mt-3 block text-sm text-soft-black">
                    <span className="label-editorial text-soft-black">Description</span>
                    <input
                      value={row.blurb}
                      onChange={(e) => updateAddOn(row.id, { blurb: e.target.value })}
                      className={dashboardInputClass}
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3 border-t border-taupe/30 pt-8">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="label-editorial min-h-[3rem] border border-soft-black bg-soft-black px-6 py-3 text-ivory disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save rates"}
            </button>
            <button
              type="button"
              onClick={() => load()}
              disabled={saving}
              className="label-editorial min-h-[3rem] border border-taupe/40 px-4 py-3 text-soft-black-muted disabled:opacity-40"
            >
              Reload
            </button>
          </div>

          {status && <p className="text-sm text-soft-black-muted">{status}</p>}
          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
