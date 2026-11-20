import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  Filter,
  Info,
  Package,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import { ANALYTICS_DEMO_NOTICE } from '../data/municipalAnalyticsDemo';
import { MUNICIPAL_ZONE_STATS } from '../data/municipalDemoData';
import { CATEGORY_ORDER, WASTE_CATEGORIES } from '../data/wasteCatalog';
import {
  CivicReport,
  CollectionSchedule,
  WasteBatch,
} from '../types/ecosort';
import { CIVIC_REPORT_TYPE_META } from '../utils/civicReportsStorage';
import {
  AnalyticsRecordSource,
  computeCivicReportAnalytics,
  computeCollectionPerformance,
  computeWasteAnalytics,
  filterAnalyticsDatasets,
} from '../utils/municipalAnalytics';
import { CATEGORY_STYLES, CategoryIcon } from './categoryTheme';

interface MunicipalAnalyticsSectionProps {
  reports: CivicReport[];
  schedules: CollectionSchedule[];
  batches: WasteBatch[];
  isLoading: boolean;
}

type AnalyticsTab = 'all' | 'waste' | 'collection' | 'reports';

export function MunicipalAnalyticsSection({
  reports,
  schedules,
  batches,
  isLoading,
}: MunicipalAnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('all');
  const [areaFilter, setAreaFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<AnalyticsRecordSource>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const availableAreas = useMemo(() => {
    const known = MUNICIPAL_ZONE_STATS.map((z) => z.zoneName);
    const dynamicAreas = new Set<string>();
    reports.forEach((r) => dynamicAreas.add(r.area));
    schedules.forEach((s) => dynamicAreas.add(s.area));
    batches.forEach((b) => dynamicAreas.add(b.sourceArea));
    const extras = Array.from(dynamicAreas)
      .filter((a) => !known.includes(a))
      .sort();
    return [...known, ...extras];
  }, [reports, schedules, batches]);

  const filtered = useMemo(
    () =>
      filterAnalyticsDatasets(reports, schedules, batches, {
        area: areaFilter,
        source: sourceFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    [reports, schedules, batches, areaFilter, sourceFilter, startDate, endDate]
  );

  const wasteMetrics = useMemo(
    () => computeWasteAnalytics(filtered.batches),
    [filtered.batches]
  );
  const collectionMetrics = useMemo(
    () => computeCollectionPerformance(filtered.schedules),
    [filtered.schedules]
  );
  const reportMetrics = useMemo(
    () => computeCivicReportAnalytics(filtered.reports),
    [filtered.reports]
  );

  const hasActiveFilters =
    areaFilter !== 'All' || sourceFilter !== 'all' || Boolean(startDate || endDate);

  const resetFilters = () => {
    setAreaFilter('All');
    setSourceFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const applyDatePreset = (preset: 'all' | 'nov19-20' | 'nov15-20') => {
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'nov19-20') {
      setStartDate('2026-11-19');
      setEndDate('2026-11-20');
    } else {
      setStartDate('2026-11-15');
      setEndDate('2026-11-20');
    }
  };

  const maxAreaKg = useMemo(
    () => Math.max(1, ...wasteMetrics.byArea.map((a) => a.totalKg)),
    [wasteMetrics.byArea]
  );
  const maxDateKg = useMemo(
    () => Math.max(1, ...wasteMetrics.trendsByDate.map((t) => t.totalKg)),
    [wasteMetrics.trendsByDate]
  );
  const maxReportAreaCount = useMemo(
    () => Math.max(1, ...reportMetrics.byArea.map((a) => a.total)),
    [reportMetrics.byArea]
  );

  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center text-sm text-[#525D57]">
        Calculating municipal analytics from stored records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shared Record Disclosure */}
      <div
        role="note"
        className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm"
      >
        <Info className="w-5 h-5 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-semibold text-[#1E2421]">
            {ANALYTICS_DEMO_NOTICE.headline}
          </p>
          <p className="text-xs sm:text-sm text-[#525D57] leading-relaxed">
            {ANALYTICS_DEMO_NOTICE.description}
          </p>
        </div>
      </div>

      {/* Unified Analytics Filter & Module Selector */}
      <section
        aria-label="Analytics filters and section focus"
        className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#DCE3DD]">
          <div
            role="tablist"
            aria-label="Analytics module selector"
            className="inline-flex items-center p-1 rounded-xl bg-[#EBF1EC] border border-[#DCE3DD] overflow-x-auto max-w-full"
          >
            {(
              [
                { id: 'all', label: 'All Modules' },
                { id: 'waste', label: 'Waste Analytics' },
                { id: 'collection', label: 'Collection Performance' },
                { id: 'reports', label: 'Civic Report Analytics' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                    : 'text-[#525D57] hover:text-[#1E2421]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#525D57]">Quick Dates:</span>
            <button
              type="button"
              onClick={() => applyDatePreset('all')}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                !startDate && !endDate
                  ? 'bg-[#E6F2EA] border-[#C5DEC9] text-[#1F4E37] font-semibold'
                  : 'bg-[#F8F7F3] border-[#DCE3DD] text-[#525D57]'
              }`}
            >
              All Dates
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('nov19-20')}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                startDate === '2026-11-19' && endDate === '2026-11-20'
                  ? 'bg-[#E6F2EA] border-[#C5DEC9] text-[#1F4E37] font-semibold'
                  : 'bg-[#F8F7F3] border-[#DCE3DD] text-[#525D57]'
              }`}
            >
              Nov 19–20
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('nov15-20')}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                startDate === '2026-11-15' && endDate === '2026-11-20'
                  ? 'bg-[#E6F2EA] border-[#C5DEC9] text-[#1F4E37] font-semibold'
                  : 'bg-[#F8F7F3] border-[#DCE3DD] text-[#525D57]'
              }`}
            >
              Nov 15–20
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div className="space-y-1">
            <label
              htmlFor="analytics-area-filter"
              className="flex items-center gap-1.5 text-xs font-medium text-[#525D57]"
            >
              <Filter className="w-3.5 h-3.5 text-[#1F4E37]" aria-hidden="true" />
              <span>Area / Ward</span>
            </label>
            <select
              id="analytics-area-filter"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-xs sm:text-sm font-medium text-[#1E2421] focus:border-[#1F4E37] focus:outline-none"
            >
              <option value="All">All Areas ({availableAreas.length})</option>
              {availableAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="analytics-source-filter"
              className="block text-xs font-medium text-[#525D57]"
            >
              Record Source
            </label>
            <select
              id="analytics-source-filter"
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value as AnalyticsRecordSource)
              }
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-xs sm:text-sm font-medium text-[#1E2421] focus:border-[#1F4E37] focus:outline-none"
            >
              <option value="all">All Records (Demo + User)</option>
              <option value="demo">Demo Records Only</option>
              <option value="user">User-Created Only</option>
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="analytics-start-date"
              className="block text-xs font-medium text-[#525D57]"
            >
              From Date
            </label>
            <input
              id="analytics-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-xs sm:text-sm font-mono text-[#1E2421] focus:border-[#1F4E37] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="analytics-end-date"
              className="block text-xs font-medium text-[#525D57]"
            >
              To Date
            </label>
            <input
              id="analytics-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-xs sm:text-sm font-mono text-[#1E2421] focus:border-[#1F4E37] focus:outline-none"
            />
          </div>

          <div>
            <button
              type="button"
              disabled={!hasActiveFilters}
              onClick={resetFilters}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#DCE3DD] bg-[#F8F7F3] hover:bg-[#EBF1EC] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-[#1E2421] inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* MODULE 2: WASTE ANALYTICS                                           */}
      {/* =================================================================== */}
      {(activeTab === 'all' || activeTab === 'waste') && (
        <section
          aria-labelledby="waste-analytics-heading"
          className="space-y-5 pt-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
                <Package className="w-4 h-4 text-[#1F4E37]" aria-hidden="true" />
                <span>Derived from Waste Batch Records</span>
              </div>
              <h2
                id="waste-analytics-heading"
                className="font-display text-xl font-bold text-[#1E2421]"
              >
                Waste Volume &amp; Stream Analytics
              </h2>
            </div>
            <span className="font-mono tabular-nums text-xs text-[#525D57]">
              {wasteMetrics.totalBatches} matching batches
            </span>
          </div>

          {wasteMetrics.totalBatches === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center space-y-2 shadow-sm">
              <p className="font-display text-base font-bold text-[#1E2421]">
                No waste batches match the active filters
              </p>
              <p className="text-xs sm:text-sm text-[#525D57]">
                {sourceFilter === 'user'
                  ? 'Register a new waste batch in Waste Batch Tracking to inspect user-created volumes here.'
                  : 'Adjust the area or date range filters to view batch metrics.'}
              </p>
            </div>
          ) : (
            <>
              {/* Waste KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">
                    Total Tracked Volume
                  </p>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-[#1E2421] font-mono tabular-nums">
                    {wasteMetrics.totalEstimatedKg.toLocaleString()} kg
                  </p>
                  <p className="text-xs text-[#525D57] font-mono tabular-nums">
                    {wasteMetrics.demoKg.toLocaleString()} kg demo ·{' '}
                    {wasteMetrics.userKg.toLocaleString()} kg user
                  </p>
                </div>

                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">
                    Total Collected (Field+)
                  </p>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-[#1F4E37] font-mono tabular-nums">
                    {wasteMetrics.collectedOrBeyondKg.toLocaleString()} kg
                  </p>
                  <p className="text-xs text-[#525D57]">
                    Collected, In Transit, Facility, or Processed
                  </p>
                </div>

                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">
                    Completed Processing
                  </p>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-[#1F4E37] font-mono tabular-nums">
                    {wasteMetrics.processedKg.toLocaleString()} kg
                  </p>
                  <p className="text-xs text-[#525D57]">
                    Reached final Processed stage
                  </p>
                </div>

                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">
                    Tracked Batches
                  </p>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-[#1E2421] font-mono tabular-nums">
                    {wasteMetrics.totalBatches}
                  </p>
                  <p className="text-xs text-[#525D57]">
                    Across {wasteMetrics.byArea.length} active area(s)
                  </p>
                </div>
              </div>

              {/* Category Distribution + Processing Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Waste distribution by category */}
                <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#1E2421]">
                      Waste Distribution by Category
                    </h3>
                    <p className="text-xs text-[#525D57]">
                      Kilogram share across Wet, Dry, E-waste, and Hazardous streams
                    </p>
                  </div>

                  {/* Proportional Stacked Bar */}
                  <div
                    className="h-4 w-full rounded-full overflow-hidden flex bg-[#EBF1EC]"
                    role="img"
                    aria-label="Waste category distribution stacked bar"
                  >
                    {wasteMetrics.byCategory.map((item) =>
                      item.totalKg > 0 ? (
                        <div
                          key={item.category}
                          style={{
                            width: `${Math.max(item.sharePct, 2)}%`,
                            backgroundColor: CATEGORY_STYLES[item.category].barColor,
                          }}
                          title={`${WASTE_CATEGORIES[item.category].shortName}: ${item.totalKg} kg (${item.sharePct}%)`}
                        />
                      ) : null
                    )}
                  </div>

                  <div className="space-y-3 pt-1">
                    {wasteMetrics.byCategory.map((item) => {
                      const style = CATEGORY_STYLES[item.category];
                      return (
                        <div
                          key={item.category}
                          className="flex items-center justify-between gap-3 text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-8 h-8 rounded-lg ${style.surfaceBg} ${style.accentText} flex items-center justify-center shrink-0`}
                            >
                              <CategoryIcon
                                category={item.category}
                                className="w-4 h-4"
                              />
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#1E2421]">
                                {WASTE_CATEGORIES[item.category].shortName}
                              </p>
                              <p className="text-xs text-[#525D57] font-mono tabular-nums">
                                {item.batchCount} batch(es)
                              </p>
                            </div>
                          </div>
                          <div className="text-right font-mono tabular-nums shrink-0">
                            <p className="font-semibold text-[#1E2421]">
                              {item.totalKg.toLocaleString()} kg
                            </p>
                            <p className="text-xs text-[#525D57]">{item.sharePct}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Waste processing status distribution */}
                <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#1E2421]">
                      Processing Status Distribution
                    </h3>
                    <p className="text-xs text-[#525D57]">
                      Batch count and tonnage across the 5 facility pipeline stages
                    </p>
                  </div>

                  <div className="space-y-3">
                    {wasteMetrics.byStatus.map((stage) => (
                      <div key={stage.status} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#1E2421]">
                            {stage.status}
                          </span>
                          <span className="font-mono tabular-nums text-[#525D57]">
                            {stage.batchCount} batches ·{' '}
                            <strong className="text-[#1E2421]">
                              {stage.totalKg.toLocaleString()} kg
                            </strong>{' '}
                            ({stage.sharePct}%)
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-[#EBF1EC] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#1F4E37] transition-all"
                            style={{
                              width: `${Math.max(
                                stage.sharePct,
                                stage.batchCount > 0 ? 4 : 0
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Area-wise Waste Collection Comparison + 5. Collection Trends Over Time */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#1E2421]">
                      Area-wise Waste Collection Comparison
                    </h3>
                    <p className="text-xs text-[#525D57]">
                      Stacked stream tonnage (kg) by source area
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {wasteMetrics.byArea.map((areaRow) => {
                      const barScalePct = Math.round(
                        (areaRow.totalKg / maxAreaKg) * 100
                      );
                      return (
                        <div key={areaRow.area} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-semibold text-[#1E2421]">
                              {areaRow.area}
                            </span>
                            <span className="font-mono tabular-nums text-[#525D57]">
                              <strong className="text-[#1E2421]">
                                {areaRow.totalKg.toLocaleString()} kg
                              </strong>{' '}
                              · {areaRow.batchCount} batch(es)
                            </span>
                          </div>
                          <div
                            className="h-3.5 rounded-full bg-[#EBF1EC] overflow-hidden flex"
                            title={`${areaRow.area}: ${areaRow.totalKg} kg`}
                          >
                            <div
                              className="h-full flex overflow-hidden rounded-full"
                              style={{ width: `${Math.max(barScalePct, 3)}%` }}
                            >
                              {CATEGORY_ORDER.map((cat) => {
                                const catKg = areaRow.byCategoryKg[cat];
                                if (catKg <= 0 || areaRow.totalKg <= 0) return null;
                                const innerPct = (catKg / areaRow.totalKg) * 100;
                                return (
                                  <div
                                    key={cat}
                                    style={{
                                      width: `${innerPct}%`,
                                      backgroundColor: CATEGORY_STYLES[cat].barColor,
                                    }}
                                    title={`${WASTE_CATEGORIES[cat].shortName}: ${catKg} kg`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#DCE3DD] text-xs text-[#525D57]">
                    {CATEGORY_ORDER.map((cat) => (
                      <span key={cat} className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-sm inline-block"
                          style={{ backgroundColor: CATEGORY_STYLES[cat].barColor }}
                        />
                        <span>{WASTE_CATEGORIES[cat].shortName}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 5. Collection trends over time */}
                <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-[#1E2421]">
                        Collection Trends Over Time
                      </h3>
                      <p className="text-xs text-[#525D57]">
                        Chronological batch volume (kg) by collection date
                      </p>
                    </div>
                    <TrendingUp
                      className="w-4 h-4 text-[#1F4E37] shrink-0 mt-1"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="space-y-3">
                    {wasteMetrics.trendsByDate.map((pt) => {
                      const pct = Math.round((pt.totalKg / maxDateKg) * 100);
                      return (
                        <div key={pt.date} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono tabular-nums font-semibold text-[#1E2421]">
                              {pt.date}
                            </span>
                            <span className="font-mono tabular-nums text-[#525D57]">
                              {pt.batchCount} batch(es) ·{' '}
                              <strong className="text-[#1F4E37]">
                                {pt.totalKg.toLocaleString()} kg
                              </strong>
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-[#EBF1EC] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#6F8F78] transition-all"
                              style={{ width: `${Math.max(pct, 6)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* MODULE 3: COLLECTION PERFORMANCE                                    */}
      {/* =================================================================== */}
      {(activeTab === 'all' || activeTab === 'collection') && (
        <section
          aria-labelledby="collection-performance-heading"
          className="space-y-5 pt-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
                <CalendarCheck
                  className="w-4 h-4 text-[#1F4E37]"
                  aria-hidden="true"
                />
                <span>Derived from Collection Planner Schedules</span>
              </div>
              <h2
                id="collection-performance-heading"
                className="font-display text-xl font-bold text-[#1E2421]"
              >
                Collection Performance
              </h2>
            </div>
            <span className="font-mono tabular-nums text-xs text-[#525D57]">
              {collectionMetrics.demoCount} demo · {collectionMetrics.userCount} user
            </span>
          </div>

          {collectionMetrics.totalScheduled === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center space-y-2 shadow-sm">
              <p className="font-display text-base font-bold text-[#1E2421]">
                No collection schedules match the active filters
              </p>
              <p className="text-xs sm:text-sm text-[#525D57]">
                Create a schedule in Collection Planner or adjust filters to calculate
                completion performance.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">
                    Total Scheduled
                  </p>
                  <p className="font-display text-2xl font-bold text-[#1E2421] font-mono tabular-nums">
                    {collectionMetrics.totalScheduled}
                  </p>
                </div>
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">Completed</p>
                  <p className="font-display text-2xl font-bold text-[#1F4E37] font-mono tabular-nums">
                    {collectionMetrics.completedCount}
                  </p>
                </div>
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">Pending</p>
                  <p className="font-display text-2xl font-bold text-[#1E2421] font-mono tabular-nums">
                    {collectionMetrics.pendingCount}
                  </p>
                  <p className="text-[11px] text-[#525D57]">Scheduled / Assigned</p>
                </div>
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">Cancelled</p>
                  <p className="font-display text-2xl font-bold text-[#8C3F19] font-mono tabular-nums">
                    {collectionMetrics.cancelledCount}
                  </p>
                </div>
                <div className="col-span-2 lg:col-span-1 bg-[#E6F2EA] border border-[#C5DEC9] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-xs font-semibold text-[#395543]">
                    Completion Rate
                  </p>
                  <p className="font-display text-2xl font-bold text-[#1F4E37] font-mono tabular-nums">
                    {collectionMetrics.completionRatePct}%
                  </p>
                  <p className="text-[11px] text-[#395543]">Excludes cancelled</p>
                </div>
              </div>

              {/* Area-wise Collection Performance */}
              <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#1E2421]">
                    Area-wise Collection Performance
                  </h3>
                  <p className="text-xs text-[#525D57]">
                    Completed vs pending schedules and completion percentage by ward
                  </p>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#DCE3DD] text-xs font-semibold text-[#525D57]">
                        <th className="py-2.5 pr-4">Area</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3 text-right">Completed</th>
                        <th className="py-2.5 px-3 text-right">Pending</th>
                        <th className="py-2.5 px-3 text-right">Cancelled</th>
                        <th className="py-2.5 pl-4 text-right">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCE3DD] text-sm">
                      {collectionMetrics.byArea.map((row) => (
                        <tr key={row.area} className="hover:bg-[#F8F7F3]">
                          <td className="py-3 pr-4 font-semibold text-[#1E2421]">
                            {row.area}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums">
                            {row.total}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-[#1F4E37]">
                            {row.completed}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums">
                            {row.pending}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-[#8C3F19]">
                            {row.cancelled}
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <div className="inline-flex items-center gap-2.5">
                              <div className="w-24 h-2 rounded-full bg-[#EBF1EC] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#1F4E37]"
                                  style={{ width: `${row.completionRatePct}%` }}
                                />
                              </div>
                              <span className="font-mono tabular-nums text-xs font-semibold text-[#1F4E37] w-12 text-right">
                                {row.completionRatePct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-2.5">
                  {collectionMetrics.byArea.map((row) => (
                    <div
                      key={row.area}
                      className="rounded-xl border border-[#DCE3DD] bg-[#F8F7F3] p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-[#1E2421]">
                          {row.area}
                        </span>
                        <span className="font-mono tabular-nums text-xs font-semibold text-[#1F4E37]">
                          {row.completionRatePct}% complete
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#EBF1EC] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1F4E37]"
                          style={{ width: `${row.completionRatePct}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#525D57] font-mono tabular-nums">
                        {row.total} total · {row.completed} completed · {row.pending}{' '}
                        pending · {row.cancelled} cancelled
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* MODULE 4: CIVIC REPORT ANALYTICS                                    */}
      {/* =================================================================== */}
      {(activeTab === 'all' || activeTab === 'reports') && (
        <section
          aria-labelledby="civic-report-analytics-heading"
          className="space-y-5 pt-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
                <ClipboardCheck
                  className="w-4 h-4 text-[#1F4E37]"
                  aria-hidden="true"
                />
                <span>Derived from Shared Civic Reports Data</span>
              </div>
              <h2
                id="civic-report-analytics-heading"
                className="font-display text-xl font-bold text-[#1E2421]"
              >
                Civic Report Analytics
              </h2>
            </div>
            <span className="font-mono tabular-nums text-xs text-[#525D57]">
              {reportMetrics.demoCount} demo · {reportMetrics.userCount} user-created
            </span>
          </div>

          {reportMetrics.totalReports === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center space-y-2 shadow-sm">
              <p className="font-display text-base font-bold text-[#1E2421]">
                No civic reports match the active filters
              </p>
              <p className="text-xs sm:text-sm text-[#525D57]">
                Submit a report in the Citizen Portal or adjust the filter controls above.
              </p>
            </div>
          ) : (
            <>
              {/* 5 Status KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">
                    Total Submitted
                  </p>
                  <p className="font-display text-2xl font-bold text-[#1E2421] font-mono tabular-nums">
                    {reportMetrics.totalReports}
                  </p>
                  <p className="text-[11px] text-[#525D57] font-mono tabular-nums">
                    {reportMetrics.resolutionRatePct}% resolved
                  </p>
                </div>
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">
                    Pending (Submitted)
                  </p>
                  <p className="font-display text-2xl font-bold text-[#395543] font-mono tabular-nums">
                    {reportMetrics.pendingSubmittedCount}
                  </p>
                </div>
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">Under Review</p>
                  <p className="font-display text-2xl font-bold text-[#6A4C1E] font-mono tabular-nums">
                    {reportMetrics.underReviewCount}
                  </p>
                </div>
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-[#525D57]">In Progress</p>
                  <p className="font-display text-2xl font-bold text-[#8C3F19] font-mono tabular-nums">
                    {reportMetrics.inProgressCount}
                  </p>
                </div>
                <div className="col-span-2 lg:col-span-1 bg-[#E6F2EA] border border-[#C5DEC9] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-xs font-semibold text-[#395543]">Resolved</p>
                  <p className="font-display text-2xl font-bold text-[#1F4E37] font-mono tabular-nums">
                    {reportMetrics.resolvedCount}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Report Distribution by Category */}
                <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-[#1E2421]">
                        Report Distribution by Category
                      </h3>
                      <p className="text-xs text-[#525D57]">
                        Share of complaints across the 5 civic report types
                      </p>
                    </div>
                    <BarChart3
                      className="w-4 h-4 text-[#1F4E37] shrink-0 mt-1"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="space-y-3">
                    {reportMetrics.byCategory.map((cat) => {
                      const isHighRisk =
                        cat.reportType === 'hazardous_waste' ||
                        cat.reportType === 'illegal_dumping';
                      return (
                        <div key={cat.reportType} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#1E2421]">
                              {CIVIC_REPORT_TYPE_META[cat.reportType].label}
                            </span>
                            <span className="font-mono tabular-nums text-[#525D57]">
                              {cat.count} report(s) ({cat.sharePct}%)
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full bg-[#EBF1EC] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.max(
                                  cat.sharePct,
                                  cat.count > 0 ? 5 : 0
                                )}%`,
                                backgroundColor: isHighRisk ? '#B55B2D' : '#1F4E37',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Area-wise Complaint Comparison */}
                <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#1E2421]">
                      Area-wise Complaint Comparison
                    </h3>
                    <p className="text-xs text-[#525D57]">
                      Open vs resolved complaints across reporting wards
                    </p>
                  </div>

                  <div className="space-y-3">
                    {reportMetrics.byArea.map((areaItem) => {
                      const scalePct = Math.round(
                        (areaItem.total / maxReportAreaCount) * 100
                      );
                      const openInnerPct =
                        areaItem.total > 0
                          ? (areaItem.openCount / areaItem.total) * 100
                          : 0;
                      const resolvedInnerPct =
                        areaItem.total > 0
                          ? (areaItem.resolvedCount / areaItem.total) * 100
                          : 0;
                      return (
                        <div key={areaItem.area} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#1E2421]">
                              {areaItem.area}
                            </span>
                            <span className="font-mono tabular-nums text-[#525D57]">
                              <span className="text-[#8C3F19] font-semibold">
                                {areaItem.openCount} open
                              </span>{' '}
                              ·{' '}
                              <span className="text-[#1F4E37] font-semibold">
                                {areaItem.resolvedCount} resolved
                              </span>
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-[#EBF1EC] overflow-hidden">
                            <div
                              className="h-full flex rounded-full overflow-hidden"
                              style={{ width: `${Math.max(scalePct, 6)}%` }}
                            >
                              {areaItem.openCount > 0 && (
                                <div
                                  style={{
                                    width: `${openInnerPct}%`,
                                    backgroundColor: '#B55B2D',
                                  }}
                                  title={`Open: ${areaItem.openCount}`}
                                />
                              )}
                              {areaItem.resolvedCount > 0 && (
                                <div
                                  style={{
                                    width: `${resolvedInnerPct}%`,
                                    backgroundColor: '#1F4E37',
                                  }}
                                  title={`Resolved: ${areaItem.resolvedCount}`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-[#DCE3DD] text-xs text-[#525D57]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#B55B2D] inline-block" />
                      <span>Open / Active</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#1F4E37] inline-block" />
                      <span>Resolved</span>
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
