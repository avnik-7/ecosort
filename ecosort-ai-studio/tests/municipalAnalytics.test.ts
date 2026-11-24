import assert from 'node:assert/strict';
import test from 'node:test';
import { DEMO_CIVIC_REPORTS } from '../src/data/civicReportsDemo';
import {
  DEMO_COLLECTION_SCHEDULES,
  DEMO_WASTE_BATCHES,
} from '../src/data/municipalOperationsDemo';
import { CivicReport, CollectionSchedule, WasteBatch } from '../src/types/ecosort';
import {
  computeCivicReportAnalytics,
  computeCollectionPerformance,
  computeHotspotInsights,
  computeWasteAnalytics,
  filterAnalyticsDatasets,
} from '../src/utils/municipalAnalytics';

const USER_REPORT_CUSTOM: CivicReport = {
  id: 'ECO-2026-9901',
  reportType: 'illegal_dumping',
  area: 'Old Town Market',
  locationDetail: 'South Gate Alleyway',
  description: 'Stacked cardboard and spoiled crates left outside stall.',
  status: 'Submitted',
  createdAt: '2026-11-21T09:00:00.000Z',
  updatedAt: '2026-11-21T09:00:00.000Z',
  isDemoRecord: false,
  statusHistory: [
    {
      id: 'h-u-1',
      status: 'Submitted',
      timestamp: '2026-11-21T09:00:00.000Z',
      actor: 'Citizen',
      note: 'Submitted by resident.',
    },
  ],
};

const USER_SCHEDULE_COLLECTED: CollectionSchedule = {
  id: 'SCH-2026-9902',
  area: 'Old Town Market',
  wasteCategory: 'wet',
  scheduledDate: '2026-11-21',
  scheduledTime: '08:00',
  assignedFleetId: 'fleet-v104',
  assignedTeamLabel: 'V-104 · North Organics Crew A (Demo Team)',
  priority: 'High',
  status: 'Collected',
  createdAt: '2026-11-21T06:00:00.000Z',
  updatedAt: '2026-11-21T10:00:00.000Z',
  isDemoRecord: false,
};

const USER_SCHEDULE_CANCELLED: CollectionSchedule = {
  id: 'SCH-2026-9903',
  area: 'Old Town Market',
  wasteCategory: 'dry',
  scheduledDate: '2026-11-21',
  scheduledTime: '11:00',
  assignedFleetId: 'fleet-v208',
  assignedTeamLabel: 'V-208 · MRF Dry Stream Crew B (Demo Team)',
  priority: 'Low',
  status: 'Cancelled',
  createdAt: '2026-11-21T06:30:00.000Z',
  updatedAt: '2026-11-21T09:00:00.000Z',
  isDemoRecord: false,
};

const USER_BATCH: WasteBatch = {
  id: 'BAT-2026-9904',
  wasteCategory: 'dry',
  sourceArea: 'Old Town Market',
  collectionDate: '2026-11-21',
  estimatedKg: 935,
  status: 'Processed',
  createdAt: '2026-11-21T08:00:00.000Z',
  updatedAt: '2026-11-21T15:00:00.000Z',
  isDemoRecord: false,
  statusHistory: [
    {
      id: 'bh-u-1',
      status: 'Processed',
      timestamp: '2026-11-21T15:00:00.000Z',
      actor: 'Municipal Admin',
      note: 'Processed at Northside MRF.',
    },
  ],
};

test('Hotspot Insights: ranks high-attention & recurring areas accurately and maps historical demo baseline', () => {
  const combinedReports = [...DEMO_CIVIC_REPORTS, USER_REPORT_CUSTOM];
  const result = computeHotspotInsights(combinedReports, 'All');

  assert.equal(result.totalComplaints, DEMO_CIVIC_REPORTS.length + 1);
  // Old Town Market now has 2 open reports (overflowing_bin + illegal_dumping) + 14 historical demo
  const topArea = result.rankedAreas[0];
  assert.equal(topArea.area, 'Old Town Market');
  assert.equal(topArea.totalComplaints, 2);
  assert.equal(topArea.openComplaints, 2);
  assert.equal(topArea.isRecurring, true);
  assert.equal(topArea.attentionTier, 'High Attention');
  assert.equal(topArea.demoCount, 1);
  assert.equal(topArea.userCount, 1);
  assert.equal(topArea.highRiskCategoryCount, 1);
  assert.equal(topArea.historicalDemoTotal, 14);
  assert.ok(result.highAttentionAreasCount >= 1);
  assert.ok(result.recurringAreasCount >= 1);
  assert.equal(result.historicalSeries.length, 4);

  // Area-filtered historical series reflects selected ward counts
  const filteredInsights = computeHotspotInsights(combinedReports, 'Old Town Market');
  assert.equal(filteredInsights.rankedAreas.length, 1);
  assert.deepEqual(
    filteredInsights.historicalSeries.map((s) => s.selectedAreaCount),
    [3, 4, 3, 4]
  );
});

