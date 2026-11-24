import { MUNICIPAL_ZONE_STATS } from '../data/municipalDemoData';
import { DEMO_HISTORICAL_COMPLAINT_TRENDS } from '../data/municipalAnalyticsDemo';
import { CATEGORY_ORDER } from '../data/wasteCatalog';
import {
  CivicReport,
  CivicReportStatus,
  CivicReportType,
  CollectionSchedule,
  WasteBatch,
  WasteBatchStatus,
  WasteCategoryId,
} from '../types/ecosort';
import { CIVIC_REPORT_STATUS_ORDER } from './civicReportsStorage';
import { WASTE_BATCH_STATUS_ORDER } from './wasteBatchStorage';

export type AnalyticsRecordSource = 'all' | 'demo' | 'user';

export interface AnalyticsFilterOptions {
  area: string; // 'All' or exact area name
  source: AnalyticsRecordSource;
  startDate?: string; // YYYY-MM-DD inclusive
  endDate?: string; // YYYY-MM-DD inclusive
}

function isWithinDateBounds(
  dateStr: string,
  startDate?: string,
  endDate?: string
): boolean {
  const day = dateStr.slice(0, 10);
  if (startDate && day < startDate) return false;
  if (endDate && day > endDate) return false;
  return true;
}

function matchesSource(
  isDemoRecord: boolean,
  source: AnalyticsRecordSource
): boolean {
  if (source === 'demo') return isDemoRecord;
  if (source === 'user') return !isDemoRecord;
  return true;
}

export function filterAnalyticsDatasets(
  reports: CivicReport[],
  schedules: CollectionSchedule[],
  batches: WasteBatch[],
  filters: AnalyticsFilterOptions
) {
  const filteredReports = reports.filter((r) => {
    if (filters.area !== 'All' && r.area !== filters.area) return false;
    if (!matchesSource(r.isDemoRecord, filters.source)) return false;
    return isWithinDateBounds(r.createdAt, filters.startDate, filters.endDate);
  });

  const filteredSchedules = schedules.filter((s) => {
    if (filters.area !== 'All' && s.area !== filters.area) return false;
    if (!matchesSource(s.isDemoRecord, filters.source)) return false;
    return isWithinDateBounds(
      s.scheduledDate,
      filters.startDate,
      filters.endDate
    );
  });

  const filteredBatches = batches.filter((b) => {
    if (filters.area !== 'All' && b.sourceArea !== filters.area) return false;
    if (!matchesSource(b.isDemoRecord, filters.source)) return false;
    return isWithinDateBounds(
      b.collectionDate,
      filters.startDate,
      filters.endDate
    );
  });

  return {
    reports: filteredReports,
    schedules: filteredSchedules,
    batches: filteredBatches,
  };
}

// ============================================================================
// MODULE 1: HOTSPOT INSIGHTS
// ============================================================================

export type HotspotAttentionTier = 'High Attention' | 'Elevated' | 'Routine';

export interface AreaHotspotSummary {
  area: string;
  zoneCode: string;
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  demoCount: number;
  userCount: number;
  isRecurring: boolean;
  historicalDemoTotal: number;
  attentionTier: HotspotAttentionTier;
  attentionScore: number;
  topCategory: CivicReportType | null;
  categoryCounts: Record<CivicReportType, number>;
  highRiskCategoryCount: number; // hazardous_waste + illegal_dumping
}

export interface HotspotInsightsResult {
  totalComplaints: number;
  highAttentionAreasCount: number;
  recurringAreasCount: number;
  rankedAreas: AreaHotspotSummary[];
  historicalSeries: {
    periodLabel: string;
    totalCount: number;
    selectedAreaCount: number;
  }[];
}

const REPORT_TYPES: CivicReportType[] = [
  'overflowing_bin',
  'illegal_dumping',
  'missed_collection',
  'hazardous_waste',
  'other',
];

