import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  BarChart3,
  Building2,
  Calendar,
  ClipboardList,
  Flame,
  Info,
  Layers,
  LineChart,
  MapPin,
  PackageCheck,
  Search,
  X,
} from 'lucide-react';
import {
  DEMO_DATA_NOTICE,
  MUNICIPAL_CATEGORY_SUMMARIES,
  MUNICIPAL_OVERVIEW_METRICS,
  MUNICIPAL_ZONE_STATS,
} from '../data/municipalDemoData';
import { WASTE_CATEGORIES } from '../data/wasteCatalog';
import {
  AdminView,
  CivicReport,
  CivicReportStatus,
  CollectionPriority,
  CollectionSchedule,
  CollectionScheduleCreateInput,
  CollectionScheduleStatus,
  MunicipalZoneStat,
  WardType,
  WasteBatch,
  WasteBatchCreateInput,
  WasteBatchStatus,
} from '../types/ecosort';
import { UpdateReportStatusResult } from '../utils/civicReportsStorage';
import {
  CreateScheduleResult,
  UpdateScheduleResult,
} from '../utils/collectionPlannerStorage';
import {
  computeCollectionPerformance,
  computeHotspotInsights,
  computeWasteAnalytics,
} from '../utils/municipalAnalytics';
import {
  CreateBatchResult,
  UpdateBatchStatusResult,
} from '../utils/wasteBatchStorage';
import { AdminReportsSection } from './AdminReportsSection';
import { CATEGORY_STYLES, CategoryIcon } from './categoryTheme';
import { CollectionPlannerSection } from './CollectionPlannerSection';
import { HotspotInsightsSection } from './HotspotInsightsSection';
import { MunicipalAnalyticsSection } from './MunicipalAnalyticsSection';
import { WasteBatchTrackingSection } from './WasteBatchTrackingSection';

interface MunicipalPortalProps {
  activeView: AdminView;
  onChangeView: (view: AdminView) => void;
  onSwitchToCitizen: (initialView?: 'dashboard' | 'reports') => void;
  reports: CivicReport[];
  reportsLoading: boolean;
  reportsError: string | null;
  reportsCorrupted: boolean;
  onUpdateReportStatus: (
    reportId: string,
    nextStatus: CivicReportStatus,
    adminNote: string
  ) => UpdateReportStatusResult;
  onRecoverCorruptReports: () => void;
  onRestoreDemoReports: () => void;
  schedules: CollectionSchedule[];
  schedulesLoading: boolean;
  schedulesError: string | null;
  schedulesCorrupted: boolean;
  onCreateSchedule: (input: CollectionScheduleCreateInput) => CreateScheduleResult;
  onUpdateSchedule: (
    scheduleId: string,
    updates: {
      status: CollectionScheduleStatus;
      assignedFleetId: string;
      priority: CollectionPriority;
      notes?: string;
    }
  ) => UpdateScheduleResult;
  onRecoverCorruptSchedules: () => void;
  onRestoreDemoSchedules: () => void;
  batches: WasteBatch[];
  batchesLoading: boolean;
  batchesError: string | null;
  batchesCorrupted: boolean;
  onCreateBatch: (input: WasteBatchCreateInput) => CreateBatchResult;
  onUpdateBatchStatus: (
    batchId: string,
    nextStatus: WasteBatchStatus,
    note: string
  ) => UpdateBatchStatusResult;
  onRecoverCorruptBatches: () => void;
  onRestoreDemoBatches: () => void;
}

type SortKey = 'compliance' | 'tonnes' | 'contamination';

