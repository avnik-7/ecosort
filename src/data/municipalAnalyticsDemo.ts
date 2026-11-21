export interface DemoHistoricalHotspotPoint {
  periodLabel: string;
  complaintsByArea: Record<string, number>;
}

export const HOTSPOT_DEMO_NOTICE = {
  headline: 'Hotspot Insights · Based on Demonstration & Local Records',
  description:
    'Complaint counts, recurring hotspot flags, and historical trend baselines reflect demonstration records plus any locally saved reports in this browser. Rankings use deterministic count rules—no AI predictions, live GPS, or scientifically validated forecasting.',
};

export const ANALYTICS_DEMO_NOTICE = {
  headline: 'Municipal Analytics · Derived from Shared Browser Records',
  description:
    'All waste volumes, collection completion rates, and civic report distributions are calculated directly from stored demonstration and user-created records in localStorage. Filter by record source to separate demonstration samples from your own entries.',
};

// Clearly labeled demonstration historical weekly complaint baseline (Weeks 1–4)
export const DEMO_HISTORICAL_COMPLAINT_TRENDS: DemoHistoricalHotspotPoint[] = [
  {
    periodLabel: 'Oct W4 (Demo)',
    complaintsByArea: {
      'Old Town Market': 3,
      'Riverfront Commercial': 2,
      'Harborview District': 1,
      'Maplewood North': 1,
      'Cedar Heights': 1,
      'Greenbelt Tech Campus': 0,
    },
  },
  {
    periodLabel: 'Nov W1 (Demo)',
    complaintsByArea: {
      'Old Town Market': 4,
      'Riverfront Commercial': 2,
      'Harborview District': 2,
      'Maplewood North': 1,
      'Cedar Heights': 0,
      'Greenbelt Tech Campus': 1,
    },
  },
  {
    periodLabel: 'Nov W2 (Demo)',
    complaintsByArea: {
      'Old Town Market': 3,
      'Riverfront Commercial': 3,
      'Harborview District': 2,
      'Maplewood North': 1,
      'Cedar Heights': 1,
      'Greenbelt Tech Campus': 0,
    },
  },
  {
    periodLabel: 'Nov W3 (Demo)',
    complaintsByArea: {
      'Old Town Market': 4,
      'Riverfront Commercial': 3,
      'Harborview District': 2,
      'Maplewood North': 2,
      'Cedar Heights': 1,
      'Greenbelt Tech Campus': 1,
    },
  },
];
