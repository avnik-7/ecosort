import { DEMO_CIVIC_REPORTS } from '../data/civicReportsDemo';
import {
  CivicReport,
  CivicReportCreateInput,
  CivicReportHistoryEntry,
  CivicReportStatus,
  CivicReportType,
  CivicReportValidationResult,
} from '../types/ecosort';

export const CIVIC_REPORTS_STORAGE_KEY = 'ecosort_civic_reports_v1';
export const CIVIC_REPORTS_CORRUPT_BACKUP_KEY = 'ecosort_civic_reports_v1_corrupt_backup';
export const CIVIC_REPORTS_UPDATED_EVENT = 'ecosort:civic-reports-updated';

export const CIVIC_REPORT_TYPE_META: Record<
  CivicReportType,
  { label: string; shortLabel: string; description: string }
> = {
  overflowing_bin: {
    label: 'Overflowing Bin',
    shortLabel: 'Overflowing Bin',
    description: 'Public or community bin full or spilling onto pavement',
  },
  illegal_dumping: {
    label: 'Illegal Dumping',
    shortLabel: 'Illegal Dumping',
    description: 'Unauthorized waste pile in alleys, lots, or streets',
  },
  missed_collection: {
    label: 'Missed Collection',
    shortLabel: 'Missed Pickup',
    description: 'Scheduled wet or dry curbside collection did not occur',
  },
  hazardous_waste: {
    label: 'Hazardous Waste',
    shortLabel: 'Hazardous',
    description: 'Unattended batteries, chemicals, paint, or medical sharps',
  },
  other: {
    label: 'Other Civic Issue',
    shortLabel: 'Other',
    description: 'Damaged bin lids, faded signage, or sorting station issue',
  },
};

export const CIVIC_REPORT_STATUS_ORDER: CivicReportStatus[] = [
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
];

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function getDefaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function emitReportsUpdatedEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CIVIC_REPORTS_UPDATED_EVENT));
  }
}

function isValidReportType(value: unknown): value is CivicReportType {
  return (
    value === 'overflowing_bin' ||
    value === 'illegal_dumping' ||
    value === 'missed_collection' ||
    value === 'hazardous_waste' ||
    value === 'other'
  );
}

function isValidStatus(value: unknown): value is CivicReportStatus {
  return (
    value === 'Submitted' ||
    value === 'Under Review' ||
    value === 'In Progress' ||
    value === 'Resolved'
  );
}

function normalizeStoredReport(raw: unknown): CivicReport | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;

  if (
    typeof record.id !== 'string' ||
    !record.id.trim() ||
    !isValidReportType(record.reportType) ||
    typeof record.area !== 'string' ||
    typeof record.locationDetail !== 'string' ||
    typeof record.description !== 'string' ||
    !isValidStatus(record.status) ||
    typeof record.createdAt !== 'string' ||
    typeof record.updatedAt !== 'string'
  ) {
    return null;
  }

  const historyRaw = Array.isArray(record.statusHistory)
    ? record.statusHistory
    : [];
  const statusHistory: CivicReportHistoryEntry[] = historyRaw
    .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === 'object'))
    .map((entry, idx) => ({
      id:
        typeof entry.id === 'string' && entry.id
          ? entry.id
          : `hist-${record.id}-${idx + 1}`,
      status: isValidStatus(entry.status) ? entry.status : record.status as CivicReportStatus,
      timestamp:
        typeof entry.timestamp === 'string' && entry.timestamp
          ? entry.timestamp
          : (record.createdAt as string),
      actor:
        entry.actor === 'Citizen' ||
        entry.actor === 'Municipal Admin' ||
        entry.actor === 'System'
          ? entry.actor
          : 'System',
      note: typeof entry.note === 'string' ? entry.note : 'Status recorded.',
    }));

  if (statusHistory.length === 0) {
    statusHistory.push({
      id: `hist-${record.id}-1`,
      status: record.status,
      timestamp: record.createdAt,
      actor: 'System',
      note: 'Initial status recorded.',
    });
  }

  return {
    id: record.id.trim(),
    reportType: record.reportType,
    area: record.area.trim(),
    locationDetail: record.locationDetail.trim(),
    description: record.description.trim(),
    contactOptional:
      typeof record.contactOptional === 'string' && record.contactOptional.trim()
        ? record.contactOptional.trim()
        : undefined,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    adminNote:
      typeof record.adminNote === 'string' && record.adminNote.trim()
        ? record.adminNote.trim()
        : undefined,
    statusHistory,
    isDemoRecord: Boolean(record.isDemoRecord),
  };
}

