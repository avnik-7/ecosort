import {
  DEMO_COLLECTION_FLEET,
  DEMO_COLLECTION_SCHEDULES,
} from '../data/municipalOperationsDemo';
import {
  CollectionPriority,
  CollectionSchedule,
  CollectionScheduleCreateInput,
  CollectionScheduleStatus,
  CollectionScheduleValidationResult,
  WasteCategoryId,
} from '../types/ecosort';
import { StorageLike } from './civicReportsStorage';

export const COLLECTION_SCHEDULES_STORAGE_KEY = 'ecosort_collection_schedules_v1';
export const COLLECTION_SCHEDULES_CORRUPT_BACKUP_KEY =
  'ecosort_collection_schedules_v1_corrupt_backup';
export const COLLECTION_SCHEDULES_UPDATED_EVENT =
  'ecosort:collection-schedules-updated';

export const COLLECTION_PRIORITIES: CollectionPriority[] = [
  'Low',
  'Medium',
  'High',
];

export const COLLECTION_SCHEDULE_STATUSES: CollectionScheduleStatus[] = [
  'Scheduled',
  'Assigned',
  'Collected',
  'Cancelled',
];

function getDefaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function emitSchedulesUpdatedEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COLLECTION_SCHEDULES_UPDATED_EVENT));
  }
}

function isValidCategory(value: unknown): value is WasteCategoryId {
  return (
    value === 'wet' ||
    value === 'dry' ||
    value === 'ewaste' ||
    value === 'hazardous'
  );
}

function isValidPriority(value: unknown): value is CollectionPriority {
  return value === 'Low' || value === 'Medium' || value === 'High';
}

function isValidScheduleStatus(value: unknown): value is CollectionScheduleStatus {
  return (
    value === 'Scheduled' ||
    value === 'Assigned' ||
    value === 'Collected' ||
    value === 'Cancelled'
  );
}

function normalizeStoredSchedule(raw: unknown): CollectionSchedule | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  if (
    typeof r.id !== 'string' ||
    !r.id.trim() ||
    typeof r.area !== 'string' ||
    !isValidCategory(r.wasteCategory) ||
    typeof r.scheduledDate !== 'string' ||
    typeof r.scheduledTime !== 'string' ||
    typeof r.assignedFleetId !== 'string' ||
    typeof r.assignedTeamLabel !== 'string' ||
    !isValidPriority(r.priority) ||
    !isValidScheduleStatus(r.status) ||
    typeof r.createdAt !== 'string' ||
    typeof r.updatedAt !== 'string'
  ) {
    return null;
  }

  return {
    id: r.id.trim(),
    area: r.area.trim(),
    wasteCategory: r.wasteCategory,
    scheduledDate: r.scheduledDate.trim(),
    scheduledTime: r.scheduledTime.trim(),
    assignedFleetId: r.assignedFleetId.trim(),
    assignedTeamLabel: r.assignedTeamLabel.trim(),
    priority: r.priority,
    status: r.status,
    notes: typeof r.notes === 'string' && r.notes.trim() ? r.notes.trim() : undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    isDemoRecord: Boolean(r.isDemoRecord),
  };
}