test('Waste Analytics: derives total kg, category distribution, 5-stage status breakdown, area comparison, and date trends', () => {
  const combinedBatches = [...DEMO_WASTE_BATCHES, USER_BATCH];
  const result = computeWasteAnalytics(combinedBatches);

  const demoKg = DEMO_WASTE_BATCHES.reduce((s, b) => s + b.estimatedKg, 0); // 11065
  assert.equal(result.totalBatches, 6);
  assert.equal(result.demoKg, demoKg);
  assert.equal(result.userKg, 935);
  assert.equal(result.totalEstimatedKg, demoKg + 935); // 12000

  // Category shares sum neatly and match exact kg
  const wetMetric = result.byCategory.find((c) => c.category === 'wet');
  const dryMetric = result.byCategory.find((c) => c.category === 'dry');
  assert.equal(wetMetric?.totalKg, 3420 + 4150);
  assert.equal(dryMetric?.totalKg, 2890 + 935);
  assert.equal(dryMetric?.batchCount, 2);

  // All 5 processing stages exist
  assert.equal(result.byStatus.length, 5);
  const processedStage = result.byStatus.find((s) => s.status === 'Processed');
  assert.equal(processedStage?.batchCount, 2);
  assert.equal(processedStage?.totalKg, 145 + 935);
  assert.equal(result.processedKg, 145 + 935);

  // Trends are chronologically sorted
  assert.deepEqual(
    result.trendsByDate.map((t) => t.date),
    ['2026-11-19', '2026-11-20', '2026-11-21']
  );

  // Old Town Market leads totalKg (4150 + 935 = 5085)
  assert.equal(result.byArea[0].area, 'Old Town Market');
  assert.equal(result.byArea[0].totalKg, 5085);
});

test('Collection Performance: derives counts & completion rate excluding cancelled and handles all-cancelled edge case', () => {
  const combinedSchedules = [
    ...DEMO_COLLECTION_SCHEDULES,
    USER_SCHEDULE_COLLECTED,
    USER_SCHEDULE_CANCELLED,
  ];
  const perf = computeCollectionPerformance(combinedSchedules);

  assert.equal(perf.totalScheduled, 7);
  assert.equal(perf.completedCount, 2); // SCH-2105 + USER_SCHEDULE_COLLECTED
  assert.equal(perf.pendingCount, 4); // 2 Assigned + 2 Scheduled
  assert.equal(perf.cancelledCount, 1);
  // Completion rate: 2 / (7 - 1) = 33.3%
  assert.equal(perf.completionRatePct, 33.3);
  assert.equal(perf.demoCount, 5);
  assert.equal(perf.userCount, 2);

  // Edge case: only cancelled schedules -> 0% completion without NaN
  const cancelledOnly = computeCollectionPerformance([USER_SCHEDULE_CANCELLED]);
  assert.equal(cancelledOnly.totalScheduled, 1);
  assert.equal(cancelledOnly.cancelledCount, 1);
  assert.equal(cancelledOnly.completionRatePct, 0);
});

test('Civic Report Analytics: calculates statuses, category distributions, and area breakdowns from shared reports', () => {
  const combinedReports = [...DEMO_CIVIC_REPORTS, USER_REPORT_CUSTOM];
  const analytics = computeCivicReportAnalytics(combinedReports);

  assert.equal(analytics.totalReports, 6);
  assert.equal(analytics.pendingSubmittedCount, 2); // ECO-1044 + USER_REPORT_CUSTOM
  assert.equal(analytics.underReviewCount, 2); // ECO-1042 + ECO-1045
  assert.equal(analytics.inProgressCount, 1); // ECO-1041
  assert.equal(analytics.resolvedCount, 1); // ECO-1043
  assert.equal(analytics.demoCount, 5);
  assert.equal(analytics.userCount, 1);
  assert.equal(analytics.resolutionRatePct, 16.7);

  const illegalDumping = analytics.byCategory.find(
    (c) => c.reportType === 'illegal_dumping'
  );
  assert.equal(illegalDumping?.count, 2);
});

test('Filters & Empty Datasets: separates demo vs user records, filters by area/date, and degrades gracefully on empty data', () => {
  const reports = [...DEMO_CIVIC_REPORTS, USER_REPORT_CUSTOM];
  const schedules = [...DEMO_COLLECTION_SCHEDULES, USER_SCHEDULE_COLLECTED];
  const batches = [...DEMO_WASTE_BATCHES, USER_BATCH];

  // User-only filter isolates user entries cleanly
  const userOnly = filterAnalyticsDatasets(reports, schedules, batches, {
    area: 'All',
    source: 'user',
  });
  assert.equal(userOnly.reports.length, 1);
  assert.equal(userOnly.schedules.length, 1);
  assert.equal(userOnly.batches.length, 1);

  // Date & Area filter
  const nov19Harbor = filterAnalyticsDatasets(reports, schedules, batches, {
    area: 'Harborview District',
    source: 'demo',
    startDate: '2026-11-19',
    endDate: '2026-11-19',
  });
  assert.equal(nov19Harbor.reports.length, 0);
  assert.equal(nov19Harbor.schedules.length, 0);
  assert.equal(nov19Harbor.batches.length, 1);

  // Empty dataset handling produces valid zeroed metrics without NaN
  const emptyHotspots = computeHotspotInsights([], 'All');
  assert.equal(emptyHotspots.totalComplaints, 0);
  assert.equal(emptyHotspots.highAttentionAreasCount, 0);

  const emptyWaste = computeWasteAnalytics([]);
  assert.equal(emptyWaste.totalBatches, 0);
  assert.equal(emptyWaste.totalEstimatedKg, 0);
  assert.ok(emptyWaste.byCategory.every((c) => c.sharePct === 0));

  const emptyCollection = computeCollectionPerformance([]);
  assert.equal(emptyCollection.totalScheduled, 0);
  assert.equal(emptyCollection.completionRatePct, 0);

  const emptyReports = computeCivicReportAnalytics([]);
  assert.equal(emptyReports.totalReports, 0);
  assert.equal(emptyReports.resolutionRatePct, 0);
});
