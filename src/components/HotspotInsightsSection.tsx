import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Flame,
  History,
  Info,
  Map as MapIcon,
  Repeat,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { HOTSPOT_DEMO_NOTICE } from '../data/municipalAnalyticsDemo';
import { MUNICIPAL_ZONE_STATS } from '../data/municipalDemoData';
import { CivicReport, CivicReportType } from '../types/ecosort';
import { CIVIC_REPORT_TYPE_META } from '../utils/civicReportsStorage';
import {
  AnalyticsRecordSource,
  AreaHotspotSummary,
  HotspotAttentionTier,
  computeHotspotInsights,
  filterAnalyticsDatasets,
} from '../utils/municipalAnalytics';
import { REPORT_TYPE_ICONS } from './civicReportTheme';

interface HotspotInsightsSectionProps {
  reports: CivicReport[];
  isLoading: boolean;
  onOpenReportsForArea?: (area: string) => void;
}

const REPORT_TYPE_LIST: CivicReportType[] = [
  'overflowing_bin',
  'illegal_dumping',
  'missed_collection',
  'hazardous_waste',
  'other',
];

function getTierVisuals(tier: HotspotAttentionTier): {
  icon: React.ComponentType<{ className?: string }>;
  containerClass: string;
  labelClass: string;
  barColor: string;
} {
  if (tier === 'High Attention') {
    return {
      icon: Flame,
      containerClass: 'bg-[#FBF3EB] border-[#EAD3BE]',
      labelClass: 'text-[#8C3F19]',
      barColor: '#B55B2D',
    };
  }
  if (tier === 'Elevated') {
    return {
      icon: AlertTriangle,
      containerClass: 'bg-[#F9F3E8] border-[#E6D6BC]',
      labelClass: 'text-[#6A4C1E]',
      barColor: '#9A6B2F',
    };
  }
  return {
    icon: CheckCircle2,
    containerClass: 'bg-[#E6F2EA] border-[#C5DEC9]',
    labelClass: 'text-[#1F4E37]',
    barColor: '#1F4E37',
  };
}