export function computeHotspotInsights(
  reports: CivicReport[],
  areaFilter: string = 'All'
): HotspotInsightsResult {
  const zoneLookup = new Map(
    MUNICIPAL_ZONE_STATS.map((z) => [z.zoneName, z.zoneCode])
  );

  // Include all known wards + any custom areas present in reports
  const allAreaNames = new Set<string>(
    areaFilter === 'All'
      ? MUNICIPAL_ZONE_STATS.map((z) => z.zoneName)
      : [areaFilter]
  );

  for (const report of reports) {
    if (areaFilter === 'All' || report.area === areaFilter) {
      allAreaNames.add(report.area);
    }
  }

  const summaries: AreaHotspotSummary[] = [];

  for (const area of allAreaNames) {
    const areaReports = reports.filter((r) => r.area === area);
    const categoryCounts: Record<CivicReportType, number> = {
      overflowing_bin: 0,
      illegal_dumping: 0,
      missed_collection: 0,
      hazardous_waste: 0,
      other: 0,
    };

    let openComplaints = 0;
    let resolvedComplaints = 0;
    let demoCount = 0;
    let userCount = 0;

    for (const r of areaReports) {
      categoryCounts[r.reportType] += 1;
      if (r.status === 'Resolved') {
        resolvedComplaints += 1;
      } else {
        openComplaints += 1;
      }
      if (r.isDemoRecord) {
        demoCount += 1;
      } else {
        userCount += 1;
      }
    }

    const totalComplaints = areaReports.length;
    const highRiskCategoryCount =
      categoryCounts.hazardous_waste + categoryCounts.illegal_dumping;

    // Historical demo baseline sum for this area
    const historicalDemoTotal = DEMO_HISTORICAL_COMPLAINT_TRENDS.reduce(
      (sum, pt) => sum + (pt.complaintsByArea[area] ?? 0),
      0
    );

    // Deterministic top complaint category
    let topCategory: CivicReportType | null = null;
    let topCount = 0;
    for (const t of REPORT_TYPES) {
      if (categoryCounts[t] > topCount) {
        topCount = categoryCounts[t];
        topCategory = t;
      }
    }

    // Recurring if >= 2 complaints in active records OR >= 6 across 4-week historical demo baseline
    const isRecurring =
      totalComplaints >= 2 || (totalComplaints >= 1 && historicalDemoTotal >= 6);

    // Transparent rule-based attention score (not AI):
    // open complaints (3 pts) + high-risk categories (2 pts) + total complaints (1 pt) + historical recurrence bonus (2 pts if >= 6)
    const attentionScore =
      openComplaints * 3 +
      highRiskCategoryCount * 2 +
      totalComplaints +
      (historicalDemoTotal >= 6 && totalComplaints > 0 ? 2 : 0);

    let attentionTier: HotspotAttentionTier = 'Routine';
    if (
      totalComplaints > 0 &&
      (openComplaints >= 2 ||
        (openComplaints >= 1 && highRiskCategoryCount >= 1) ||
        attentionScore >= 6)
    ) {
      attentionTier = 'High Attention';
    } else if (totalComplaints > 0 && (openComplaints >= 1 || isRecurring)) {
      attentionTier = 'Elevated';
    }

    summaries.push({
      area,
      zoneCode: zoneLookup.get(area) ?? 'CUSTOM',
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      demoCount,
      userCount,
      isRecurring,
      historicalDemoTotal,
      attentionTier,
      attentionScore,
      topCategory,
      categoryCounts,
      highRiskCategoryCount,
    });
  }

  const rankedAreas = summaries.sort((a, b) => {
    if (b.attentionScore !== a.attentionScore) {
      return b.attentionScore - a.attentionScore;
    }
    if (b.totalComplaints !== a.totalComplaints) {
      return b.totalComplaints - a.totalComplaints;
    }
    return b.historicalDemoTotal - a.historicalDemoTotal;
  });

  const historicalSeries = DEMO_HISTORICAL_COMPLAINT_TRENDS.map((point) => {
    const totalCount = Object.values(point.complaintsByArea).reduce(
      (s, v) => s + v,
      0
    );
    const selectedAreaCount =
      areaFilter === 'All'
        ? totalCount
        : (point.complaintsByArea[areaFilter] ?? 0);
    return {
      periodLabel: point.periodLabel,
      totalCount,
      selectedAreaCount,
    };
  });

  return {
    totalComplaints: reports.length,
    highAttentionAreasCount: rankedAreas.filter(
      (a) => a.attentionTier === 'High Attention'
    ).length,
    recurringAreasCount: rankedAreas.filter((a) => a.isRecurring).length,
    rankedAreas,
    historicalSeries,
  };
}

// ============================================================================
// MODULE 2: WASTE ANALYTICS (Derived from WasteBatch[])
// ============================================================================

export interface CategoryWasteMetric {
  category: WasteCategoryId;
  batchCount: number;
  totalKg: number;
  sharePct: number;
}

export interface BatchStatusMetric {
  status: WasteBatchStatus;
  batchCount: number;
  totalKg: number;
  sharePct: number;
}

export interface AreaWasteComparison {
  area: string;
  batchCount: number;
  totalKg: number;
  byCategoryKg: Record<WasteCategoryId, number>;
}

