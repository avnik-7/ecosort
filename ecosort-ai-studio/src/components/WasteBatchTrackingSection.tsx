import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Factory,
  Info,
  PackageCheck,
  Plus,
  RefreshCw,
  Save,
  Search,
  Truck,
  X,
} from 'lucide-react';
import { MUNICIPAL_ZONE_STATS } from '../data/municipalDemoData';
import { OPERATIONS_DEMO_NOTICE } from '../data/municipalOperationsDemo';
import { CATEGORY_ORDER, WASTE_CATEGORIES } from '../data/wasteCatalog';
import {
  WasteBatch,
  WasteBatchCreateInput,
  WasteBatchStatus,
  WasteCategoryId,
} from '../types/ecosort';
import {
  CreateBatchResult,
  UpdateBatchStatusResult,
  WASTE_BATCH_STATUS_ORDER,
} from '../utils/wasteBatchStorage';
import { CATEGORY_STYLES, CategoryIcon } from './categoryTheme';
import { formatReportDate } from './civicReportTheme';

interface WasteBatchTrackingSectionProps {
  batches: WasteBatch[];
  isLoading: boolean;
  error: string | null;
  isCorrupted: boolean;
  onCreateBatch: (input: WasteBatchCreateInput) => CreateBatchResult;
  onUpdateBatchStatus: (
    batchId: string,
    nextStatus: WasteBatchStatus,
    note: string
  ) => UpdateBatchStatusResult;
  onRecoverCorruptBatches: () => void;
  onRestoreDemoBatches: () => void;
}

const WARD_AREAS = MUNICIPAL_ZONE_STATS.map((z) => z.zoneName);

const BATCH_STATUS_VISUALS: Record<
  WasteBatchStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    textClass: string;
    surfaceClass: string;
    borderClass: string;
  }
> = {
  'Awaiting Collection': {
    icon: Clock,
    textClass: 'text-[#395543]',
    surfaceClass: 'bg-[#EBF1EC]',
    borderClass: 'border-[#CFDAD1]',
  },
  Collected: {
    icon: PackageCheck,
    textClass: 'text-[#395543]',
    surfaceClass: 'bg-[#E6F2EA]',
    borderClass: 'border-[#C5DEC9]',
  },
  'In Transit': {
    icon: Truck,
    textClass: 'text-[#6A4C1E]',
    surfaceClass: 'bg-[#F9F3E8]',
    borderClass: 'border-[#E6D6BC]',
  },
  'At Processing Facility': {
    icon: Factory,
    textClass: 'text-[#8C3F19]',
    surfaceClass: 'bg-[#FBF3EB]',
    borderClass: 'border-[#EAD3BE]',
  },
  Processed: {
    icon: CheckCircle2,
    textClass: 'text-[#1F4E37]',
    surfaceClass: 'bg-[#E6F2EA]',
    borderClass: 'border-[#C5DEC9]',
  },
};