export function sortReportsNewestFirst(reports: CivicReport[]): CivicReport[] {
  return [...reports].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export interface LoadReportsResult {
  reports: CivicReport[];
  error: string | null;
  isCorrupted: boolean;
}

export function loadCivicReports(storageArg?: StorageLike | null): LoadReportsResult {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  if (!storage) {
    return {
      reports: sortReportsNewestFirst(DEMO_CIVIC_REPORTS),
      error:
        'Browser localStorage is unavailable. Changes cannot persist across refreshes.',
      isCorrupted: false,
    };
  }

  try {
    const raw = storage.getItem(CIVIC_REPORTS_STORAGE_KEY);
    if (raw === null) {
      const seeded = sortReportsNewestFirst(DEMO_CIVIC_REPORTS);
      storage.setItem(CIVIC_REPORTS_STORAGE_KEY, JSON.stringify(seeded));
      return { reports: seeded, error: null, isCorrupted: false };
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return {
        reports: [],
        error:
          'Stored report data has an unexpected format. Existing browser data was preserved without overwriting.',
        isCorrupted: true,
      };
    }

    const normalized = parsed
      .map(normalizeStoredReport)
      .filter((item): item is CivicReport => item !== null);

    // If raw array had entries but none could be parsed, treat as corrupted rather than silently wiping
    if (parsed.length > 0 && normalized.length === 0) {
      return {
        reports: [],
        error:
          'Stored report records could not be verified. Existing data was not overwritten.',
        isCorrupted: true,
      };
    }

    return {
      reports: sortReportsNewestFirst(normalized),
      error: null,
      isCorrupted: false,
    };
  } catch {
    return {
      reports: [],
      error:
        'Unable to read stored reports from localStorage. Existing browser data was left untouched.',
      isCorrupted: true,
    };
  }
}

export function recoverCorruptedStorageWithDemo(
  storageArg?: StorageLike | null
): LoadReportsResult {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  if (!storage) {
    return {
      reports: sortReportsNewestFirst(DEMO_CIVIC_REPORTS),
      error: 'localStorage is unavailable.',
      isCorrupted: false,
    };
  }

  try {
    const existingRaw = storage.getItem(CIVIC_REPORTS_STORAGE_KEY);
    if (existingRaw !== null) {
      storage.setItem(CIVIC_REPORTS_CORRUPT_BACKUP_KEY, existingRaw);
    }
    const seeded = sortReportsNewestFirst(DEMO_CIVIC_REPORTS);
    storage.setItem(CIVIC_REPORTS_STORAGE_KEY, JSON.stringify(seeded));
    emitReportsUpdatedEvent();
    return { reports: seeded, error: null, isCorrupted: false };
  } catch {
    return {
      reports: [],
      error: 'Failed to initialize demo reports in localStorage.',
      isCorrupted: true,
    };
  }
}

export function restoreMissingDemoReports(
  storageArg?: StorageLike | null
): { reports: CivicReport[]; error: string | null } {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  if (!storage) {
    return {
      reports: sortReportsNewestFirst(DEMO_CIVIC_REPORTS),
      error: 'localStorage is unavailable.',
    };
  }

  const current = loadCivicReports(storage);
  if (current.isCorrupted) {
    return { reports: [], error: current.error };
  }

  const existingIds = new Set(current.reports.map((r) => r.id));
  const missingDemo = DEMO_CIVIC_REPORTS.filter((demo) => !existingIds.has(demo.id));
  const merged = sortReportsNewestFirst([...current.reports, ...missingDemo]);

  try {
    storage.setItem(CIVIC_REPORTS_STORAGE_KEY, JSON.stringify(merged));
    emitReportsUpdatedEvent();
    return { reports: merged, error: null };
  } catch {
    return {
      reports: current.reports,
      error: 'Could not save restored demo reports to localStorage.',
    };
  }
}

export function generateUniqueReportId(
  existingIds: Set<string>,
  now: Date = new Date()
): string {
  const year = now.getFullYear();
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const candidate = `ECO-${year}-${randomNum}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }
  const fallbackSuffix = `${Date.now().toString().slice(-6)}`;
  let fallback = `ECO-${year}-${fallbackSuffix}`;
  let counter = 1;
  while (existingIds.has(fallback)) {
    fallback = `ECO-${year}-${fallbackSuffix}-${counter}`;
    counter += 1;
  }
  return fallback;
}

export function validateReportInput(
  input: CivicReportCreateInput
): CivicReportValidationResult {
  const fieldErrors: CivicReportValidationResult['fieldErrors'] = {};

  if (!isValidReportType(input.reportType)) {
    fieldErrors.reportType = 'Please select a valid report category.';
  }

  const area = input.area.trim();
  if (area.length < 2) {
    fieldErrors.area = 'Please enter or select an area / ward (at least 2 characters).';
  } else if (area.length > 80) {
    fieldErrors.area = 'Area name must be 80 characters or fewer.';
  }

  const locationDetail = input.locationDetail.trim();
  if (locationDetail.length < 4) {
    fieldErrors.locationDetail =
      'Please enter a specific street, landmark, or bin location (at least 4 characters).';
  } else if (locationDetail.length > 160) {
    fieldErrors.locationDetail = 'Location details must be 160 characters or fewer.';
  }

  const description = input.description.trim();
  if (description.length < 12) {
    fieldErrors.description =
      'Please provide a concise description (at least 12 characters) so crews can locate and resolve the issue.';
  } else if (description.length > 1000) {
    fieldErrors.description = 'Description must be 1000 characters or fewer.';
  }

  const contact = input.contactOptional?.trim() ?? '';
  if (contact.length > 0) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[+]?[\d\s().-]{7,20}$/;
    if (!emailPattern.test(contact) && !phonePattern.test(contact)) {
      fieldErrors.contactOptional =
        'Enter a valid email address or phone number, or leave this optional field blank.';
    }
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

export interface CreateReportResult {
  report?: CivicReport;
  reports: CivicReport[];
  error: string | null;
  fieldErrors?: CivicReportValidationResult['fieldErrors'];
}

export function createCivicReport(
  input: CivicReportCreateInput,
  storageArg?: StorageLike | null,
  now: Date = new Date()
): CreateReportResult {
  const validation = validateReportInput(input);
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;

  const currentLoad = loadCivicReports(storage);
  if (!validation.isValid) {
    return {
      reports: currentLoad.reports,
      error: 'Please correct the highlighted fields before submitting.',
      fieldErrors: validation.fieldErrors,
    };
  }

  if (currentLoad.isCorrupted) {
    return {
      reports: [],
      error:
        currentLoad.error ||
        'Existing report storage is unreadable; submission halted to prevent overwriting saved records.',
    };
  }

  if (!storage) {
    return {
      reports: currentLoad.reports,
      error: 'Browser localStorage is unavailable; cannot persist new report.',
    };
  }

  const existingIds = new Set(currentLoad.reports.map((r) => r.id));
  const id = generateUniqueReportId(existingIds, now);
  const timestamp = now.toISOString();

  const newReport: CivicReport = {
    id,
    reportType: input.reportType,
    area: input.area.trim(),
    locationDetail: input.locationDetail.trim(),
    description: input.description.trim(),
    contactOptional: input.contactOptional?.trim() || undefined,
    status: 'Submitted',
    createdAt: timestamp,
    updatedAt: timestamp,
    isDemoRecord: false,
    statusHistory: [
      {
        id: `hist-${id}-1`,
        status: 'Submitted',
        timestamp,
        actor: 'Citizen',
        note: 'Report submitted via EcoSort Citizen Portal.',
      },
    ],
  };

  const nextReports = sortReportsNewestFirst([newReport, ...currentLoad.reports]);

  try {
    storage.setItem(CIVIC_REPORTS_STORAGE_KEY, JSON.stringify(nextReports));
    emitReportsUpdatedEvent();
    return {
      report: newReport,
      reports: nextReports,
      error: null,
    };
  } catch {
    return {
      reports: currentLoad.reports,
      error:
        'Could not save your report to browser storage (storage may be full or restricted).',
    };
  }
}

export interface UpdateReportStatusResult {
  report?: CivicReport;
  reports: CivicReport[];
  error: string | null;
}

export function updateCivicReportStatus(
  reportId: string,
  nextStatus: CivicReportStatus,
  adminNoteRaw: string,
  storageArg?: StorageLike | null,
  now: Date = new Date()
): UpdateReportStatusResult {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  const currentLoad = loadCivicReports(storage);

  if (currentLoad.isCorrupted) {
    return {
      reports: [],
      error:
        currentLoad.error ||
        'Cannot update because existing report storage could not be verified.',
    };
  }

  if (!storage) {
    return {
      reports: currentLoad.reports,
      error: 'Browser localStorage is unavailable; cannot save status update.',
    };
  }

  const existing = currentLoad.reports.find((r) => r.id === reportId);
  if (!existing) {
    return {
      reports: currentLoad.reports,
      error: `Report "${reportId}" was not found.`,
    };
  }

  const trimmedNote = adminNoteRaw.trim();
  if (!isValidStatus(nextStatus)) {
    return {
      reports: currentLoad.reports,
      error: 'Please choose a valid report status.',
    };
  }

  if (nextStatus === 'Resolved' && trimmedNote.length < 6) {
    return {
      reports: currentLoad.reports,
      error:
        'Please include a brief resolution note (at least 6 characters) before marking a report as Resolved.',
    };
  }

  if (
    existing.status === nextStatus &&
    trimmedNote === (existing.adminNote ?? '')
  ) {
    return {
      reports: currentLoad.reports,
      error: 'Select a new status or enter an updated administrative note before saving.',
    };
  }

  const timestamp = now.toISOString();
  const historyNote =
    trimmedNote ||
    `Status updated from ${existing.status} to ${nextStatus}.`;

  const updatedReport: CivicReport = {
    ...existing,
    status: nextStatus,
    updatedAt: timestamp,
    adminNote: trimmedNote || existing.adminNote,
    statusHistory: [
      ...existing.statusHistory,
      {
        id: `hist-${existing.id}-${existing.statusHistory.length + 1}`,
        status: nextStatus,
        timestamp,
        actor: 'Municipal Admin',
        note: historyNote,
      },
    ],
  };

  const nextReports = sortReportsNewestFirst(
    currentLoad.reports.map((r) => (r.id === reportId ? updatedReport : r))
  );

  try {
    storage.setItem(CIVIC_REPORTS_STORAGE_KEY, JSON.stringify(nextReports));
    emitReportsUpdatedEvent();
    return {
      report: updatedReport,
      reports: nextReports,
      error: null,
    };
  } catch {
    return {
      reports: currentLoad.reports,
      error: 'Failed to save report status update to localStorage.',
    };
  }
}