export function sortSchedules(schedules: CollectionSchedule[]): CollectionSchedule[] {
  return [...schedules].sort((a, b) => {
    const dtA = `${a.scheduledDate}T${a.scheduledTime}`;
    const dtB = `${b.scheduledDate}T${b.scheduledTime}`;
    if (dtA !== dtB) {
      return dtB.localeCompare(dtA);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export interface LoadSchedulesResult {
  schedules: CollectionSchedule[];
  error: string | null;
  isCorrupted: boolean;
}

export function loadCollectionSchedules(
  storageArg?: StorageLike | null
): LoadSchedulesResult {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  if (!storage) {
    return {
      schedules: sortSchedules(DEMO_COLLECTION_SCHEDULES),
      error:
        'Browser localStorage is unavailable. Collection schedules will not persist across refreshes.',
      isCorrupted: false,
    };
  }

  try {
    const raw = storage.getItem(COLLECTION_SCHEDULES_STORAGE_KEY);
    if (raw === null) {
      const seeded = sortSchedules(DEMO_COLLECTION_SCHEDULES);
      storage.setItem(COLLECTION_SCHEDULES_STORAGE_KEY, JSON.stringify(seeded));
      return { schedules: seeded, error: null, isCorrupted: false };
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return {
        schedules: [],
        error:
          'Stored collection schedule data is unreadable. Existing data was preserved without overwriting.',
        isCorrupted: true,
      };
    }

    const normalized = parsed
      .map(normalizeStoredSchedule)
      .filter((item): item is CollectionSchedule => item !== null);

    if (parsed.length > 0 && normalized.length === 0) {
      return {
        schedules: [],
        error:
          'Stored collection schedule records could not be validated. Existing data was left untouched.',
        isCorrupted: true,
      };
    }

    return {
      schedules: sortSchedules(normalized),
      error: null,
      isCorrupted: false,
    };
  } catch {
    return {
      schedules: [],
      error:
        'Unable to parse stored collection schedules from localStorage. Existing data was left untouched.',
      isCorrupted: true,
    };
  }
}

export function recoverCorruptedSchedulesWithDemo(
  storageArg?: StorageLike | null
): LoadSchedulesResult {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  if (!storage) {
    return {
      schedules: sortSchedules(DEMO_COLLECTION_SCHEDULES),
      error: 'localStorage is unavailable.',
      isCorrupted: false,
    };
  }

  try {
    const existingRaw = storage.getItem(COLLECTION_SCHEDULES_STORAGE_KEY);
    if (existingRaw !== null) {
      storage.setItem(COLLECTION_SCHEDULES_CORRUPT_BACKUP_KEY, existingRaw);
    }
    const seeded = sortSchedules(DEMO_COLLECTION_SCHEDULES);
    storage.setItem(COLLECTION_SCHEDULES_STORAGE_KEY, JSON.stringify(seeded));
    emitSchedulesUpdatedEvent();
    return { schedules: seeded, error: null, isCorrupted: false };
  } catch {
    return {
      schedules: [],
      error: 'Failed to initialize demo collection schedules in localStorage.',
      isCorrupted: true,
    };
  }
}

export function restoreMissingDemoSchedules(
  storageArg?: StorageLike | null
): { schedules: CollectionSchedule[]; error: string | null } {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  if (!storage) {
    return {
      schedules: sortSchedules(DEMO_COLLECTION_SCHEDULES),
      error: 'localStorage is unavailable.',
    };
  }

  const current = loadCollectionSchedules(storage);
  if (current.isCorrupted) {
    return { schedules: [], error: current.error };
  }

  const existingIds = new Set(current.schedules.map((s) => s.id));
  const missing = DEMO_COLLECTION_SCHEDULES.filter((d) => !existingIds.has(d.id));
  const merged = sortSchedules([...current.schedules, ...missing]);

  try {
    storage.setItem(COLLECTION_SCHEDULES_STORAGE_KEY, JSON.stringify(merged));
    emitSchedulesUpdatedEvent();
    return { schedules: merged, error: null };
  } catch {
    return {
      schedules: current.schedules,
      error: 'Could not save restored demo schedules.',
    };
  }
}

export function generateUniqueScheduleId(
  existingIds: Set<string>,
  now: Date = new Date()
): string {
  const year = now.getFullYear();
  for (let i = 0; i < 50; i += 1) {
    const code = Math.floor(2000 + Math.random() * 7999);
    const candidate = `SCH-${year}-${code}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }
  let counter = 1;
  let fallback = `SCH-${year}-${Date.now().toString().slice(-5)}`;
  while (existingIds.has(fallback)) {
    fallback = `SCH-${year}-${Date.now().toString().slice(-5)}-${counter}`;
    counter += 1;
  }
  return fallback;
}

export function validateCollectionScheduleInput(
  input: CollectionScheduleCreateInput
): CollectionScheduleValidationResult {
  const fieldErrors: CollectionScheduleValidationResult['fieldErrors'] = {};

  if (input.area.trim().length < 2) {
    fieldErrors.area = 'Select or enter a valid ward or area name.';
  } else if (input.area.trim().length > 80) {
    fieldErrors.area = 'Area name must be 80 characters or fewer.';
  }

  if (!isValidCategory(input.wasteCategory)) {
    fieldErrors.wasteCategory = 'Select a valid waste category.';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.scheduledDate.trim())) {
    fieldErrors.scheduledDate = 'Choose a valid collection date.';
  }

  if (!/^\d{2}:\d{2}$/.test(input.scheduledTime.trim())) {
    fieldErrors.scheduledTime = 'Choose a valid collection time.';
  }

  const fleetMatch = DEMO_COLLECTION_FLEET.find(
    (f) => f.id === input.assignedFleetId
  );
  if (!fleetMatch) {
    fieldErrors.assignedFleetId = 'Select a demonstration vehicle or collection team.';
  }

  if (!isValidPriority(input.priority)) {
    fieldErrors.priority = 'Select Low, Medium, or High priority.';
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

export interface CreateScheduleResult {
  schedule?: CollectionSchedule;
  schedules: CollectionSchedule[];
  error: string | null;
  fieldErrors?: CollectionScheduleValidationResult['fieldErrors'];
}

export function createCollectionSchedule(
  input: CollectionScheduleCreateInput,
  storageArg?: StorageLike | null,
  now: Date = new Date()
): CreateScheduleResult {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  const validation = validateCollectionScheduleInput(input);
  const currentLoad = loadCollectionSchedules(storage);

  if (!validation.isValid) {
    return {
      schedules: currentLoad.schedules,
      error: 'Please correct the highlighted schedule fields.',
      fieldErrors: validation.fieldErrors,
    };
  }

  if (currentLoad.isCorrupted) {
    return {
      schedules: [],
      error:
        currentLoad.error ||
        'Schedule storage is unreadable; creation halted to protect existing data.',
    };
  }

  if (!storage) {
    return {
      schedules: currentLoad.schedules,
      error: 'Browser localStorage is unavailable.',
    };
  }

  const fleet = DEMO_COLLECTION_FLEET.find((f) => f.id === input.assignedFleetId)!;
  const existingIds = new Set(currentLoad.schedules.map((s) => s.id));
  const id = generateUniqueScheduleId(existingIds, now);
  const timestamp = now.toISOString();

  const newSchedule: CollectionSchedule = {
    id,
    area: input.area.trim(),
    wasteCategory: input.wasteCategory,
    scheduledDate: input.scheduledDate.trim(),
    scheduledTime: input.scheduledTime.trim(),
    assignedFleetId: fleet.id,
    assignedTeamLabel: `${fleet.vehicleCode} · ${fleet.teamName} (Demo Team)`,
    priority: input.priority,
    status: 'Scheduled',
    notes: input.notes?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDemoRecord: false,
  };

  const nextSchedules = sortSchedules([newSchedule, ...currentLoad.schedules]);

  try {
    storage.setItem(COLLECTION_SCHEDULES_STORAGE_KEY, JSON.stringify(nextSchedules));
    emitSchedulesUpdatedEvent();
    return {
      schedule: newSchedule,
      schedules: nextSchedules,
      error: null,
    };
  } catch {
    return {
      schedules: currentLoad.schedules,
      error: 'Failed to save new collection schedule to localStorage.',
    };
  }
}

export interface UpdateScheduleResult {
  schedule?: CollectionSchedule;
  schedules: CollectionSchedule[];
  error: string | null;
}

export function updateCollectionSchedule(
  scheduleId: string,
  updates: {
    status: CollectionScheduleStatus;
    assignedFleetId: string;
    priority: CollectionPriority;
    notes?: string;
  },
  storageArg?: StorageLike | null,
  now: Date = new Date()
): UpdateScheduleResult {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  const currentLoad = loadCollectionSchedules(storage);

  if (currentLoad.isCorrupted) {
    return {
      schedules: [],
      error:
        currentLoad.error ||
        'Schedule storage could not be verified; update aborted.',
    };
  }

  if (!storage) {
    return {
      schedules: currentLoad.schedules,
      error: 'Browser localStorage is unavailable.',
    };
  }

  const existing = currentLoad.schedules.find((s) => s.id === scheduleId);
  if (!existing) {
    return {
      schedules: currentLoad.schedules,
      error: `Schedule "${scheduleId}" was not found.`,
    };
  }

  if (!isValidScheduleStatus(updates.status)) {
    return {
      schedules: currentLoad.schedules,
      error: 'Select a valid collection status.',
    };
  }

  if (!isValidPriority(updates.priority)) {
    return {
      schedules: currentLoad.schedules,
      error: 'Select a valid priority.',
    };
  }

  const fleet = DEMO_COLLECTION_FLEET.find((f) => f.id === updates.assignedFleetId);
  if (!fleet) {
    return {
      schedules: currentLoad.schedules,
      error: 'Select a valid demonstration team/vehicle.',
    };
  }

  const trimmedNotes = updates.notes?.trim() || undefined;
  const updatedSchedule: CollectionSchedule = {
    ...existing,
    status: updates.status,
    priority: updates.priority,
    assignedFleetId: fleet.id,
    assignedTeamLabel: `${fleet.vehicleCode} · ${fleet.teamName} (Demo Team)`,
    notes: trimmedNotes,
    updatedAt: now.toISOString(),
  };

  const nextSchedules = sortSchedules(
    currentLoad.schedules.map((s) => (s.id === scheduleId ? updatedSchedule : s))
  );

  try {
    storage.setItem(COLLECTION_SCHEDULES_STORAGE_KEY, JSON.stringify(nextSchedules));
    emitSchedulesUpdatedEvent();
    return {
      schedule: updatedSchedule,
      schedules: nextSchedules,
      error: null,
    };
  } catch {
    return {
      schedules: currentLoad.schedules,
      error: 'Failed to save collection schedule update to localStorage.',
    };
  }
}
