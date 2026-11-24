import { DEMO_WASTE_BATCHES } from '../data/municipalOperationsDemo';
import {
  WasteBatch,
  WasteBatchCreateInput,
  WasteBatchHistoryEntry,
  WasteBatchStatus,
  WasteBatchValidationResult,
  WasteCategoryId,
} from '../types/ecosort';
import { StorageLike } from './civicReportsStorage';

export const WASTE_BATCHES_STORAGE_KEY = 'ecosort_waste_batches_v1';
export const WASTE_BATCHES_CORRUPT_BACKUP_KEY =
  'ecosort_waste_batches_v1_corrupt_backup';
export const WASTE_BATCHES_UPDATED_EVENT = 'ecosort:waste-batches-updated';

export const WASTE_BATCH_STATUS_ORDER: WasteBatchStatus[] = [
  'Awaiting Collection',
  'Collected',
  'In Transit',
  'At Processing Facility',
  'Processed',
];

function getDefaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function emitBatchesUpdatedEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WASTE_BATCHES_UPDATED_EVENT));
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

function isValidBatchStatus(value: unknown): value is WasteBatchStatus {
  return (
    value === 'Awaiting Collection' ||
    value === 'Collected' ||
    value === 'In Transit' ||
    value === 'At Processing Facility' ||
    value === 'Processed'
  );
}

function normalizeStoredBatch(raw: unknown): WasteBatch | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  if (
    typeof r.id !== 'string' ||
    !r.id.trim() ||
    !isValidCategory(r.wasteCategory) ||
    typeof r.sourceArea !== 'string' ||
    typeof r.collectionDate !== 'string' ||
    typeof r.estimatedKg !== 'number' ||
    !Number.isFinite(r.estimatedKg) ||
    r.estimatedKg <= 0 ||
    !isValidBatchStatus(r.status) ||
    typeof r.createdAt !== 'string' ||
    typeof r.updatedAt !== 'string'
  ) {
    return null;
  }

  const historyRaw = Array.isArray(r.statusHistory) ? r.statusHistory : [];
  const statusHistory: WasteBatchHistoryEntry[] = historyRaw
    .filter((entry): entry is Record<string, unknown> =>
      Boolean(entry && typeof entry === 'object')
    )
    .map((entry, idx) => ({
      id:
        typeof entry.id === 'string' && entry.id
          ? entry.id
          : `bhist-${r.id}-${idx + 1}`,
      status: isValidBatchStatus(entry.status) ? entry.status : (r.status as WasteBatchStatus),
      timestamp:
        typeof entry.timestamp === 'string' && entry.timestamp
          ? entry.timestamp
          : (r.createdAt as string),
      actor:
        entry.actor === 'Municipal Admin' || entry.actor === 'System'
          ? entry.actor
          : 'System',
      note: typeof entry.note === 'string' ? entry.note : 'Batch status recorded.',
    }));

  if (statusHistory.length === 0) {
    statusHistory.push({
      id: `bhist-${r.id}-1`,
      status: r.status,
      timestamp: r.createdAt,
      actor: 'System',
      note: 'Initial batch status recorded.',
    });
  }

  return {
    id: r.id.trim(),
    wasteCategory: r.wasteCategory,
    sourceArea: r.sourceArea.trim(),
    collectionDate: r.collectionDate.trim(),
    estimatedKg: Math.round(r.estimatedKg),
    status: r.status,
    notes: typeof r.notes === 'string' && r.notes.trim() ? r.notes.trim() : undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    statusHistory,
    isDemoRecord: Boolean(r.isDemoRecord),
  };
}

