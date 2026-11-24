import { CivicReport } from '../types/ecosort';

export const DEMO_CIVIC_REPORTS: CivicReport[] = [
  {
    id: 'ECO-2026-1041',
    reportType: 'overflowing_bin',
    area: 'Old Town Market',
    locationDetail: 'Corner of Market Lane & North Gate Produce Stall #4',
    description:
      'Green wet-waste bin at the market entrance is overflowing onto the footpath after morning produce deliveries.',
    contactOptional: 'market-association@example.org',
    status: 'In Progress',
    createdAt: '2026-11-18T08:15:00.000Z',
    updatedAt: '2026-11-19T10:30:00.000Z',
    adminNote:
      'Dispatch crew scheduled for extra midday organic pickup and bin capacity check.',
    isDemoRecord: true,
    statusHistory: [
      {
        id: 'hist-1041-1',
        status: 'Submitted',
        timestamp: '2026-11-18T08:15:00.000Z',
        actor: 'Citizen',
        note: 'Report submitted by resident/vendor.',
      },
      {
        id: 'hist-1041-2',
        status: 'Under Review',
        timestamp: '2026-11-18T11:20:00.000Z',
        actor: 'Municipal Admin',
        note: 'Verified high organic load from morning produce stalls.',
      },
      {
        id: 'hist-1041-3',
        status: 'In Progress',
        timestamp: '2026-11-19T10:30:00.000Z',
        actor: 'Municipal Admin',
        note: 'Dispatch crew scheduled for extra midday organic pickup and bin capacity check.',
      },
    ],
  },
  {
    id: 'ECO-2026-1042',
    reportType: 'illegal_dumping',
    area: 'Riverfront Commercial',
    locationDetail: 'Service alley behind Pier 3 Warehouse',
    description:
      'Unbagged renovation debris, broken pallets, and mixed plastic wrapping dumped beside the commercial loading bay.',
    status: 'Under Review',
    createdAt: '2026-11-19T09:40:00.000Z',
    updatedAt: '2026-11-19T14:05:00.000Z',
    adminNote:
      'Assigned to Ward 02 field inspector to document volume and arrange bulk clearance.',
    isDemoRecord: true,
    statusHistory: [
      {
        id: 'hist-1042-1',
        status: 'Submitted',
        timestamp: '2026-11-19T09:40:00.000Z',
        actor: 'Citizen',
        note: 'Report submitted.',
      },
      {
        id: 'hist-1042-2',
        status: 'Under Review',
        timestamp: '2026-11-19T14:05:00.000Z',
        actor: 'Municipal Admin',
        note: 'Assigned to Ward 02 field inspector to document volume and arrange bulk clearance.',
      },
    ],
  },
  {
    id: 'ECO-2026-1043',
    reportType: 'missed_collection',
    area: 'Maplewood North',
    locationDetail: '420 Birchwood Avenue, Curbside Dry Stream',
    description:
      'Scheduled Friday dry recyclables pickup did not pass down the cul-de-sac; six flattened cardboard bundles remain curbside.',
    contactOptional: '+1 (555) 014-8820',
    status: 'Resolved',
    createdAt: '2026-11-15T16:20:00.000Z',
    updatedAt: '2026-11-16T11:10:00.000Z',
    adminNote:
      'Recovery truck completed pickup at 10:45 AM; route map updated for relief driver.',
    isDemoRecord: true,
    statusHistory: [
      {
        id: 'hist-1043-1',
        status: 'Submitted',
        timestamp: '2026-11-15T16:20:00.000Z',
        actor: 'Citizen',
        note: 'Missed collection reported.',
      },
      {
        id: 'hist-1043-2',
        status: 'Under Review',
        timestamp: '2026-11-15T17:00:00.000Z',
        actor: 'Municipal Admin',
        note: 'Checked GPS truck log; relief driver skipped cul-de-sac turn.',
      },
      {
        id: 'hist-1043-3',
        status: 'Resolved',
        timestamp: '2026-11-16T11:10:00.000Z',
        actor: 'Municipal Admin',
        note: 'Recovery truck completed pickup at 10:45 AM; route map updated for relief driver.',
      },
    ],
  },
  {
    id: 'ECO-2026-1044',
    reportType: 'hazardous_waste',
    area: 'Harborview District',
    locationDetail: 'Library Plaza Battery & Drop-off Shelter',
    description:
      'Two cracked lead-acid/lithium battery packs left outside the locked hazardous intake locker instead of inside the slot.',
    status: 'Submitted',
    createdAt: '2026-11-20T07:50:00.000Z',
    updatedAt: '2026-11-20T07:50:00.000Z',
    isDemoRecord: true,
    statusHistory: [
      {
        id: 'hist-1044-1',
        status: 'Submitted',
        timestamp: '2026-11-20T07:50:00.000Z',
        actor: 'Citizen',
        note: 'Urgent hazardous drop-off alert submitted.',
      },
    ],
  },
  {
    id: 'ECO-2026-1045',
    reportType: 'other',
    area: 'Cedar Heights',
    locationDetail: 'Cedar Park East Entrance Bin Pair',
    description:
      'Labels on the public Dry and Wet bins have faded in sunlight; visitors are confusing paper coffee cups and food scraps.',
    status: 'Under Review',
    createdAt: '2026-11-19T13:15:00.000Z',
    updatedAt: '2026-11-19T15:45:00.000Z',
    adminNote: 'Signage replacement request forwarded to Parks Maintenance.',
    isDemoRecord: true,
    statusHistory: [
      {
        id: 'hist-1045-1',
        status: 'Submitted',
        timestamp: '2026-11-19T13:15:00.000Z',
        actor: 'Citizen',
        note: 'Signage wear reported.',
      },
      {
        id: 'hist-1045-2',
        status: 'Under Review',
        timestamp: '2026-11-19T15:45:00.000Z',
        actor: 'Municipal Admin',
        note: 'Signage replacement request forwarded to Parks Maintenance.',
      },
    ],
  },
];