export interface WasteDateTrendPoint {
  date: string;
  batchCount: number;
  totalKg: number;
}

export interface WasteAnalyticsResult {
  totalBatches: number;
  totalEstimatedKg: number;
  collectedOrBeyondKg: number;
  processedKg: number;
  demoKg: number;
  userKg: number;
  byCategory: CategoryWasteMetric[];
  byStatus: BatchStatusMetric[];
  byArea: AreaWasteComparison[];
  trendsByDate: WasteDateTrendPoint[];
}

export function computeWasteAnalytics(batches: WasteBatch[]): WasteAnalyticsResult {
  const totalBatches = batches.length;
  const totalEstimatedKg = batches.reduce((sum, b) => sum + b.estimatedKg, 0);
  const collectedOrBeyondKg = batches
    .filter((b) => b.status !== 'Awaiting Collection')
    .reduce((sum, b) => sum + b.estimatedKg, 0);
  const processedKg = batches
    .filter((b) => b.status === 'Processed')
    .reduce((sum, b) => sum + b.estimatedKg, 0);
  const demoKg = batches
    .filter((b) => b.isDemoRecord)
    .reduce((sum, b) => sum + b.estimatedKg, 0);
  const userKg = batches
    .filter((b) => !b.isDemoRecord)
    .reduce((sum, b) => sum + b.estimatedKg, 0);

  const byCategory: CategoryWasteMetric[] = CATEGORY_ORDER.map((category) => {
    const matching = batches.filter((b) => b.wasteCategory === category);
    const kg = matching.reduce((s, b) => s + b.estimatedKg, 0);
    return {
      category,
      batchCount: matching.length,
      totalKg: kg,
      sharePct: totalEstimatedKg > 0 ? Number(((kg / totalEstimatedKg) * 100).toFixed(1)) : 0,
    };
  });

  const byStatus: BatchStatusMetric[] = WASTE_BATCH_STATUS_ORDER.map((status) => {
    const matching = batches.filter((b) => b.status === status);
    const kg = matching.reduce((s, b) => s + b.estimatedKg, 0);
    return {
      status,
      batchCount: matching.length,
      totalKg: kg,
      sharePct: totalBatches > 0 ? Number(((matching.length / totalBatches) * 100).toFixed(1)) : 0,
    };
  });

  const areaMap = new Map<string, AreaWasteComparison>();
  for (const b of batches) {
    const existing = areaMap.get(b.sourceArea) ?? {
      area: b.sourceArea,
      batchCount: 0,
      totalKg: 0,
      byCategoryKg: { wet: 0, dry: 0, ewaste: 0, hazardous: 0 },
    };
    existing.batchCount += 1;
    existing.totalKg += b.estimatedKg;
    existing.byCategoryKg[b.wasteCategory] += b.estimatedKg;
    areaMap.set(b.sourceArea, existing);
  }
  const byArea = Array.from(areaMap.values()).sort((a, b) => b.totalKg - a.totalKg);

  const dateMap = new Map<string, WasteDateTrendPoint>();
  for (const b of batches) {
    const existing = dateMap.get(b.collectionDate) ?? {
      date: b.collectionDate,
      batchCount: 0,
      totalKg: 0,
    };
    existing.batchCount += 1;
    existing.totalKg += b.estimatedKg;
    dateMap.set(b.collectionDate, existing);
  }
  const trendsByDate = Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return {
    totalBatches,
    totalEstimatedKg,
    collectedOrBeyondKg,
    processedKg,
    demoKg,
    userKg,
    byCategory,
    byStatus,
    byArea,
    trendsByDate,
  };
}

// ============================================================================
// MODULE 3: COLLECTION PERFORMANCE (Derived from CollectionSchedule[])
// ============================================================================

export interface AreaCollectionPerformance {
  area: string;
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  completionRatePct: number;
}

export interface CollectionPerformanceResult {
  totalScheduled: number;
  completedCount: number;
  pendingCount: number;
  cancelledCount: number;
  completionRatePct: number;
  demoCount: number;
  userCount: number;
  byArea: AreaCollectionPerformance[];
}