export function sortBatchesNewestFirst(batches: WasteBatch[]): WasteBatch[] {
  return [...batches].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export interface LoadBatchesResult {
  batches: WasteBatch[];
  error: string | null;
  isCorrupted: boolean;
}

export function loadWasteBatches(
  storageArg?: StorageLike | null
): LoadBatchesResult {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  if (!storage) {
    return {
      batches: sortBatchesNewestFirst(DEMO_WASTE_BATCHES),
      error:
        'Browser localStorage is unavailable. Batch updates will not persist across refreshes.',
      isCorrupted: false,
    };
  }

  try {
    const raw = storage.getItem(WASTE_BATCHES_STORAGE_KEY);
    if (raw === null) {
      const seeded = sortBatchesNewestFirst(DEMO_WASTE_BATCHES);
      storage.setItem(WASTE_BATCHES_STORAGE_KEY, JSON.stringify(seeded));
      return { batches: seeded, error: null, isCorrupted: false };
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return {
        batches: [],
        error:
          'Stored waste batch data has an unexpected format. Existing data was preserved without overwriting.',
        isCorrupted: true,
      };
    }

    const normalized = parsed
      .map(normalizeStoredBatch)
      .filter((item): item is WasteBatch => item !== null);

    if (parsed.length > 0 && normalized.length === 0) {
      return {
        batches: [],
        error:
          'Stored waste batch records could not be verified. Existing data was left untouched.',
        isCorrupted: true,
      };
    }

    return {
      batches: sortBatchesNewestFirst(normalized),
      error: null,
      isCorrupted: false,
    };
  } catch {
    return {
      batches: [],
      error:
        'Unable to read stored waste batches from localStorage. Existing data was left untouched.',
      isCorrupted: true,
    };
  }
}

export function recoverCorruptedBatchesWithDemo(
  storageArg?: StorageLike | null
): LoadBatchesResult {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  if (!storage) {
    return {
      batches: sortBatchesNewestFirst(DEMO_WASTE_BATCHES),
      error: 'localStorage is unavailable.',
      isCorrupted: false,
    };
  }

  try {
    const existingRaw = storage.getItem(WASTE_BATCHES_STORAGE_KEY);
    if (existingRaw !== null) {
      storage.setItem(WASTE_BATCHES_CORRUPT_BACKUP_KEY, existingRaw);
    }
    const seeded = sortBatchesNewestFirst(DEMO_WASTE_BATCHES);
    storage.setItem(WASTE_BATCHES_STORAGE_KEY, JSON.stringify(seeded));
    emitBatchesUpdatedEvent();
    return { batches: seeded, error: null, isCorrupted: false };
  } catch {
    return {
      batches: [],
      error: 'Failed to initialize demo waste batches in localStorage.',
      isCorrupted: true,
    };
  }
}

export function restoreMissingDemoBatches(
  storageArg?: StorageLike | null
): { batches: WasteBatch[]; error: string | null } {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  if (!storage) {
    return {
      batches: sortBatchesNewestFirst(DEMO_WASTE_BATCHES),
      error: 'localStorage is unavailable.',
    };
  }

  const current = loadWasteBatches(storage);
  if (current.isCorrupted) {
    return { batches: [], error: current.error };
  }

  const existingIds = new Set(current.batches.map((b) => b.id));
  const missing = DEMO_WASTE_BATCHES.filter((d) => !existingIds.has(d.id));
  const merged = sortBatchesNewestFirst([...current.batches, ...missing]);

  try {
    storage.setItem(WASTE_BATCHES_STORAGE_KEY, JSON.stringify(merged));
    emitBatchesUpdatedEvent();
    return { batches: merged, error: null };
  } catch {
    return {
      batches: current.batches,
      error: 'Could not save restored demo batches.',
    };
  }
}

export function generateUniqueBatchId(
  existingIds: Set<string>,
  now: Date = new Date()
): string {
  const year = now.getFullYear();
  for (let i = 0; i < 50; i += 1) {
    const code = Math.floor(3000 + Math.random() * 6999);
    const candidate = `BAT-${year}-${code}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }
  let counter = 1;
  let fallback = `BAT-${year}-${Date.now().toString().slice(-5)}`;
  while (existingIds.has(fallback)) {
    fallback = `BAT-${year}-${Date.now().toString().slice(-5)}-${counter}`;
    counter += 1;
  }
  return fallback;
}

export function validateWasteBatchInput(
  input: WasteBatchCreateInput
): WasteBatchValidationResult {
  const fieldErrors: WasteBatchValidationResult['fieldErrors'] = {};

  if (!isValidCategory(input.wasteCategory)) {
    fieldErrors.wasteCategory = 'Select a valid waste category.';
  }

  if (input.sourceArea.trim().length < 2) {
    fieldErrors.sourceArea = 'Select or enter a valid source area or ward.';
  } else if (input.sourceArea.trim().length > 80) {
    fieldErrors.sourceArea = 'Source area must be 80 characters or fewer.';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.collectionDate.trim())) {
    fieldErrors.collectionDate = 'Choose a valid collection date.';
  }

  if (
    typeof input.estimatedKg !== 'number' ||
    !Number.isFinite(input.estimatedKg) ||
    input.estimatedKg <= 0 ||
    input.estimatedKg > 100000
  ) {
    fieldErrors.estimatedKg = 'Enter a valid quantity between 1 and 100,000 kg.';
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

export interface CreateBatchResult {
  batch?: WasteBatch;
  batches: WasteBatch[];
  error: string | null;
  fieldErrors?: WasteBatchValidationResult['fieldErrors'];
}

export function createWasteBatch(
  input: WasteBatchCreateInput,
  storageArg?: StorageLike | null,
  now: Date = new Date()
): CreateBatchResult {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  const validation = validateWasteBatchInput(input);
  const currentLoad = loadWasteBatches(storage);

  if (!validation.isValid) {
    return {
      batches: currentLoad.batches,
      error: 'Please correct the highlighted batch fields.',
      fieldErrors: validation.fieldErrors,
    };
  }

  if (currentLoad.isCorrupted) {
    return {
      batches: [],
      error:
        currentLoad.error ||
        'Batch storage is unreadable; creation halted to prevent overwriting saved records.',
    };
  }

  if (!storage) {
    return {
      batches: currentLoad.batches,
      error: 'Browser localStorage is unavailable.',
    };
  }

  const existingIds = new Set(currentLoad.batches.map((b) => b.id));
  const id = generateUniqueBatchId(existingIds, now);
  const timestamp = now.toISOString();

  const newBatch: WasteBatch = {
    id,
    wasteCategory: input.wasteCategory,
    sourceArea: input.sourceArea.trim(),
    collectionDate: input.collectionDate.trim(),
    estimatedKg: Math.round(input.estimatedKg),
    status: 'Awaiting Collection',
    notes: input.notes?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDemoRecord: false,
    statusHistory: [
      {
        id: `bhist-${id}-1`,
        status: 'Awaiting Collection',
        timestamp,
        actor: 'Municipal Admin',
        note: input.notes?.trim() || 'Batch registered and awaiting collection.',
      },
    ],
  };

  const nextBatches = sortBatchesNewestFirst([newBatch, ...currentLoad.batches]);

  try {
    storage.setItem(WASTE_BATCHES_STORAGE_KEY, JSON.stringify(nextBatches));
    emitBatchesUpdatedEvent();
    return {
      batch: newBatch,
      batches: nextBatches,
      error: null,
    };
  } catch {
    return {
      batches: currentLoad.batches,
      error: 'Failed to save new waste batch to localStorage.',
    };
  }
}

export interface UpdateBatchStatusResult {
  batch?: WasteBatch;
  batches: WasteBatch[];
  error: string | null;
}

export function updateWasteBatchStatus(
  batchId: string,
  nextStatus: WasteBatchStatus,
  noteRaw: string,
  storageArg?: StorageLike | null,
  now: Date = new Date()
): UpdateBatchStatusResult {
  const storage = storageArg === undefined ? getDefaultStorage() : storageArg;
  const currentLoad = loadWasteBatches(storage);

  if (currentLoad.isCorrupted) {
    return {
      batches: [],
      error:
        currentLoad.error ||
        'Batch storage could not be verified; update aborted.',
    };
  }

  if (!storage) {
    return {
      batches: currentLoad.batches,
      error: 'Browser localStorage is unavailable.',
    };
  }

  const existing = currentLoad.batches.find((b) => b.id === batchId);
  if (!existing) {
    return {
      batches: currentLoad.batches,
      error: `Batch "${batchId}" was not found.`,
    };
  }

  if (!isValidBatchStatus(nextStatus)) {
    return {
      batches: currentLoad.batches,
      error: 'Please choose a valid processing status.',
    };
  }

  const trimmedNote = noteRaw.trim();
  if (existing.status === nextStatus && !trimmedNote) {
    return {
      batches: currentLoad.batches,
      error: 'Choose a new status or enter a processing note before saving.',
    };
  }

  const timestamp = now.toISOString();
  const historyNote =
    trimmedNote || `Batch status updated from ${existing.status} to ${nextStatus}.`;

  const updatedBatch: WasteBatch = {
    ...existing,
    status: nextStatus,
    notes: trimmedNote || existing.notes,
    updatedAt: timestamp,
    statusHistory: [
      ...existing.statusHistory,
      {
        id: `bhist-${existing.id}-${existing.statusHistory.length + 1}`,
        status: nextStatus,
        timestamp,
        actor: 'Municipal Admin',
        note: historyNote,
      },
    ],
  };

  const nextBatches = sortBatchesNewestFirst(
    currentLoad.batches.map((b) => (b.id === batchId ? updatedBatch : b))
  );

  try {
    storage.setItem(WASTE_BATCHES_STORAGE_KEY, JSON.stringify(nextBatches));
    emitBatchesUpdatedEvent();
    return {
      batch: updatedBatch,
      batches: nextBatches,
      error: null,
    };
  } catch {
    return {
      batches: currentLoad.batches,
      error: 'Failed to save waste batch status update to localStorage.',
    };
  }
}