export function HotspotInsightsSection({
  reports,
  isLoading,
  onOpenReportsForArea,
}: HotspotInsightsSectionProps) {
  const [areaFilter, setAreaFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<AnalyticsRecordSource>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [inspectedArea, setInspectedArea] = useState<string | null>(null);

  const availableAreas = useMemo(() => {
    const known = MUNICIPAL_ZONE_STATS.map((z) => z.zoneName);
    const extra = Array.from(
      new Set(reports.map((r) => r.area).filter((a) => !known.includes(a)))
    ).sort();
    return [...known, ...extra];
  }, [reports]);

  const filteredData = useMemo(
    () =>
      filterAnalyticsDatasets(reports, [], [], {
        area: areaFilter,
        source: sourceFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    [reports, areaFilter, sourceFilter, startDate, endDate]
  );

  const insights = useMemo(
    () => computeHotspotInsights(filteredData.reports, areaFilter),
    [filteredData.reports, areaFilter]
  );

  const activeSelectedArea: AreaHotspotSummary | null = useMemo(() => {
    if (insights.rankedAreas.length === 0) return null;
    if (inspectedArea) {
      const found = insights.rankedAreas.find((a) => a.area === inspectedArea);
      if (found) return found;
    }
    return insights.rankedAreas[0];
  }, [insights.rankedAreas, inspectedArea]);

  const totalOpenComplaints = useMemo(
    () => filteredData.reports.filter((r) => r.status !== 'Resolved').length,
    [filteredData.reports]
  );

  const totalDemoCount = useMemo(
    () => filteredData.reports.filter((r) => r.isDemoRecord).length,
    [filteredData.reports]
  );
  const totalUserCount = filteredData.reports.length - totalDemoCount;

  const hasActiveFilters =
    areaFilter !== 'All' || sourceFilter !== 'all' || Boolean(startDate || endDate);

  const resetFilters = () => {
    setAreaFilter('All');
    setSourceFilter('all');
    setStartDate('');
    setEndDate('');
    setInspectedArea(null);
  };

  const maxHistoricalCount = useMemo(() => {
    const values = insights.historicalSeries.map((pt) =>
      areaFilter === 'All' ? pt.totalCount : pt.selectedAreaCount
    );
    return Math.max(1, ...values);
  }, [insights.historicalSeries, areaFilter]);

  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center text-sm text-[#525D57]">
        Loading shared civic reports for hotspot analysis...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Explicit Demonstration & Non-AI Disclosure */}
      <div
        role="note"
        className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm"
      >
        <Info className="w-5 h-5 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-semibold text-[#1E2421]">
            {HOTSPOT_DEMO_NOTICE.headline}
          </p>
          <p className="text-xs sm:text-sm text-[#525D57] leading-relaxed">
            {HOTSPOT_DEMO_NOTICE.description}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <section
        aria-label="Hotspot insights filters"
        className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E2421]">
            <Filter className="w-4 h-4 text-[#1F4E37]" aria-hidden="true" />
            <span>Filter Hotspot Scope</span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F4E37] hover:underline underline-offset-4 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label
              htmlFor="hotspot-area-filter"
              className="block text-xs font-medium text-[#525D57]"
            >
              Area / Ward
            </label>
            <select
              id="hotspot-area-filter"
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setInspectedArea(e.target.value === 'All' ? null : e.target.value);
              }}
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
              htmlFor="hotspot-source-filter"
              className="block text-xs font-medium text-[#525D57]"
            >
              Record Source
            </label>
            <select
              id="hotspot-source-filter"
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value as AnalyticsRecordSource)
              }
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-xs sm:text-sm font-medium text-[#1E2421] focus:border-[#1F4E37] focus:outline-none"
            >
              <option value="all">All Records (Demo + User)</option>
              <option value="demo">Demonstration Records Only</option>
              <option value="user">User Submissions Only</option>
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="hotspot-start-date"
              className="block text-xs font-medium text-[#525D57]"
            >
              From Date
            </label>
            <input
              id="hotspot-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-xs sm:text-sm font-mono text-[#1E2421] focus:border-[#1F4E37] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="hotspot-end-date"
              className="block text-xs font-medium text-[#525D57]"
            >
              To Date
            </label>
            <input
              id="hotspot-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-xs sm:text-sm font-mono text-[#1E2421] focus:border-[#1F4E37] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-1.5">
          <p className="text-xs font-medium text-[#525D57]">
            Complaints in Scope
          </p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-[#1E2421] font-mono tabular-nums">
            {insights.totalComplaints}
          </p>
          <p className="text-xs text-[#525D57] font-mono tabular-nums">
            {totalDemoCount} demo · {totalUserCount} user-created
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-1.5">
          <p className="text-xs font-medium text-[#525D57]">
            High-Attention Areas
          </p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-[#8C3F19] font-mono tabular-nums">
            {insights.highAttentionAreasCount}
          </p>
          <p className="text-xs text-[#525D57]">
            Open issues or high-risk categories
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-1.5">
          <p className="text-xs font-medium text-[#525D57]">
            Recurring Pattern Areas
          </p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-[#1F4E37] font-mono tabular-nums">
            {insights.recurringAreasCount}
          </p>
          <p className="text-xs text-[#525D57]">
            Repeat active or 4-week demo baseline
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-1.5">
          <p className="text-xs font-medium text-[#525D57]">
            Active Unresolved Queue
          </p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-[#1E2421] font-mono tabular-nums">
            {totalOpenComplaints}
          </p>
          <p className="text-xs text-[#525D57]">
            Submitted, Under Review, or In Progress
          </p>
        </div>
      </section>

      {filteredData.reports.length === 0 ? (
        <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center space-y-3 shadow-sm">
          <p className="font-display text-base font-bold text-[#1E2421]">
            No civic complaints match the selected hotspot filters
          </p>
          <p className="text-xs sm:text-sm text-[#525D57] max-w-lg mx-auto">
            {sourceFilter === 'user'
              ? 'No user-submitted complaints are saved in this browser yet for this filter scope. Submit a Civic Report in the Citizen Portal or switch back to All Records.'
              : 'Try broadening the date range or resetting the area and source filters.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#E6F2EA] hover:bg-[#D7EBDD] text-[#1F4E37] text-xs font-semibold transition-colors"
            >
              Reset Hotspot Filters
            </button>
          )}
        </section>
      ) : (
        <>
          {/* Area-Based Visual District Map Grid + Selected Ward Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Ward Grid (Area-based layout, no invented GPS coordinates) */}
            <section className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
                    <MapIcon className="w-4 h-4 text-[#1F4E37]" aria-hidden="true" />
                    <span>Schematic Ward Grid · No Live GPS Coordinates</span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#1E2421] mt-0.5">
                    Area-wise Hotspot Density Map
                  </h2>
                </div>
                <span className="text-xs text-[#525D57]">
                  Select any ward tile to inspect categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insights.rankedAreas.map((summary, idx) => {
                  const visuals = getTierVisuals(summary.attentionTier);
                  const TierIcon = visuals.icon;
                  const isSelected = activeSelectedArea?.area === summary.area;
                  return (
                    <button
                      key={summary.area}
                      type="button"
                      onClick={() => setInspectedArea(summary.area)}
                      className={`text-left rounded-xl p-4 border transition-all space-y-3 ${
                        isSelected
                          ? 'ring-2 ring-[#1F4E37] border-[#1F4E37] bg-[#F8F7F3]'
                          : 'border-[#DCE3DD] bg-[#FFFFFF] hover:bg-[#F8F7F3]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-[#525D57]">
                            Rank #{idx + 1} · {summary.zoneCode}
                          </p>
                          <p className="font-display text-sm sm:text-base font-bold text-[#1E2421] truncate">
                            {summary.area}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 ${visuals.containerClass} ${visuals.labelClass}`}
                        >
                          <TierIcon className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{summary.attentionTier}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-[#F8F7F3] border border-[#DCE3DD]/70 p-2">
                          <p className="text-[11px] text-[#525D57]">Reports</p>
                          <p className="font-mono tabular-nums text-sm font-bold text-[#1E2421]">
                            {summary.totalComplaints}
                          </p>
                        </div>
                        <div className="rounded-lg bg-[#F8F7F3] border border-[#DCE3DD]/70 p-2">
                          <p className="text-[11px] text-[#525D57]">Open</p>
                          <p className="font-mono tabular-nums text-sm font-bold text-[#8C3F19]">
                            {summary.openComplaints}
                          </p>
                        </div>
                        <div className="rounded-lg bg-[#F8F7F3] border border-[#DCE3DD]/70 p-2">
                          <p className="text-[11px] text-[#525D57]">4w Demo</p>
                          <p className="font-mono tabular-nums text-sm font-bold text-[#395543]">
                            {summary.historicalDemoTotal}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#525D57]">
                        <span className="truncate">
                          Top:{' '}
                          <strong className="text-[#1E2421]">
                            {summary.topCategory
                              ? CIVIC_REPORT_TYPE_META[summary.topCategory].shortLabel
                              : 'None'}
                          </strong>
                        </span>
                        {summary.isRecurring && (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#8C3F19]">
                            <Repeat className="w-3 h-3" aria-hidden="true" />
                            <span>Recurring</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Selected Area Category & Attention Detail Inspector */}
            {activeSelectedArea && (
              <aside className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 lg:sticky lg:top-20">
                <div className="pb-4 border-b border-[#DCE3DD] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-[#525D57]">
                    <span>
                      {activeSelectedArea.zoneCode} · Attention Score{' '}
                      <span className="font-mono tabular-nums font-semibold text-[#1E2421]">
                        {activeSelectedArea.attentionScore} pts
                      </span>
                    </span>
                    <span className="font-mono tabular-nums">
                      {activeSelectedArea.demoCount} demo · {activeSelectedArea.userCount}{' '}
                      user
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-[#1E2421]">
                    {activeSelectedArea.area}
                  </h2>
                  <p className="text-xs text-[#525D57] leading-relaxed">
                    Transparent count-based ranking: open complaints ×3, hazardous/dumping
                    reports ×2, total volume ×1, plus repeat baseline (+2).
                  </p>
                </div>

                {/* Complaint Categories Breakdown for Selected Area */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-[#1E2421]">
                    Complaint Categories in {activeSelectedArea.area}
                  </p>
                  <div className="space-y-2.5">
                    {REPORT_TYPE_LIST.map((type) => {
                      const count = activeSelectedArea.categoryCounts[type];
                      const pct =
                        activeSelectedArea.totalComplaints > 0
                          ? Math.round((count / activeSelectedArea.totalComplaints) * 100)
                          : 0;
                      const TypeIcon = REPORT_TYPE_ICONS[type];
                      const isHighRisk =
                        type === 'hazardous_waste' || type === 'illegal_dumping';
                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1.5 font-medium text-[#1E2421]">
                              <TypeIcon
                                className={`w-3.5 h-3.5 ${
                                  isHighRisk ? 'text-[#8C3F19]' : 'text-[#1F4E37]'
                                }`}
                                aria-hidden="true"
                              />
                              <span>{CIVIC_REPORT_TYPE_META[type].label}</span>
                            </span>
                            <span className="font-mono tabular-nums text-[#525D57]">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#EBF1EC] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: isHighRisk ? '#B55B2D' : '#1F4E37',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {activeSelectedArea.highRiskCategoryCount > 0 && (
                  <div className="rounded-xl bg-[#FBF3EB] border border-[#EAD3BE] p-3.5 flex items-start gap-2.5 text-xs text-[#8C3F19]">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <p>
                      Contains{' '}
                      <strong className="font-mono tabular-nums">
                        {activeSelectedArea.highRiskCategoryCount}
                      </strong>{' '}
                      hazardous waste or illegal dumping complaint(s) requiring priority
                      inspection.
                    </p>
                  </div>
                )}

                {onOpenReportsForArea && (
                  <button
                    type="button"
                    onClick={() => onOpenReportsForArea(activeSelectedArea.area)}
                    className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-[#E6F2EA] hover:bg-[#D7EBDD] text-[#1F4E37] text-xs font-semibold transition-colors"
                  >
                    Review Civic Reports Queue
                  </button>
                )}
              </aside>
            )}
          </div>

          {/* Ranked Attention List + Historical Demonstration Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Ranked List of Areas Requiring Attention */}
            <section className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#1E2421]">
                  Ranked Areas Requiring Attention
                </h2>
                <p className="text-xs text-[#525D57]">
                  Ordered by active unresolved load, hazardous/dumping priority, and recurrence
                </p>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#DCE3DD] text-xs font-semibold text-[#525D57]">
                      <th className="py-2.5 pr-3">Rank</th>
                      <th className="py-2.5 px-3">Area</th>
                      <th className="py-2.5 px-3">Tier</th>
                      <th className="py-2.5 px-3 text-right">Active / Total</th>
                      <th className="py-2.5 pl-3 text-right">Recurrence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE3DD] text-xs sm:text-sm">
                    {insights.rankedAreas.map((item, idx) => {
                      const visuals = getTierVisuals(item.attentionTier);
                      return (
                        <tr
                          key={item.area}
                          onClick={() => setInspectedArea(item.area)}
                          className={`cursor-pointer transition-colors ${
                            activeSelectedArea?.area === item.area
                              ? 'bg-[#E6F2EA]/60'
                              : 'hover:bg-[#F8F7F3]'
                          }`}
                        >
                          <td className="py-3 pr-3 font-mono tabular-nums font-semibold text-[#525D57]">
                            #{idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-semibold text-[#1E2421]">{item.area}</p>
                            <p className="text-xs text-[#525D57]">
                              {item.topCategory
                                ? CIVIC_REPORT_TYPE_META[item.topCategory].shortLabel
                                : 'No active reports'}{' '}
                              · {item.demoCount} demo / {item.userCount} user
                            </p>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`font-semibold text-xs ${visuals.labelClass}`}>
                              {item.attentionTier}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums">
                            <span className="font-semibold text-[#8C3F19]">
                              {item.openComplaints}
                            </span>{' '}
                            / {item.totalComplaints}
                          </td>
                          <td className="py-3 pl-3 text-right text-xs">
                            {item.isRecurring ? (
                              <span className="font-semibold text-[#8C3F19]">
                                Recurring ({item.historicalDemoTotal} in 4w demo)
                              </span>
                            ) : (
                              <span className="text-[#525D57]">
                                Single ({item.historicalDemoTotal} in 4w demo)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Ranked Cards */}
              <div className="md:hidden space-y-2.5">
                {insights.rankedAreas.map((item, idx) => {
                  const visuals = getTierVisuals(item.attentionTier);
                  return (
                    <button
                      key={item.area}
                      type="button"
                      onClick={() => setInspectedArea(item.area)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-colors space-y-1.5 ${
                        activeSelectedArea?.area === item.area
                          ? 'border-[#1F4E37] bg-[#E6F2EA]/60'
                          : 'border-[#DCE3DD] bg-[#F8F7F3]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-[#1E2421]">
                          #{idx + 1} · {item.area}
                        </span>
                        <span className={`text-xs font-semibold ${visuals.labelClass}`}>
                          {item.attentionTier}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#525D57] font-mono tabular-nums">
                        <span>
                          {item.openComplaints} open / {item.totalComplaints} total
                        </span>
                        <span>
                          {item.isRecurring ? 'Recurring' : 'Routine'} · 4w demo:{' '}
                          {item.historicalDemoTotal}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Historical Trend Chart (Demonstration Baseline) */}
            <section className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
                  <History className="w-4 h-4 text-[#1F4E37]" aria-hidden="true" />
                  <span>Demonstration Historical Baseline</span>
                </div>
                <h2 className="font-display text-lg font-bold text-[#1E2421]">
                  4-Week Complaint Trend
                  {areaFilter !== 'All' ? ` · ${areaFilter}` : ' · All Wards'}
                </h2>
                <p className="text-xs text-[#525D57]">
                  Sample weekly complaint counts from Oct W4 to Nov W3 (illustrative baseline
                  only, not predictive forecasting).
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {insights.historicalSeries.map((point) => {
                  const value =
                    areaFilter === 'All' ? point.totalCount : point.selectedAreaCount;
                  const widthPct = Math.round((value / maxHistoricalCount) * 100);
                  return (
                    <div key={point.periodLabel} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#1E2421]">
                          {point.periodLabel}
                        </span>
                        <span className="font-mono tabular-nums font-semibold text-[#1F4E37]">
                          {value} complaints
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-[#EBF1EC] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1F4E37] transition-all"
                          style={{ width: `${Math.max(widthPct, value > 0 ? 6 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] p-3.5 text-xs text-[#525D57]">
                Notice: Historical weekly figures represent fixed demonstration records so
                recurring hotspots can be compared against current browser submissions.
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