function BatchStatusBadge({ status }: { status: WasteBatchStatus }) {
  const style = BATCH_STATUS_VISUALS[status];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap ${style.surfaceClass} ${style.borderClass} ${style.textClass}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export function WasteBatchTrackingSection({
  batches,
  isLoading,
  error,
  isCorrupted,
  onCreateBatch,
  onUpdateBatchStatus,
  onRecoverCorruptBatches,
  onRestoreDemoBatches,
}: WasteBatchTrackingSectionProps) {
  // Create batch state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [wasteCategory, setWasteCategory] = useState<WasteCategoryId>('wet');
  const [areaChoice, setAreaChoice] = useState<string>(WARD_AREAS[0]);
  const [customArea, setCustomArea] = useState('');
  const [collectionDate, setCollectionDate] = useState('2026-11-20');
  const [estimatedKgInput, setEstimatedKgInput] = useState('1250');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<
      Record<'wasteCategory' | 'sourceArea' | 'collectionDate' | 'estimatedKg', string>
    >
  >({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<WasteCategoryId | 'All'>(
    'All'
  );
  const [areaFilter, setAreaFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<WasteBatchStatus | 'All'>(
    'All'
  );

  // Selected batch & status updater
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<WasteBatchStatus>(
    'Awaiting Collection'
  );
  const [draftNote, setDraftNote] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);

  const areaOptions = useMemo(() => {
    const set = new Set<string>(WARD_AREAS);
    for (const b of batches) {
      set.add(b.sourceArea);
    }
    return Array.from(set).sort();
  }, [batches]);

  const filteredBatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return batches.filter((b) => {
      if (categoryFilter !== 'All' && b.wasteCategory !== categoryFilter) {
        return false;
      }
      if (areaFilter !== 'All' && b.sourceArea !== areaFilter) return false;
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (!q) return true;
      return (
        b.id.toLowerCase().includes(q) ||
        b.sourceArea.toLowerCase().includes(q) ||
        (b.notes ?? '').toLowerCase().includes(q)
      );
    });
  }, [batches, searchQuery, categoryFilter, areaFilter, statusFilter]);

  const selectedBatch = useMemo(() => {
    if (selectedBatchId) {
      const found = batches.find((b) => b.id === selectedBatchId);
      if (found) return found;
    }
    return filteredBatches[0] ?? batches[0] ?? null;
  }, [batches, filteredBatches, selectedBatchId]);

  useEffect(() => {
    if (selectedBatch) {
      setDraftStatus(selectedBatch.status);
      setDraftNote('');
      setUpdateError(null);
    }
  }, [selectedBatch?.id]);

  const metrics = useMemo(() => {
    const totalKg = batches.reduce((sum, b) => sum + b.estimatedKg, 0);
    return {
      total: batches.length,
      inProgress: batches.filter((b) => b.status !== 'Processed').length,
      processed: batches.filter((b) => b.status === 'Processed').length,
      totalKg,
    };
  }, [batches]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccessMsg(null);

    const parsedKg = Number(estimatedKgInput);
    const effectiveArea = areaChoice === '__custom__' ? customArea : areaChoice;

    const result = onCreateBatch({
      wasteCategory,
      sourceArea: effectiveArea,
      collectionDate,
      estimatedKg: parsedKg,
      notes,
    });

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      setCreateError(result.error);
      return;
    }

    if (result.error || !result.batch) {
      setFieldErrors({});
      setCreateError(result.error || 'Could not register waste batch.');
      return;
    }

    setFieldErrors({});
    setCreateError(null);
    setCreateSuccessMsg(
      `Registered batch ${result.batch.id} (${result.batch.estimatedKg.toLocaleString()} kg ${WASTE_CATEGORIES[result.batch.wasteCategory].shortName} from ${result.batch.sourceArea}).`
    );
    setSelectedBatchId(result.batch.id);
    setNotes('');
    if (areaChoice === '__custom__') {
      setCustomArea('');
    }
    setShowCreateForm(false);
  };

  const handleSaveBatchStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setUpdateError(null);
    setUpdateSuccessMsg(null);

    const result = onUpdateBatchStatus(selectedBatch.id, draftStatus, draftNote);
    if (result.error) {
      setUpdateError(result.error);
      return;
    }

    setDraftNote('');
    setUpdateSuccessMsg(
      `Updated ${selectedBatch.id} to "${draftStatus}". Timeline saved in this browser.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Limitation & Demonstration Notice */}
      <div
        role="note"
        className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-semibold text-[#1E2421]">
              {OPERATIONS_DEMO_NOTICE.batchesHeadline}
            </p>
            <p className="text-xs sm:text-sm text-[#525D57] leading-relaxed">
              {OPERATIONS_DEMO_NOTICE.batchesDescription}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1F4E37] hover:bg-[#173B2A] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
        >
          {showCreateForm ? (
            <>
              <X className="w-4 h-4" aria-hidden="true" />
              <span>Close Batch Form</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Register Waste Batch</span>
            </>
          )}
        </button>
      </div>

      {/* Storage Error / Corruption Guard */}
      {error && (
        <div
          role="alert"
          className="bg-[#FBF3EB] border border-[#EAD3BE] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#8C3F19] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#8C3F19]">
                Waste batch storage warning
              </p>
              <p className="text-xs sm:text-sm text-[#5D331B]">{error}</p>
            </div>
          </div>
          {isCorrupted && (
            <button
              type="button"
              onClick={onRecoverCorruptBatches}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#8C3F19] text-white text-xs font-semibold whitespace-nowrap shrink-0"
            >
              Backup &amp; Restore Demo Batches
            </button>
          )}
        </div>
      )}

      {/* Create Batch Success Banner */}
      {createSuccessMsg && (
        <div
          role="status"
          className="bg-[#E6F2EA] border border-[#C5DEC9] rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2.5 text-sm font-medium text-[#1F4E37]">
            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{createSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setCreateSuccessMsg(null)}
            aria-label="Dismiss batch confirmation"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#1F4E37] hover:bg-[#D7EBDD]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Register Waste Batch Form */}
      {showCreateForm && (
        <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="pb-4 border-b border-[#DCE3DD] space-y-1">
            <h2 className="font-display text-lg font-bold text-[#1E2421]">
              Register Waste Batch
            </h2>
            <p className="text-xs sm:text-sm text-[#525D57]">
              Create a tracked batch starting at Awaiting Collection with a unique Batch ID.
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Waste Category */}
              <div className="space-y-1.5">
                <label
                  htmlFor="batch-category-select"
                  className="block text-xs font-semibold text-[#1E2421]"
                >
                  Waste Category
                </label>
                <select
                  id="batch-category-select"
                  value={wasteCategory}
                  onChange={(e) =>
                    setWasteCategory(e.target.value as WasteCategoryId)
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                >
                  {CATEGORY_ORDER.map((catId) => (
                    <option key={catId} value={catId}>
                      {WASTE_CATEGORIES[catId].name}
                    </option>
                  ))}
                </select>
                {fieldErrors.wasteCategory && (
                  <p className="text-xs text-[#8C3F19]">
                    {fieldErrors.wasteCategory}
                  </p>
                )}
              </div>

              {/* Source Area */}
              <div className="space-y-1.5">
                <label
                  htmlFor="batch-area-select"
                  className="block text-xs font-semibold text-[#1E2421]"
                >
                  Source Area / Ward
                </label>
                <select
                  id="batch-area-select"
                  value={areaChoice}
                  onChange={(e) => setAreaChoice(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                >
                  {WARD_AREAS.map((ward) => (
                    <option key={ward} value={ward}>
                      {ward}
                    </option>
                  ))}
                  <option value="__custom__">Other Neighborhood / Custom Area</option>
                </select>
                {areaChoice === '__custom__' && (
                  <input
                    type="text"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    placeholder="Enter source area"
                    aria-label="Custom batch source area"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] mt-2 focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                  />
                )}
                {fieldErrors.sourceArea && (
                  <p className="text-xs text-[#8C3F19]">
                    {fieldErrors.sourceArea}
                  </p>
                )}
              </div>

              {/* Collection Date */}
              <div className="space-y-1.5">
                <label
                  htmlFor="batch-date-input"
                  className="block text-xs font-semibold text-[#1E2421]"
                >
                  Collection Date
                </label>
                <input
                  id="batch-date-input"
                  type="date"
                  value={collectionDate}
                  onChange={(e) => setCollectionDate(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm font-mono text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                />
                {fieldErrors.collectionDate && (
                  <p className="text-xs text-[#8C3F19]">
                    {fieldErrors.collectionDate}
                  </p>
                )}
              </div>

              {/* Estimated Quantity (kg) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="batch-kg-input"
                  className="block text-xs font-semibold text-[#1E2421]"
                >
                  Estimated Quantity (kg)
                </label>
                <input
                  id="batch-kg-input"
                  type="number"
                  min={1}
                  max={100000}
                  value={estimatedKgInput}
                  onChange={(e) => setEstimatedKgInput(e.target.value)}
                  placeholder="e.g., 1250"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm font-mono tabular-nums text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                />
                {fieldErrors.estimatedKg && (
                  <p className="text-xs text-[#8C3F19]">
                    {fieldErrors.estimatedKg}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="batch-notes-input"
                className="block text-xs font-semibold text-[#1E2421]"
              >
                Initial Handling Note <span className="font-normal text-[#525D57]">(Optional)</span>
              </label>
              <input
                id="batch-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Staged at Maplewood North transfer point for windrow bay"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
              />
            </div>

            {createError && (
              <p role="alert" className="text-xs font-medium text-[#8C3F19]">
                {createError}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DCE3DD] bg-[#FFFFFF] hover:bg-[#F8F7F3] text-sm font-semibold text-[#525D57]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCorrupted}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1F4E37] hover:bg-[#173B2A] disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Register Waste Batch</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Batch KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">
            Tracked Batches · Demo
          </p>
          <p className="font-display text-2xl font-bold text-[#1E2421] tabular-nums">
            {metrics.total}
          </p>
          <p className="text-xs text-[#525D57]">Stored in local browser</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">Active Pipeline</p>
          <p className="font-display text-2xl font-bold text-[#8C3F19] tabular-nums">
            {metrics.inProgress}
          </p>
          <p className="text-xs text-[#525D57]">Awaiting through facility</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">Processed</p>
          <p className="font-display text-2xl font-bold text-[#1F4E37] tabular-nums">
            {metrics.processed}
          </p>
          <p className="text-xs text-[#525D57]">Completed processing</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">
            Estimated Volume · Demo
          </p>
          <p className="font-display text-2xl font-bold text-[#1E2421] tabular-nums">
            {metrics.totalKg.toLocaleString()} kg
          </p>
          <p className="text-xs text-[#525D57]">Across tracked batches</p>
        </div>
      </section>

      {/* Filters Toolbar */}
      <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#525D57] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Batch ID, area, notes..."
              aria-label="Search waste batches"
              className="w-full min-h-[44px] pl-10 pr-9 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[32px] min-w-[32px] flex items-center justify-center text-[#525D57]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            aria-label="Filter batches by waste category"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as WasteCategoryId | 'All')
            }
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
          >
            <option value="All">All Waste Categories</option>
            {CATEGORY_ORDER.map((catId) => (
              <option key={catId} value={catId}>
                {WASTE_CATEGORIES[catId].shortName}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter batches by source area"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
          >
            <option value="All">All Source Areas</option>
            {areaOptions.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter batches by processing status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as WasteBatchStatus | 'All')
            }
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
          >
            <option value="All">All Processing Statuses</option>
            {WASTE_BATCH_STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Split View: Batch List + Status & Timeline Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-[#525D57] px-1">
            <span>
              Showing <span className="font-mono tabular-nums">{filteredBatches.length}</span>{' '}
              of <span className="font-mono tabular-nums">{batches.length}</span> batches
            </span>
            <span>Select a batch to inspect timeline &amp; update status</span>
          </div>

          {isLoading && (
            <div className="space-y-3" aria-busy="true">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded-xl bg-[#FFFFFF] border border-[#DCE3DD] animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoading && filteredBatches.length === 0 && (
            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-[#1E2421]">
                {batches.length === 0
                  ? 'No waste batches stored yet'
                  : 'No waste batches match these filters'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {batches.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All');
                      setAreaFilter('All');
                      setStatusFilter('All');
                    }}
                    className="min-h-[40px] px-4 py-2 rounded-lg bg-[#E6F2EA] text-[#1F4E37] text-xs font-semibold"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onRestoreDemoBatches}
                    className="min-h-[40px] px-4 py-2 rounded-lg bg-[#E6F2EA] text-[#1F4E37] text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Restore Demo Batches</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {!isLoading && filteredBatches.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#DCE3DD] bg-[#F8F7F3] text-xs font-semibold text-[#525D57]">
                      <th className="py-3 px-4">Batch</th>
                      <th className="py-3 px-4">Source &amp; Category</th>
                      <th className="py-3 px-4 text-right">Est. Qty</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE3DD] text-sm">
                    {filteredBatches.map((batch) => {
                      const isSelected = selectedBatch?.id === batch.id;
                      const cat = WASTE_CATEGORIES[batch.wasteCategory];
                      const catStyle = CATEGORY_STYLES[batch.wasteCategory];
                      return (
                        <tr
                          key={batch.id}
                          onClick={() => {
                            setSelectedBatchId(batch.id);
                            setUpdateSuccessMsg(null);
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#E6F2EA]/75'
                              : 'hover:bg-[#F8F7F3]'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <p className="font-mono tabular-nums text-xs font-semibold text-[#1E2421]">
                              {batch.id}
                            </p>
                            <p className="text-xs text-[#525D57] font-mono tabular-nums">
                              {batch.collectionDate} · {batch.isDemoRecord ? 'Demo' : 'Created'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-xs font-semibold text-[#1E2421]">
                              {batch.sourceArea}
                            </p>
                            <p className={`text-xs inline-flex items-center gap-1 ${catStyle.accentText}`}>
                              <CategoryIcon category={batch.wasteCategory} className="w-3.5 h-3.5" />
                              <span>{cat.shortName}</span>
                            </p>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs font-semibold text-[#1E2421]">
                            {batch.estimatedKg.toLocaleString()} kg
                          </td>
                          <td className="py-3.5 px-4">
                            <BatchStatusBadge status={batch.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredBatches.map((batch) => {
                  const isSelected = selectedBatch?.id === batch.id;
                  const cat = WASTE_CATEGORIES[batch.wasteCategory];
                  return (
                    <button
                      key={batch.id}
                      type="button"
                      onClick={() => {
                        setSelectedBatchId(batch.id);
                        setUpdateSuccessMsg(null);
                      }}
                      className={`w-full text-left rounded-2xl p-4 border transition-colors space-y-2 ${
                        isSelected
                          ? 'bg-[#E6F2EA]/75 border-[#6F8F78]'
                          : 'bg-[#FFFFFF] border-[#DCE3DD]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono tabular-nums text-xs font-semibold text-[#1E2421]">
                          {batch.id} · {batch.isDemoRecord ? 'Demo Record' : 'Created'}
                        </span>
                        <BatchStatusBadge status={batch.status} />
                      </div>
                      <p className="text-sm font-semibold text-[#1E2421]">
                        {batch.sourceArea} — {cat.shortName}
                      </p>
                      <div className="flex items-center justify-between text-xs text-[#525D57] font-mono tabular-nums">
                        <span>{batch.collectionDate}</span>
                        <span className="font-semibold text-[#1E2421]">
                          {batch.estimatedKg.toLocaleString()} kg
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Batch Detail, Processing Stage Updater & Timeline */}
        <aside className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 lg:sticky lg:top-20">
          {selectedBatch ? (
            <>
              <div className="pb-4 border-b border-[#DCE3DD] space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-[#525D57]">
                    <span className="font-mono tabular-nums font-semibold text-[#1E2421]">
                      {selectedBatch.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {selectedBatch.isDemoRecord
                        ? 'Demo Record'
                        : 'Admin Batch'}
                    </span>
                  </div>
                  <BatchStatusBadge status={selectedBatch.status} />
                </div>

                <h3 className="font-display text-lg sm:text-xl font-bold text-[#1E2421]">
                  {selectedBatch.sourceArea}
                </h3>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#525D57]">
                  <span className="inline-flex items-center gap-1 font-medium text-[#1F4E37]">
                    <CategoryIcon
                      category={selectedBatch.wasteCategory}
                      className="w-3.5 h-3.5"
                    />
                    {WASTE_CATEGORIES[selectedBatch.wasteCategory].name}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {selectedBatch.collectionDate}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums font-semibold text-[#1E2421]">
                    {selectedBatch.estimatedKg.toLocaleString()} kg
                  </span>
                </div>
              </div>

              {selectedBatch.notes && (
                <p className="text-sm text-[#525D57] leading-relaxed">
                  <span className="font-semibold text-[#1E2421]">Latest Note: </span>
                  {selectedBatch.notes}
                </p>
              )}

              {/* Processing Status Updater */}
              <form
                onSubmit={handleSaveBatchStatus}
                className="pt-4 border-t border-[#DCE3DD] space-y-4"
              >
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-[#1E2421]">
                    Update Processing Stage
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {WASTE_BATCH_STATUS_ORDER.map((stage, idx) => {
                      const active = draftStatus === stage;
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => {
                            setDraftStatus(stage);
                            setUpdateError(null);
                            setUpdateSuccessMsg(null);
                          }}
                          className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                            active
                              ? 'bg-[#1F4E37] text-white border-[#1F4E37]'
                              : 'bg-[#F8F7F3] text-[#1E2421] border-[#DCE3DD] hover:bg-[#EBF1EC]'
                          }`}
                        >
                          <span>
                            0{idx + 1}. {stage}
                          </span>
                          {selectedBatch.status === stage && (
                            <span
                              className={`text-[11px] font-medium ${
                                active ? 'text-[#E6F2EA]' : 'text-[#525D57]'
                              }`}
                            >
                              Current
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="batch-update-note"
                    className="block text-xs font-semibold text-[#1E2421]"
                  >
                    Stage Update Note <span className="font-normal text-[#525D57]">(Optional)</span>
                  </label>
                  <input
                    id="batch-update-note"
                    type="text"
                    value={draftNote}
                    onChange={(e) => {
                      setDraftNote(e.target.value);
                      setUpdateError(null);
                    }}
                    placeholder="e.g., Received at Northside MRF sorting line"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                  />
                </div>

                {updateError && (
                  <p role="alert" className="text-xs font-medium text-[#8C3F19]">
                    {updateError}
                  </p>
                )}

                {updateSuccessMsg && (
                  <div
                    role="status"
                    className="rounded-xl bg-[#E6F2EA] border border-[#C5DEC9] p-3 flex items-start gap-2 text-xs text-[#1F4E37] font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{updateSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#1F4E37] hover:bg-[#173B2A] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" aria-hidden="true" />
                  <span>Save Batch Status</span>
                </button>
              </form>

              {/* Chronological Batch Status Timeline */}
              <div className="pt-4 border-t border-[#DCE3DD] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#525D57]">
                  <span className="font-semibold text-[#1E2421]">
                    Batch Status Timeline
                  </span>
                  <span className="font-mono tabular-nums">
                    {selectedBatch.statusHistory.length} updates
                  </span>
                </div>
                <ol className="space-y-3">
                  {selectedBatch.statusHistory.map((entry, idx) => {
                    const style = BATCH_STATUS_VISUALS[entry.status];
                    const Icon = style.icon;
                    return (
                      <li key={entry.id} className="flex items-start gap-3 text-sm">
                        <span
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${style.surfaceClass} ${style.borderClass} ${style.textClass}`}
                        >
                          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                        <div className="flex-1 min-w-0 space-y-0.5 pb-3 border-b border-[#DCE3DD] last:border-b-0 last:pb-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-[#1E2421]">
                              {entry.status}
                            </span>
                            <span className="font-mono tabular-nums text-xs text-[#525D57]">
                              #{idx + 1} · {formatReportDate(entry.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#525D57] leading-relaxed">
                            {entry.note}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm text-[#525D57]">
              Select a waste batch to view its timeline and update processing status.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
