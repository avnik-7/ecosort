import {
  MunicipalCategorySummary,
  MunicipalZoneStat,
} from '../types/ecosort';

export const DEMO_DATA_NOTICE = {
  badgeText: 'Demonstration Data',
  headline: 'Illustrative Municipal Figures (Milestone 1 Preview)',
  description:
    'All tonnage, compliance rates, and area-wise ward statistics shown in this portal are sample demonstration figures created to showcase municipal workflow visibility. No live sensors or external municipal feeds are connected.',
  reportingPeriod: 'Sample Monthly Snapshot · 6 Demonstration Wards',
};

export const MUNICIPAL_OVERVIEW_METRICS = {
  totalMonthlyTonnes: 1428,
  overallDiversionPct: 68.4,
  avgContaminationPct: 11.2,
  reportingZonesCount: 6,
  householdsCovered: 48600,
};

export const MUNICIPAL_CATEGORY_SUMMARIES: MunicipalCategorySummary[] = [
  {
    category: 'wet',
    monthlyTonnes: 742,
    shareOfTotalPct: 52.0,
    diversionOrRecoveryPct: 74.5,
    contaminationPct: 9.8,
    processingDestination: 'Regional Windrow Compost & Biogas Digester',
    operationalNote:
      'Highest volume stream; primary contamination remains thin plastic produce bags from apartment chutes.',
  },
  {
    category: 'dry',
    monthlyTonnes: 618,
    shareOfTotalPct: 43.3,
    diversionOrRecoveryPct: 63.2,
    contaminationPct: 13.4,
    processingDestination: 'Northside Material Recovery Facility (MRF)',
    operationalNote:
      'Strong cardboard recovery in commercial corridors; food-stained takeout packaging lowers paper grade.',
  },
  {
    category: 'ewaste',
    monthlyTonnes: 41,
    shareOfTotalPct: 2.9,
    diversionOrRecoveryPct: 89.0,
    contaminationPct: 4.1,
    processingDestination: 'Certified Electronics Dismantler & Metal Recovery',
    operationalNote:
      'Collected via weekend ward drop-off kiosks and participating electronics retail counters.',
  },
  {
    category: 'hazardous',
    monthlyTonnes: 27,
    shareOfTotalPct: 1.8,
    diversionOrRecoveryPct: 94.2,
    contaminationPct: 2.5,
    processingDestination: 'Licensed Household Hazardous Waste (HHW) Containment',
    operationalNote:
      'Requires strict taped-terminal intake for lithium batteries and sealed original chemical containers.',
  },
];

export const MUNICIPAL_ZONE_STATS: MunicipalZoneStat[] = [
  {
    id: 'ward-01',
    zoneCode: 'Z-01',
    zoneName: 'Maplewood North',
    wardType: 'Residential',
    householdsServed: 9400,
    dailyTonnes: 9.2,
    wetSharePct: 56,
    drySharePct: 40,
    ewasteKgWeek: 185,
    hazardousKgWeek: 110,
    segregationCompliancePct: 79,
    contaminationRatePct: 7.4,
    collectionSchedule: 'Wet: Daily · Dry: Tue / Fri · E-waste & HHW: 1st Sat Depot',
    operationalNote:
      'Consistent doorstep wet-waste separation; community garden workshops improved compost purity.',
  },
  {
    id: 'ward-02',
    zoneCode: 'Z-02',
    zoneName: 'Riverfront Commercial',
    wardType: 'Commercial',
    householdsServed: 5100,
    dailyTonnes: 11.4,
    wetSharePct: 42,
    drySharePct: 53,
    ewasteKgWeek: 340,
    hazardousKgWeek: 145,
    segregationCompliancePct: 66,
    contaminationRatePct: 14.8,
    collectionSchedule: 'Wet & Dry: Daily Morning · E-waste: Wed Commercial Pickup',
    operationalNote:
      'High corrugated cardboard volume; food-court beverage cups drive elevated dry-bin moisture.',
  },
  {
    id: 'ward-03',
    zoneCode: 'Z-03',
    zoneName: 'Cedar Heights',
    wardType: 'Residential',
    householdsServed: 10800,
    dailyTonnes: 8.6,
    wetSharePct: 58,
    drySharePct: 38,
    ewasteKgWeek: 160,
    hazardousKgWeek: 95,
    segregationCompliancePct: 82,
    contaminationRatePct: 6.1,
    collectionSchedule: 'Wet: Daily · Dry: Mon / Thu · HHW Mobile Van: 2nd Sun',
    operationalNote:
      'Highest demonstration compliance rate across all six wards following clear bin-labeling rollout.',
  },
  {
    id: 'ward-04',
    zoneCode: 'Z-04',
    zoneName: 'Old Town Market',
    wardType: 'Mixed',
    householdsServed: 8200,
    dailyTonnes: 9.8,
    wetSharePct: 55,
    drySharePct: 41,
    ewasteKgWeek: 150,
    hazardousKgWeek: 130,
    segregationCompliancePct: 61,
    contaminationRatePct: 16.5,
    collectionSchedule: 'Wet: Twice Daily · Dry: Mon / Wed / Sat · HHW: Depot Drop-off',
    operationalNote:
      'Produce market stalls generate dense organic loads; plastic carry-bag contamination requires targeted sorting checks.',
  },
  {
    id: 'ward-05',
    zoneCode: 'Z-05',
    zoneName: 'Greenbelt Tech Campus',
    wardType: 'Institutional',
    householdsServed: 6300,
    dailyTonnes: 4.9,
    wetSharePct: 39,
    drySharePct: 52,
    ewasteKgWeek: 490,
    hazardousKgWeek: 165,
    segregationCompliancePct: 76,
    contaminationRatePct: 8.9,
    collectionSchedule: 'Wet & Dry: Mon–Sat · E-waste Dock: Weekly Fri',
    operationalNote:
      'Highest per-capita E-waste return volume due to campus office hardware and peripheral replacement cycles.',
  },
  {
    id: 'ward-06',
    zoneCode: 'Z-06',
    zoneName: 'Harborview District',
    wardType: 'Mixed',
    householdsServed: 8800,
    dailyTonnes: 7.7,
    wetSharePct: 51,
    drySharePct: 45,
    ewasteKgWeek: 215,
    hazardousKgWeek: 120,
    segregationCompliancePct: 69,
    contaminationRatePct: 12.1,
    collectionSchedule: 'Wet: Daily · Dry: Wed / Sat · HHW & Battery Kiosk: Library Plaza',
    operationalNote:
      'Mid-rise apartment blocks benefit from centralized battery and cable drop boxes in lobby mailrooms.',
  },
];