export function MunicipalPortal({
  activeView,
  onChangeView,
  onSwitchToCitizen,
  reports,
  reportsLoading,
  reportsError,
  reportsCorrupted,
  onUpdateReportStatus,
  onRecoverCorruptReports,
  onRestoreDemoReports,
  schedules,
  schedulesLoading,
  schedulesError,
  schedulesCorrupted,
  onCreateSchedule,
  onUpdateSchedule,
  onRecoverCorruptSchedules,
  onRestoreDemoSchedules,
  batches,
  batchesLoading,
  batchesError,
  batchesCorrupted,
  onCreateBatch,
  onUpdateBatchStatus,
  onRecoverCorruptBatches,
  onRestoreDemoBatches,
}: MunicipalPortalProps) {
  const [zoneQuery, setZoneQuery] = useState('');
  const [wardTypeFilter, setWardTypeFilter] = useState<WardType | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortKey>('compliance');
  const [selectedZone, setSelectedZone] = useState<MunicipalZoneStat>(
    MUNICIPAL_ZONE_STATS[0]
  );

  const filteredZones = useMemo(() => {
    const normalized = zoneQuery.trim().toLowerCase();
    return MUNICIPAL_ZONE_STATS.filter((zone) => {
      if (wardTypeFilter !== 'All' && zone.wardType !== wardTypeFilter) {
        return false;
      }
      if (!normalized) return true;
      return (
        zone.zoneName.toLowerCase().includes(normalized) ||
        zone.zoneCode.toLowerCase().includes(normalized) ||
        zone.wardType.toLowerCase().includes(normalized)
      );
    }).sort((a, b) => {
      if (sortBy === 'compliance') {
        return b.segregationCompliancePct - a.segregationCompliancePct;
      }
      if (sortBy === 'tonnes') {
        return b.dailyTonnes - a.dailyTonnes;
      }
      return b.contaminationRatePct - a.contaminationRatePct;
    });
  }, [zoneQuery, wardTypeFilter, sortBy]);

  const sortedByCompliance = useMemo(
    () =>
      [...MUNICIPAL_ZONE_STATS].sort(
        (a, b) => b.segregationCompliancePct - a.segregationCompliancePct
      ),
    []
  );

  const dashboardHotspots = useMemo(
    () => computeHotspotInsights(reports, 'All'),
    [reports]
  );
  const dashboardWaste = useMemo(
    () => computeWasteAnalytics(batches),
    [batches]
  );
  const dashboardCollection = useMemo(
    () => computeCollectionPerformance(schedules),
    [schedules]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-20">
      {/* Mandatory Demonstration Data Disclosure Banner */}
      <div
        role="note"
        className="bg-[#EBF1EC] border border-[#CFDAD1] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-semibold text-[#1E2421]">
              {DEMO_DATA_NOTICE.badgeText} · {DEMO_DATA_NOTICE.headline}
            </p>
            <p className="text-xs sm:text-sm text-[#525D57] leading-relaxed">
              {DEMO_DATA_NOTICE.description}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-[#395543] whitespace-nowrap shrink-0 self-start sm:self-center">
          {DEMO_DATA_NOTICE.reportingPeriod}
        </span>
      </div>

      {/* Portal Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#DCE3DD]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
            <span>Municipal Admin Portal</span>
            <span aria-hidden="true">·</span>
            <span>Demonstration Overview</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1E2421] tracking-tight">
            {activeView === 'dashboard' && 'Municipal Operations Dashboard'}
            {activeView === 'overview' && 'City Waste Stream Overview'}
            {activeView === 'areas' && 'Area-wise Demonstration Statistics'}
            {activeView === 'reports' && 'Civic Report Management'}
            {activeView === 'planner' && 'Collection Planner'}
            {activeView === 'batches' && 'Waste Batch Tracking'}
            {activeView === 'hotspots' && 'Area-wise Hotspot Insights'}
            {activeView === 'analytics' && 'Municipal Analytics'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Municipal admin views"
            className="inline-flex items-center p-1 rounded-xl bg-[#EBF1EC] border border-[#DCE3DD] overflow-x-auto max-w-full"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'dashboard'}
              onClick={() => onChangeView('dashboard')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'dashboard'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <Building2 className="w-4 h-4" aria-hidden="true" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'overview'}
              onClick={() => onChangeView('overview')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'overview'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <Layers className="w-4 h-4" aria-hidden="true" />
              <span>Waste Overview</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'areas'}
              onClick={() => onChangeView('areas')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'areas'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
              <span>Area Statistics</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'reports'}
              onClick={() => onChangeView('reports')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'reports'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <ClipboardList className="w-4 h-4" aria-hidden="true" />
              <span>Civic Reports</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'planner'}
              onClick={() => onChangeView('planner')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'planner'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>Collection Planner</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'batches'}
              onClick={() => onChangeView('batches')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'batches'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <PackageCheck className="w-4 h-4" aria-hidden="true" />
              <span>Waste Batches</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'hotspots'}
              onClick={() => onChangeView('hotspots')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'hotspots'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <Flame className="w-4 h-4" aria-hidden="true" />
              <span>Hotspot Insights</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'analytics'}
              onClick={() => onChangeView('analytics')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'analytics'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <LineChart className="w-4 h-4" aria-hidden="true" />
              <span>Analytics</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSwitchToCitizen('dashboard')}
            className="text-xs font-semibold text-[#1F4E37] hover:underline underline-offset-4 whitespace-nowrap shrink-0 py-2 px-1"
          >
            Switch to Citizen Portal
          </button>
        </div>
      </div>

      {/* VIEW 1: MUNICIPAL DASHBOARD */}
      {activeView === 'dashboard' && (
        <div className="space-y-8">
          {/* 4 KPI Strip */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-2">
              <p className="text-xs font-medium text-[#525D57]">
                Monthly Collection · Demo Data
              </p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#1E2421] tabular-nums">
                {MUNICIPAL_OVERVIEW_METRICS.totalMonthlyTonnes.toLocaleString()} t
              </p>
              <p className="text-xs text-[#525D57]">
                Across 4 segregated streams
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-2">
              <p className="text-xs font-medium text-[#525D57]">
                Stream Diversion · Demo Data
              </p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#1F4E37] tabular-nums">
                {MUNICIPAL_OVERVIEW_METRICS.overallDiversionPct}%
              </p>
              <p className="text-xs text-[#525D57]">
                Routed to compost, MRF, or e-waste
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-2">
              <p className="text-xs font-medium text-[#525D57]">
                Avg. Contamination · Demo Data
              </p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#8C3F19] tabular-nums">
                {MUNICIPAL_OVERVIEW_METRICS.avgContaminationPct}%
              </p>
              <p className="text-xs text-[#525D57]">
                Mis-sorted items flagged at intake
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 shadow-sm space-y-2">
              <p className="text-xs font-medium text-[#525D57]">
                Reporting Wards · Demo Data
              </p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#1E2421] tabular-nums">
                {MUNICIPAL_OVERVIEW_METRICS.reportingZonesCount} wards
              </p>
              <p className="text-xs text-[#525D57] tabular-nums">
                {MUNICIPAL_OVERVIEW_METRICS.householdsCovered.toLocaleString()} households covered
              </p>
            </div>
          </section>

          {/* Proportional Stream Composition + Ward Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Stream Breakdown */}
            <section className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#1E2421]">
                    Monthly Volume by Stream
                  </h2>
                  <p className="text-xs text-[#525D57]">
                    Demonstration data · Proportional tonnage distribution
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChangeView('overview')}
                  className="text-xs font-semibold text-[#1F4E37] hover:underline underline-offset-4 whitespace-nowrap"
                >
                  Full Waste Overview
                </button>
              </div>

              {/* Clean Stacked Bar */}
              <div
                className="h-4 w-full rounded-full overflow-hidden flex bg-[#EBF1EC]"
                role="img"
                aria-label="Stream volume composition bar: Wet 52%, Dry 43.3%, E-waste 2.9%, Hazardous 1.8%"
              >
                {MUNICIPAL_CATEGORY_SUMMARIES.map((summary) => (
                  <div
                    key={summary.category}
                    style={{
                      width: `${Math.max(summary.shareOfTotalPct, 2)}%`,
                      backgroundColor: CATEGORY_STYLES[summary.category].barColor,
                    }}
                    title={`${WASTE_CATEGORIES[summary.category].shortName}: ${summary.shareOfTotalPct}%`}
                  />
                ))}
              </div>

              <div className="divide-y divide-[#DCE3DD]">
                {MUNICIPAL_CATEGORY_SUMMARIES.map((summary) => {
                  const cat = WASTE_CATEGORIES[summary.category];
                  const style = CATEGORY_STYLES[summary.category];
                  return (
                    <div
                      key={summary.category}
                      className="py-3.5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-9 h-9 rounded-lg ${style.surfaceBg} ${style.accentText} flex items-center justify-center shrink-0`}
                        >
                          <CategoryIcon category={summary.category} className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1E2421]">
                            {cat.name}
                          </p>
                          <p className="text-xs text-[#525D57] truncate">
                            {summary.processingDestination}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono tabular-nums text-sm font-semibold text-[#1E2421]">
                          {summary.monthlyTonnes} t
                        </p>
                        <p className="font-mono tabular-nums text-xs text-[#525D57]">
                          {summary.shareOfTotalPct}% share
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Ward Compliance Snapshot */}
            <section className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#1E2421]">
                    Ward Compliance Snapshot
                  </h2>
                  <p className="text-xs text-[#525D57]">
                    Demonstration data · Ranked by compliance
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChangeView('areas')}
                  className="text-xs font-semibold text-[#1F4E37] hover:underline underline-offset-4 whitespace-nowrap"
                >
                  All Areas
                </button>
              </div>

              <div className="space-y-3">
                {sortedByCompliance.map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => {
                      setSelectedZone(zone);
                      onChangeView('areas');
                    }}
                    className="w-full text-left p-3 rounded-xl border border-[#DCE3DD] hover:bg-[#F8F7F3] transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-semibold text-[#1E2421] truncate">
                        {zone.zoneCode} · {zone.zoneName}
                      </span>
                      <span className="font-mono tabular-nums text-xs font-semibold text-[#1F4E37] shrink-0">
                        {zone.segregationCompliancePct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#EBF1EC] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1F4E37]"
                        style={{ width: `${zone.segregationCompliancePct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#525D57]">
                      <span>{zone.wardType}</span>
                      <span className="font-mono tabular-nums">
                        {zone.dailyTonnes} t/day · {zone.contaminationRatePct}% contam.
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Live Shared Civic Reports Queue Summary */}
          <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#525D57]">
                <ClipboardList className="w-4 h-4 text-[#1F4E37]" aria-hidden="true" />
                <span>Shared Civic Reports Queue</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {reports.filter((r) => r.status !== 'Resolved').length} open ·{' '}
                  {reports.filter((r) => r.status === 'Resolved').length} resolved
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-[#1E2421]">
                Review citizen waste complaints &amp; dispatch status updates
              </h2>
              <p className="text-sm text-[#525D57]">
                Includes demo records and any reports submitted in the Citizen Portal on this browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChangeView('reports')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1F4E37] hover:bg-[#173B2A] text-white text-sm font-semibold whitespace-nowrap shrink-0 self-start sm:self-center transition-colors"
            >
              Manage Civic Reports
            </button>
          </section>

          {/* Municipal Operations Summary Cards (Collection Planner & Waste Batch Tracking) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
                  <Calendar className="w-4 h-4 text-[#1F4E37]" aria-hidden="true" />
                  <span>Collection Planner · Demo Operations</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {
                      schedules.filter(
                        (s) => s.status === 'Scheduled' || s.status === 'Assigned'
                      ).length
                    }{' '}
                    upcoming
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-[#1E2421]">
                  Ward Collection Schedules
                </h2>
                <p className="text-sm text-[#525D57]">
                  Plan ward pickups by stream, assign demonstration crews, and update collection statuses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChangeView('planner')}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#E6F2EA] hover:bg-[#D7EBDD] text-[#1F4E37] text-sm font-semibold self-start transition-colors"
              >
                Open Collection Planner
              </button>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
                  <PackageCheck className="w-4 h-4 text-[#1F4E37]" aria-hidden="true" />
                  <span>Waste Batch Tracking · Demo Operations</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {batches.filter((b) => b.status !== 'Processed').length} active batches
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-[#1E2421]">
                  Processing Pipeline &amp; Batch History
                </h2>
                <p className="text-sm text-[#525D57]">
                  Track batches from Awaiting Collection through Processed with full stage timelines.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChangeView('batches')}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#E6F2EA] hover:bg-[#D7EBDD] text-[#1F4E37] text-sm font-semibold self-start transition-colors"
              >
                Open Batch Tracking
              </button>
            </div>
          </section>

          {/* Hotspot Insights & Municipal Analytics Summary Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
                  <Flame className="w-4 h-4 text-[#8C3F19]" aria-hidden="true" />
                  <span>Hotspot Insights · Demo + Local Reports</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {dashboardHotspots.highAttentionAreasCount} high-attention ·{' '}
                    {dashboardHotspots.recurringAreasCount} recurring
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-[#1E2421]">
                  Area-wise Complaint Hotspots
                </h2>
                <p className="text-sm text-[#525D57]">
                  Inspect ward complaint density, recurring complaint patterns, and ranked priority areas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChangeView('hotspots')}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#E6F2EA] hover:bg-[#D7EBDD] text-[#1F4E37] text-sm font-semibold self-start transition-colors"
              >
                Open Hotspot Insights
              </button>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
                  <LineChart className="w-4 h-4 text-[#1F4E37]" aria-hidden="true" />
                  <span>Municipal Analytics · Shared Records</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {dashboardWaste.totalEstimatedKg.toLocaleString()} kg ·{' '}
                    {dashboardCollection.completionRatePct}% schedule completion
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-[#1E2421]">
                  Waste, Collection &amp; Report Analytics
                </h2>
                <p className="text-sm text-[#525D57]">
                  Explore category tonnage, collection completion rates, and civic report status metrics.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChangeView('analytics')}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#E6F2EA] hover:bg-[#D7EBDD] text-[#1F4E37] text-sm font-semibold self-start transition-colors"
              >
                Open Municipal Analytics
              </button>
            </div>
          </section>
        </div>
      )}

      {/* VIEW 2: WASTE OVERVIEW */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MUNICIPAL_CATEGORY_SUMMARIES.map((summary) => {
              const cat = WASTE_CATEGORIES[summary.category];
              const style = CATEGORY_STYLES[summary.category];
              return (
                <article
                  key={summary.category}
                  className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#DCE3DD]">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-xl ${style.surfaceBg} ${style.accentText} flex items-center justify-center shrink-0`}
                      >
                        <CategoryIcon category={summary.category} className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-xs font-medium text-[#525D57]">
                          Demonstration Stream Summary
                        </p>
                        <h2 className="font-display text-lg font-bold text-[#1E2421]">
                          {cat.name}
                        </h2>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums text-lg font-bold text-[#1E2421]">
                      {summary.monthlyTonnes} t/mo
                    </span>
                  </div>

                  <dl className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-[#F8F7F3] p-3">
                      <dt className="text-xs text-[#525D57]">City Share</dt>
                      <dd className="font-mono tabular-nums text-base font-bold text-[#1E2421] mt-0.5">
                        {summary.shareOfTotalPct}%
                      </dd>
                    </div>
                    <div className="rounded-xl bg-[#F8F7F3] p-3">
                      <dt className="text-xs text-[#525D57]">Recovery</dt>
                      <dd className="font-mono tabular-nums text-base font-bold text-[#1F4E37] mt-0.5">
                        {summary.diversionOrRecoveryPct}%
                      </dd>
                    </div>
                    <div className="rounded-xl bg-[#F8F7F3] p-3">
                      <dt className="text-xs text-[#525D57]">Contamination</dt>
                      <dd className="font-mono tabular-nums text-base font-bold text-[#8C3F19] mt-0.5">
                        {summary.contaminationPct}%
                      </dd>
                    </div>
                  </dl>

                  <div className="space-y-1.5 text-sm">
                    <p className="text-[#1E2421]">
                      <span className="font-semibold">Destination: </span>
                      <span className="text-[#525D57]">
                        {summary.processingDestination}
                      </span>
                    </p>
                    <p className="text-[#525D57] leading-relaxed">
                      <span className="font-semibold text-[#1E2421]">
                        Field Note:{' '}
                      </span>
                      {summary.operationalNote}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: AREA-WISE DEMONSTRATION STATISTICS */}
      {activeView === 'areas' && (
        <div className="space-y-6">
          {/* Search, Filter & Sort Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EBF1EC] border border-[#DCE3DD] rounded-xl">
              {(['All', 'Residential', 'Commercial', 'Mixed', 'Institutional'] as const).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setWardTypeFilter(type)}
                    className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      wardTypeFilter === type
                        ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                        : 'text-[#525D57] hover:text-[#1E2421]'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search
                  className="w-4 h-4 text-[#525D57] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={zoneQuery}
                  onChange={(e) => setZoneQuery(e.target.value)}
                  placeholder="Search ward name or code..."
                  aria-label="Search municipal ward"
                  className="w-full sm:w-56 min-h-[44px] pl-10 pr-9 py-2 rounded-xl bg-[#FFFFFF] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:border-[#1F4E37] focus:outline-none"
                />
                {zoneQuery && (
                  <button
                    type="button"
                    onClick={() => setZoneQuery('')}
                    aria-label="Clear ward search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[32px] min-w-[32px] flex items-center justify-center text-[#525D57]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="inline-flex items-center gap-2 bg-[#FFFFFF] border border-[#DCE3DD] rounded-xl px-3 min-h-[44px]">
                <ArrowUpDown className="w-4 h-4 text-[#525D57] shrink-0" aria-hidden="true" />
                <label htmlFor="ward-sort" className="text-xs text-[#525D57] whitespace-nowrap">
                  Sort:
                </label>
                <select
                  id="ward-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="text-xs sm:text-sm font-semibold text-[#1E2421] bg-transparent focus:outline-none py-1.5"
                >
                  <option value="compliance">Compliance %</option>
                  <option value="tonnes">Daily Tonnes</option>
                  <option value="contamination">Contamination %</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Table on Desktop / Card List on Mobile */}
            <div className="lg:col-span-7">
              {filteredZones.length === 0 ? (
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center space-y-3">
                  <p className="text-sm font-semibold text-[#1E2421]">
                    No wards match your filter
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setZoneQuery('');
                      setWardTypeFilter('All');
                    }}
                    className="min-h-[40px] px-4 py-2 rounded-lg bg-[#E6F2EA] text-[#1F4E37] text-xs font-semibold"
                  >
                    Reset Ward Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#DCE3DD] bg-[#F8F7F3] text-xs font-semibold text-[#525D57]">
                          <th className="py-3 px-4">Ward (Demo)</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4 text-right">Daily</th>
                          <th className="py-3 px-4 text-right">Compliance</th>
                          <th className="py-3 px-4 text-right">Contam.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCE3DD] text-sm">
                        {filteredZones.map((zone) => {
                          const isSelected = selectedZone.id === zone.id;
                          return (
                            <tr
                              key={zone.id}
                              onClick={() => setSelectedZone(zone)}
                              className={`cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-[#E6F2EA]/75'
                                  : 'hover:bg-[#F8F7F3]'
                              }`}
                            >
                              <td className="py-3.5 px-4 font-medium text-[#1E2421]">
                                <span className="font-mono text-xs text-[#525D57] mr-2">
                                  {zone.zoneCode}
                                </span>
                                {zone.zoneName}
                              </td>
                              <td className="py-3.5 px-4 text-xs text-[#525D57]">
                                {zone.wardType}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#1E2421]">
                                {zone.dailyTonnes.toFixed(1)} t
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-[#1F4E37]">
                                {zone.segregationCompliancePct}%
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#8C3F19]">
                                {zone.contaminationRatePct}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List */}
                  <div className="md:hidden space-y-3">
                    {filteredZones.map((zone) => {
                      const isSelected = selectedZone.id === zone.id;
                      return (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => setSelectedZone(zone)}
                          className={`w-full text-left rounded-2xl p-4 border transition-colors space-y-2 ${
                            isSelected
                              ? 'bg-[#E6F2EA]/75 border-[#6F8F78]'
                              : 'bg-[#FFFFFF] border-[#DCE3DD]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[#1E2421]">
                              {zone.zoneCode} · {zone.zoneName}
                            </span>
                            <span className="font-mono tabular-nums text-xs font-semibold text-[#1F4E37]">
                              {zone.segregationCompliancePct}% compliance
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-[#525D57]">
                            <span>{zone.wardType} · Demo Data</span>
                            <span className="font-mono tabular-nums">
                              {zone.dailyTonnes.toFixed(1)} t/day · {zone.contaminationRatePct}% contam.
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Selected Ward Demonstration Detail Inspector */}
            <aside className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 lg:sticky lg:top-20">
              <div className="pb-4 border-b border-[#DCE3DD] space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-[#525D57]">
                  <span>
                    {selectedZone.zoneCode} · {selectedZone.wardType}
                  </span>
                  <span>Demonstration Data</span>
                </div>
                <h2 className="font-display text-xl font-bold text-[#1E2421]">
                  {selectedZone.zoneName}
                </h2>
                <p className="text-xs text-[#525D57] tabular-nums">
                  {selectedZone.householdsServed.toLocaleString()} households served
                </p>
              </div>

              <dl className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-[#F8F7F3] p-3">
                  <dt className="text-xs text-[#525D57]">Daily Load</dt>
                  <dd className="font-mono tabular-nums text-base font-bold text-[#1E2421] mt-0.5">
                    {selectedZone.dailyTonnes.toFixed(1)} t
                  </dd>
                </div>
                <div className="rounded-xl bg-[#E6F2EA] p-3">
                  <dt className="text-xs text-[#395543]">Compliance</dt>
                  <dd className="font-mono tabular-nums text-base font-bold text-[#1F4E37] mt-0.5">
                    {selectedZone.segregationCompliancePct}%
                  </dd>
                </div>
                <div className="rounded-xl bg-[#FBF3EB] p-3">
                  <dt className="text-xs text-[#8C3F19]">Contam.</dt>
                  <dd className="font-mono tabular-nums text-base font-bold text-[#8C3F19] mt-0.5">
                    {selectedZone.contaminationRatePct}%
                  </dd>
                </div>
              </dl>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#1E2421]">
                  Four-Stream Breakdown (Demonstration)
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#525D57]">Wet &amp; Organic Share</span>
                    <span className="font-mono tabular-nums font-semibold text-[#1E2421]">
                      {selectedZone.wetSharePct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EBF1EC] overflow-hidden">
                    <div
                      className="h-full bg-[#1F4E37]"
                      style={{ width: `${selectedZone.wetSharePct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#525D57]">Dry &amp; Recyclable Share</span>
                    <span className="font-mono tabular-nums font-semibold text-[#1E2421]">
                      {selectedZone.drySharePct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EBF1EC] overflow-hidden">
                    <div
                      className="h-full bg-[#6F8F78]"
                      style={{ width: `${selectedZone.drySharePct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="rounded-xl bg-[#F8F7F3] p-3">
                    <p className="text-[#525D57]">Weekly E-waste</p>
                    <p className="font-mono tabular-nums text-sm font-semibold text-[#1E2421] mt-0.5">
                      {selectedZone.ewasteKgWeek} kg/wk
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F8F7F3] p-3">
                    <p className="text-[#525D57]">Weekly Hazardous</p>
                    <p className="font-mono tabular-nums text-sm font-semibold text-[#8C3F19] mt-0.5">
                      {selectedZone.hazardousKgWeek} kg/wk
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#DCE3DD] text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[#1E2421]">
                    <span className="font-semibold">Schedule: </span>
                    <span className="text-[#525D57]">
                      {selectedZone.collectionSchedule}
                    </span>
                  </p>
                </div>
                <p className="text-[#525D57] leading-relaxed">
                  <span className="font-semibold text-[#1E2421]">Note: </span>
                  {selectedZone.operationalNote}
                </p>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* VIEW 4: CIVIC REPORT MANAGEMENT */}
      {activeView === 'reports' && (
        <AdminReportsSection
          reports={reports}
          isLoading={reportsLoading}
          error={reportsError}
          isCorrupted={reportsCorrupted}
          onUpdateStatus={onUpdateReportStatus}
          onRecoverCorruptStorage={onRecoverCorruptReports}
          onRestoreDemoRecords={onRestoreDemoReports}
          onSwitchToCitizenReports={() => onSwitchToCitizen('reports')}
        />
      )}

      {/* VIEW 5: COLLECTION PLANNER */}
      {activeView === 'planner' && (
        <CollectionPlannerSection
          schedules={schedules}
          isLoading={schedulesLoading}
          error={schedulesError}
          isCorrupted={schedulesCorrupted}
          onCreateSchedule={onCreateSchedule}
          onUpdateSchedule={onUpdateSchedule}
          onRecoverCorruptSchedules={onRecoverCorruptSchedules}
          onRestoreDemoSchedules={onRestoreDemoSchedules}
        />
      )}

      {/* VIEW 6: WASTE BATCH TRACKING */}
      {activeView === 'batches' && (
        <WasteBatchTrackingSection
          batches={batches}
          isLoading={batchesLoading}
          error={batchesError}
          isCorrupted={batchesCorrupted}
          onCreateBatch={onCreateBatch}
          onUpdateBatchStatus={onUpdateBatchStatus}
          onRecoverCorruptBatches={onRecoverCorruptBatches}
          onRestoreDemoBatches={onRestoreDemoBatches}
        />
      )}

      {/* VIEW 7: HOTSPOT INSIGHTS */}
      {activeView === 'hotspots' && (
        <HotspotInsightsSection
          reports={reports}
          isLoading={reportsLoading}
          onOpenReportsForArea={() => onChangeView('reports')}
        />
      )}

      {/* VIEW 8: MUNICIPAL ANALYTICS */}
      {activeView === 'analytics' && (
        <MunicipalAnalyticsSection
          reports={reports}
          schedules={schedules}
          batches={batches}
          isLoading={reportsLoading || schedulesLoading || batchesLoading}
        />
      )}
    </div>
  );
}