export function computeCollectionPerformance(
  schedules: CollectionSchedule[]
): CollectionPerformanceResult {
  const totalScheduled = schedules.length;
  const completedCount = schedules.filter((s) => s.status === 'Collected').length;
  const pendingCount = schedules.filter(
    (s) => s.status === 'Scheduled' || s.status === 'Assigned'
  ).length;
  const cancelledCount = schedules.filter((s) => s.status === 'Cancelled').length;
  const demoCount = schedules.filter((s) => s.isDemoRecord).length;
  const userCount = schedules.filter((s) => !s.isDemoRecord).length;

  const activeDenominator = totalScheduled - cancelledCount;
  const completionRatePct =
    activeDenominator > 0
      ? Number(((completedCount / activeDenominator) * 100).toFixed(1))
      : 0;

  const areaMap = new Map<string, AreaCollectionPerformance>();
  for (const s of schedules) {
    const entry = areaMap.get(s.area) ?? {
      area: s.area,
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      completionRatePct: 0,
    };
    entry.total += 1;
    if (s.status === 'Collected') entry.completed += 1;
    else if (s.status === 'Cancelled') entry.cancelled += 1;
    else entry.pending += 1;
    areaMap.set(s.area, entry);
  }

  const byArea = Array.from(areaMap.values())
    .map((entry) => {
      const denom = entry.total - entry.cancelled;
      return {
        ...entry,
        completionRatePct:
          denom > 0 ? Number(((entry.completed / denom) * 100).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return b.completionRatePct - a.completionRatePct;
    });

  return {
    totalScheduled,
    completedCount,
    pendingCount,
    cancelledCount,
    completionRatePct,
    demoCount,
    userCount,
    byArea,
  };
}

// ============================================================================
// MODULE 4: CIVIC REPORT ANALYTICS (Derived from CivicReport[])
// ============================================================================

export interface ReportCategoryMetric {
  reportType: CivicReportType;
  count: number;
  sharePct: number;
}

export interface ReportStatusMetric {
  status: CivicReportStatus;
  count: number;
  sharePct: number;
}

export interface AreaReportComparison {
  area: string;
  total: number;
  openCount: number;
  resolvedCount: number;
  demoCount: number;
  userCount: number;
}

export interface CivicReportAnalyticsResult {
  totalReports: number;
  pendingSubmittedCount: number;
  underReviewCount: number;
  inProgressCount: number;
  resolvedCount: number;
  resolutionRatePct: number;
  demoCount: number;
  userCount: number;
  byStatus: ReportStatusMetric[];
  byCategory: ReportCategoryMetric[];
  byArea: AreaReportComparison[];
}

export function computeCivicReportAnalytics(
  reports: CivicReport[]
): CivicReportAnalyticsResult {
  const totalReports = reports.length;
  const pendingSubmittedCount = reports.filter(
    (r) => r.status === 'Submitted'
  ).length;
  const underReviewCount = reports.filter(
    (r) => r.status === 'Under Review'
  ).length;
  const inProgressCount = reports.filter(
    (r) => r.status === 'In Progress'
  ).length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;
  const demoCount = reports.filter((r) => r.isDemoRecord).length;
  const userCount = reports.filter((r) => !r.isDemoRecord).length;

  const resolutionRatePct =
    totalReports > 0
      ? Number(((resolvedCount / totalReports) * 100).toFixed(1))
      : 0;

  const byStatus: ReportStatusMetric[] = CIVIC_REPORT_STATUS_ORDER.map(
    (status) => {
      const count = reports.filter((r) => r.status === status).length;
      return {
        status,
        count,
        sharePct:
          totalReports > 0
            ? Number(((count / totalReports) * 100).toFixed(1))
            : 0,
      };
    }
  );

  const byCategory: ReportCategoryMetric[] = REPORT_TYPES.map((reportType) => {
    const count = reports.filter((r) => r.reportType === reportType).length;
    return {
      reportType,
      count,
      sharePct:
        totalReports > 0 ? Number(((count / totalReports) * 100).toFixed(1)) : 0,
    };
  }).sort((a, b) => b.count - a.count);

  const areaMap = new Map<string, AreaReportComparison>();
  for (const r of reports) {
    const entry = areaMap.get(r.area) ?? {
      area: r.area,
      total: 0,
      openCount: 0,
      resolvedCount: 0,
      demoCount: 0,
      userCount: 0,
    };
    entry.total += 1;
    if (r.status === 'Resolved') entry.resolvedCount += 1;
    else entry.openCount += 1;
    if (r.isDemoRecord) entry.demoCount += 1;
    else entry.userCount += 1;
    areaMap.set(r.area, entry);
  }

  const byArea = Array.from(areaMap.values()).sort(
    (a, b) => b.total - a.total || b.openCount - a.openCount
  );

  return {
    totalReports,
    pendingSubmittedCount,
    underReviewCount,
    inProgressCount,
    resolvedCount,
    resolutionRatePct,
    demoCount,
    userCount,
    byStatus,
    byCategory,
    byArea,
  };
}
