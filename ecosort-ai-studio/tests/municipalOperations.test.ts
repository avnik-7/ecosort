import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEMO_COLLECTION_FLEET,
  DEMO_COLLECTION_SCHEDULES,
  DEMO_WASTE_BATCHES,
} from '../src/data/municipalOperationsDemo';
import {
  CIVIC_REPORTS_STORAGE_KEY,
  loadCivicReports,
  StorageLike,
} from '../src/utils/civicReportsStorage';
import {
  COLLECTION_SCHEDULES_CORRUPT_BACKUP_KEY,
  COLLECTION_SCHEDULES_STORAGE_KEY,
  createCollectionSchedule,
  loadCollectionSchedules,
  recoverCorruptedSchedulesWithDemo,
  updateCollectionSchedule,
  validateCollectionScheduleInput,
} from '../src/utils/collectionPlannerStorage';
import {
  createWasteBatch,
  loadWasteBatches,
  recoverCorruptedBatchesWithDemo,
  updateWasteBatchStatus,
  validateWasteBatchInput,
  WASTE_BATCHES_CORRUPT_BACKUP_KEY,
  WASTE_BATCHES_STORAGE_KEY,
} from '../src/utils/wasteBatchStorage';

class MemoryStorage implements StorageLike {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

test('Collection Planner: seeds demo schedules, validates inputs, creates, updates, filters, and persists across reload', () => {
  const storage = new MemoryStorage();

  // Also initialize civic reports to prove storage isolation
  const reportsBefore = loadCivicReports(storage);
  const reportsSnapshot = storage.getItem(CIVIC_REPORTS_STORAGE_KEY);

  const initial = loadCollectionSchedules(storage);
  assert.equal(initial.error, null);
  assert.equal(initial.schedules.length, DEMO_COLLECTION_SCHEDULES.length);
  assert.ok(initial.schedules.every((s) => s.isDemoRecord === true));

  // Validation rejects invalid schedule input
  const invalid = validateCollectionScheduleInput({
    area: 'A',
    wasteCategory: 'wet',
    scheduledDate: 'invalid-date',
    scheduledTime: '99',
    assignedFleetId: 'nonexistent',
    priority: 'High',
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.fieldErrors.area);
  assert.ok(invalid.fieldErrors.scheduledDate);
  assert.ok(invalid.fieldErrors.scheduledTime);
  assert.ok(invalid.fieldErrors.assignedFleetId);

  // Create new schedule
  const created = createCollectionSchedule(
    {
      area: 'Maplewood North',
      wasteCategory: 'ewaste',
      scheduledDate: '2026-11-22',
      scheduledTime: '10:15',
      assignedFleetId: DEMO_COLLECTION_FLEET[2].id,
      priority: 'High',
      notes: 'Community center e-waste bin pickup.',
    },
    storage,
    new Date('2026-11-20T12:00:00.000Z')
  );

  assert.equal(created.error, null);
  assert.ok(created.schedule);
  assert.match(created.schedule.id, /^SCH-2026-/);
  assert.equal(created.schedule.status, 'Scheduled');
  assert.equal(created.schedule.isDemoRecord, false);
  assert.equal(created.schedules.length, DEMO_COLLECTION_SCHEDULES.length + 1);

  // Update schedule status & team
  const updated = updateCollectionSchedule(
    created.schedule.id,
    {
      status: 'Collected',
      assignedFleetId: DEMO_COLLECTION_FLEET[4].id,
      priority: 'Medium',
      notes: 'Picked up on schedule by relief team.',
    },
    storage,
    new Date('2026-11-22T11:00:00.000Z')
  );

  assert.equal(updated.error, null);
  assert.equal(updated.schedule?.status, 'Collected');
  assert.equal(updated.schedule?.priority, 'Medium');
  assert.equal(updated.schedule?.assignedFleetId, DEMO_COLLECTION_FLEET[4].id);

  // Simulate reload & filter
  const reloaded = loadCollectionSchedules(storage);
  assert.equal(reloaded.schedules.length, DEMO_COLLECTION_SCHEDULES.length + 1);
  const filtered = reloaded.schedules.filter(
    (s) =>
      s.area === 'Maplewood North' &&
      s.wasteCategory === 'ewaste' &&
      s.status === 'Collected'
  );
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, created.schedule.id);

  // Civic reports untouched
  assert.equal(storage.getItem(CIVIC_REPORTS_STORAGE_KEY), reportsSnapshot);
  assert.equal(loadCivicReports(storage).reports.length, reportsBefore.reports.length);
});

test('Waste Batch Tracking: seeds demo batches, validates, creates, updates all 5 stages with timeline, and persists', () => {
  const storage = new MemoryStorage();
  const initial = loadWasteBatches(storage);

  assert.equal(initial.error, null);
  assert.equal(initial.batches.length, DEMO_WASTE_BATCHES.length);
  assert.ok(initial.batches.every((b) => b.isDemoRecord === true));

  // Validation rejects non-positive kg
  const invalid = validateWasteBatchInput({
    wasteCategory: 'dry',
    sourceArea: 'X',
    collectionDate: 'bad',
    estimatedKg: 0,
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.fieldErrors.sourceArea);
  assert.ok(invalid.fieldErrors.collectionDate);
  assert.ok(invalid.fieldErrors.estimatedKg);

  // Create new batch
  const created = createWasteBatch(
    {
      wasteCategory: 'dry',
      sourceArea: 'Cedar Heights',
      collectionDate: '2026-11-20',
      estimatedKg: 1480,
      notes: 'Dry curbside cardboard & PET stream.',
    },
    storage,
    new Date('2026-11-20T09:00:00.000Z')
  );

  assert.equal(created.error, null);
  assert.ok(created.batch);
  assert.match(created.batch.id, /^BAT-2026-/);
  assert.equal(created.batch.status, 'Awaiting Collection');
  assert.equal(created.batch.statusHistory.length, 1);
  assert.equal(created.batch.isDemoRecord, false);

  const batchId = created.batch.id;

  const stages = [
    'Collected',
    'In Transit',
    'At Processing Facility',
    'Processed',
  ] as const;

  stages.forEach((stage, idx) => {
    const res = updateWasteBatchStatus(
      batchId,
      stage,
      `Stage ${stage} verified.`,
      storage,
      new Date(`2026-11-20T1${idx + 1}:00:00.000Z`)
    );
    assert.equal(res.error, null);
    assert.equal(res.batch?.status, stage);
  });

  // Reload persistence check
  const reloaded = loadWasteBatches(storage);
  assert.equal(reloaded.batches.length, DEMO_WASTE_BATCHES.length + 1);
  const persisted = reloaded.batches.find((b) => b.id === batchId);
  assert.ok(persisted);
  assert.equal(persisted.status, 'Processed');
  assert.equal(persisted.statusHistory.length, 5);
  assert.deepEqual(
    persisted.statusHistory.map((h) => h.status),
    [
      'Awaiting Collection',
      'Collected',
      'In Transit',
      'At Processing Facility',
      'Processed',
    ]
  );
});

test('Operations storage guards against corrupted JSON without silently overwriting', () => {
  const storage = new MemoryStorage();
  storage.setItem(COLLECTION_SCHEDULES_STORAGE_KEY, '{corrupt');
  storage.setItem(WASTE_BATCHES_STORAGE_KEY, '[not-json');

  const badSchedules = loadCollectionSchedules(storage);
  assert.equal(badSchedules.isCorrupted, true);
  assert.equal(storage.getItem(COLLECTION_SCHEDULES_STORAGE_KEY), '{corrupt');

  const badBatches = loadWasteBatches(storage);
  assert.equal(badBatches.isCorrupted, true);
  assert.equal(storage.getItem(WASTE_BATCHES_STORAGE_KEY), '[not-json');

  const recoveredSchedules = recoverCorruptedSchedulesWithDemo(storage);
  assert.equal(recoveredSchedules.isCorrupted, false);
  assert.equal(storage.getItem(COLLECTION_SCHEDULES_CORRUPT_BACKUP_KEY), '{corrupt');

  const recoveredBatches = recoverCorruptedBatchesWithDemo(storage);
  assert.equal(recoveredBatches.isCorrupted, false);
  assert.equal(storage.getItem(WASTE_BATCHES_CORRUPT_BACKUP_KEY), '[not-json');
});
