import assert from 'node:assert/strict';
import test from 'node:test';
import { DEMO_CIVIC_REPORTS } from '../src/data/civicReportsDemo';
import {
  CIVIC_REPORTS_CORRUPT_BACKUP_KEY,
  CIVIC_REPORTS_STORAGE_KEY,
  createCivicReport,
  generateUniqueReportId,
  loadCivicReports,
  recoverCorruptedStorageWithDemo,
  StorageLike,
  updateCivicReportStatus,
  validateReportInput,
} from '../src/utils/civicReportsStorage';

class MemoryStorage implements StorageLike {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

test('seeds realistic demonstration reports on first load without overwriting later', () => {
  const storage = new MemoryStorage();
  const initial = loadCivicReports(storage);

  assert.equal(initial.error, null);
  assert.equal(initial.isCorrupted, false);
  assert.equal(initial.reports.length, DEMO_CIVIC_REPORTS.length);
  assert.ok(initial.reports.every((r) => r.isDemoRecord === true));
});

test('validates citizen report input fields accurately', () => {
  const invalid = validateReportInput({
    reportType: 'overflowing_bin',
    area: 'A',
    locationDetail: 'Elm',
    description: 'Too short',
    contactOptional: 'not-a-valid-contact',
  });

  assert.equal(invalid.isValid, false);
  assert.ok(invalid.fieldErrors.area);
  assert.ok(invalid.fieldErrors.locationDetail);
  assert.ok(invalid.fieldErrors.description);
  assert.ok(invalid.fieldErrors.contactOptional);

  const valid = validateReportInput({
    reportType: 'illegal_dumping',
    area: 'Maplewood North',
    locationDetail: '18 Elm Street near Park Entrance',
    description: 'Two large bags of construction rubble left beside the public bin.',
    contactOptional: '',
  });

  assert.equal(valid.isValid, true);
  assert.deepEqual(valid.fieldErrors, {});
});

test('generates unique report IDs without colliding with existing IDs', () => {
  const existing = new Set<string>(['ECO-2026-1041', 'ECO-2026-1042']);
  const generated = new Set<string>();

  for (let i = 0; i < 100; i += 1) {
    const id = generateUniqueReportId(existing, new Date('2026-11-20T10:00:00.000Z'));
    assert.match(id, /^ECO-2026-/);
    assert.equal(existing.has(id), false);
    assert.equal(generated.has(id), false);
    existing.add(id);
    generated.add(id);
  }
});

test('submits citizen report, preserves existing reports, updates admin status, and persists across reload', () => {
  const storage = new MemoryStorage();
  loadCivicReports(storage);

  // Citizen submits new report
  const created = createCivicReport(
    {
      reportType: 'hazardous_waste',
      area: 'Cedar Heights',
      locationDetail: 'Cedar Community Center Bike Rack',
      description: 'Discarded laptop battery pack and broken CFL tube left beside bench.',
      contactOptional: 'citizen@example.org',
    },
    storage,
    new Date('2026-11-20T11:00:00.000Z')
  );

  assert.equal(created.error, null);
  assert.ok(created.report);
  assert.equal(created.report.status, 'Submitted');
  assert.equal(created.report.isDemoRecord, false);
  assert.equal(created.report.statusHistory.length, 1);
  assert.equal(created.reports.length, DEMO_CIVIC_REPORTS.length + 1);

  const reportId = created.report.id;

  // Admin transitions status through Under Review -> In Progress -> Resolved
  const step1 = updateCivicReportStatus(
    reportId,
    'Under Review',
    'Assigned hazmat pickup van.',
    storage,
    new Date('2026-11-20T12:00:00.000Z')
  );
  assert.equal(step1.error, null);
  assert.equal(step1.report?.status, 'Under Review');

  const step2 = updateCivicReportStatus(
    reportId,
    'In Progress',
    'Crew en route to Cedar Community Center.',
    storage,
    new Date('2026-11-20T13:00:00.000Z')
  );
  assert.equal(step2.error, null);
  assert.equal(step2.report?.status, 'In Progress');

  // Verify Resolved enforces a resolution note
  const missingNote = updateCivicReportStatus(
    reportId,
    'Resolved',
    'Done',
    storage,
    new Date('2026-11-20T14:00:00.000Z')
  );
  assert.ok(missingNote.error);

  const step3 = updateCivicReportStatus(
    reportId,
    'Resolved',
    'Safely collected battery and CFL tube into sealed HHW containment.',
    storage,
    new Date('2026-11-20T14:30:00.000Z')
  );
  assert.equal(step3.error, null);
  assert.equal(step3.report?.status, 'Resolved');
  assert.equal(step3.report?.statusHistory.length, 4);

  // Simulate full browser refresh by reading freshly from storage
  const reloaded = loadCivicReports(storage);
  assert.equal(reloaded.error, null);
  assert.equal(reloaded.reports.length, DEMO_CIVIC_REPORTS.length + 1);
  const persisted = reloaded.reports.find((r) => r.id === reportId);
  assert.ok(persisted);
  assert.equal(persisted.status, 'Resolved');
  assert.equal(
    persisted.adminNote,
    'Safely collected battery and CFL tube into sealed HHW containment.'
  );
  assert.equal(persisted.statusHistory.length, 4);
});

test('never silently overwrites corrupted localStorage data and backs it up on explicit recovery', () => {
  const storage = new MemoryStorage();
  storage.setItem(CIVIC_REPORTS_STORAGE_KEY, '{not-valid-json');

  const corruptedLoad = loadCivicReports(storage);
  assert.equal(corruptedLoad.isCorrupted, true);
  assert.ok(corruptedLoad.error);
  assert.equal(storage.getItem(CIVIC_REPORTS_STORAGE_KEY), '{not-valid-json');

  // Submitting while corrupted is blocked to prevent silent data loss
  const blockedSubmit = createCivicReport(
    {
      reportType: 'other',
      area: 'Maplewood North',
      locationDetail: '10 Oak Road',
      description: 'Damaged bin lid needs hinge replacement.',
    },
    storage
  );
  assert.ok(blockedSubmit.error);
  assert.equal(storage.getItem(CIVIC_REPORTS_STORAGE_KEY), '{not-valid-json');

  // Explicit recovery preserves raw backup before restoring demo records
  const recovered = recoverCorruptedStorageWithDemo(storage);
  assert.equal(recovered.isCorrupted, false);
  assert.equal(recovered.error, null);
  assert.equal(storage.getItem(CIVIC_REPORTS_CORRUPT_BACKUP_KEY), '{not-valid-json');
  assert.equal(recovered.reports.length, DEMO_CIVIC_REPORTS.length);
});
