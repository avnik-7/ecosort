import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Plus,
  RefreshCw,
  Save,
  Search,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import { MUNICIPAL_ZONE_STATS } from '../data/municipalDemoData';
import {
  DEMO_COLLECTION_FLEET,
  OPERATIONS_DEMO_NOTICE,
} from '../data/municipalOperationsDemo';
import { CATEGORY_ORDER, WASTE_CATEGORIES } from '../data/wasteCatalog';
import {
  CollectionPriority,
  CollectionSchedule,
  CollectionScheduleCreateInput,
  CollectionScheduleStatus,
  WasteCategoryId,
} from '../types/ecosort';
import {
  COLLECTION_PRIORITIES,
  COLLECTION_SCHEDULE_STATUSES,
  CreateScheduleResult,
  UpdateScheduleResult,
} from '../utils/collectionPlannerStorage';
import { CATEGORY_STYLES, CategoryIcon } from './categoryTheme';

interface CollectionPlannerSectionProps {
  schedules: CollectionSchedule[];
  isLoading: boolean;
  error: string | null;
  isCorrupted: boolean;
  onCreateSchedule: (input: CollectionScheduleCreateInput) => CreateScheduleResult;
  onUpdateSchedule: (
    scheduleId: string,
    updates: {
      status: CollectionScheduleStatus;
      assignedFleetId: string;
      priority: CollectionPriority;
      notes?: string;
    }
  ) => UpdateScheduleResult;
  onRecoverCorruptSchedules: () => void;
  onRestoreDemoSchedules: () => void;
}

const WARD_AREAS = MUNICIPAL_ZONE_STATS.map((z) => z.zoneName);

const SCHEDULE_STATUS_VISUALS: Record<
  CollectionScheduleStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    textClass: string;
    surfaceClass: string;
    borderClass: string;
  }
> = {
  Scheduled: {
    icon: Calendar,
    textClass: 'text-[#395543]',
    surfaceClass: 'bg-[#EBF1EC]',
    borderClass: 'border-[#CFDAD1]',
  },
  Assigned: {
    icon: Truck,
    textClass: 'text-[#6A4C1E]',
    surfaceClass: 'bg-[#F9F3E8]',
    borderClass: 'border-[#E6D6BC]',
  },
  Collected: {
    icon: CheckCircle2,
    textClass: 'text-[#1F4E37]',
    surfaceClass: 'bg-[#E6F2EA]',
    borderClass: 'border-[#C5DEC9]',
  },
  Cancelled: {
    icon: XCircle,
    textClass: 'text-[#8C3F19]',
    surfaceClass: 'bg-[#FBF3EB]',
    borderClass: 'border-[#EAD3BE]',
  },
};

const PRIORITY_TEXT_CLASS: Record<CollectionPriority, string> = {
  Low: 'text-[#525D57]',
  Medium: 'text-[#395543]',
  High: 'text-[#8C3F19]',
};

function ScheduleStatusBadge({ status }: { status: CollectionScheduleStatus }) {
  const style = SCHEDULE_STATUS_VISUALS[status];
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

export function CollectionPlannerSection({
  schedules,
  isLoading,
  error,
  isCorrupted,
  onCreateSchedule,
  onUpdateSchedule,
  onRecoverCorruptSchedules,
  onRestoreDemoSchedules,
}: CollectionPlannerSectionProps) {
  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [areaChoice, setAreaChoice] = useState<string>(WARD_AREAS[0]);
  const [customArea, setCustomArea] = useState('');
  const [wasteCategory, setWasteCategory] = useState<WasteCategoryId>('wet');
  const [scheduledDate, setScheduledDate] = useState('2026-11-21');
  const [scheduledTime, setScheduledTime] = useState('08:30');
  const [assignedFleetId, setAssignedFleetId] = useState(
    DEMO_COLLECTION_FLEET[0].id
  );
  const [priority, setPriority] = useState<CollectionPriority>('Medium');
  const [notes, setNotes] = useState('');

  const [fieldErrors, setFieldErrors] = useState<
    Partial<
      Record<
        | 'area'
        | 'wasteCategory'
        | 'scheduledDate'
        | 'scheduledTime'
        | 'assignedFleetId'
        | 'priority',
        string
      >
    >
  >({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<WasteCategoryId | 'All'>(
    'All'
  );
  const [statusFilter, setStatusFilter] = useState<
    CollectionScheduleStatus | 'All'
  >('All');

  // Detail & edit state
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  );
  const [draftStatus, setDraftStatus] =
    useState<CollectionScheduleStatus>('Scheduled');
  const [draftFleetId, setDraftFleetId] = useState<string>(
    DEMO_COLLECTION_FLEET[0].id
  );
  const [draftPriority, setDraftPriority] =
    useState<CollectionPriority>('Medium');
  const [draftNotes, setDraftNotes] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);

  const areaOptions = useMemo(() => {
    const set = new Set<string>(WARD_AREAS);
    for (const s of schedules) {
      set.add(s.area);
    }
    return Array.from(set).sort();
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return schedules.filter((s) => {
      if (areaFilter !== 'All' && s.area !== areaFilter) return false;
      if (categoryFilter !== 'All' && s.wasteCategory !== categoryFilter) {
        return false;
      }
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        s.id.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.assignedTeamLabel.toLowerCase().includes(q) ||
        (s.notes ?? '').toLowerCase().includes(q)
      );
    });
  }, [schedules, searchQuery, areaFilter, categoryFilter, statusFilter]);

  const selectedSchedule = useMemo(() => {
    if (selectedScheduleId) {
      const found = schedules.find((s) => s.id === selectedScheduleId);
      if (found) return found;
    }
    return filteredSchedules[0] ?? schedules[0] ?? null;
  }, [schedules, filteredSchedules, selectedScheduleId]);

  useEffect(() => {
    if (selectedSchedule) {
      setDraftStatus(selectedSchedule.status);
      setDraftFleetId(selectedSchedule.assignedFleetId);
      setDraftPriority(selectedSchedule.priority);
      setDraftNotes(selectedSchedule.notes ?? '');
      setUpdateError(null);
    }
  }, [selectedSchedule?.id]);

  const summary = useMemo(
    () => ({
      total: schedules.length,
      pending: schedules.filter(
        (s) => s.status === 'Scheduled' || s.status === 'Assigned'
      ).length,
      collected: schedules.filter((s) => s.status === 'Collected').length,
      highPriority: schedules.filter(
        (s) => s.priority === 'High' && s.status !== 'Cancelled'
      ).length,
    }),
    [schedules]
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccessMsg(null);

    const effectiveArea = areaChoice === '__custom__' ? customArea : areaChoice;
    const result = onCreateSchedule({
      area: effectiveArea,
      wasteCategory,
      scheduledDate,
      scheduledTime,
      assignedFleetId,
      priority,
      notes,
    });

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      setCreateError(result.error);
      return;
    }

    if (result.error || !result.schedule) {
      setFieldErrors({});
      setCreateError(result.error || 'Could not create collection schedule.');
      return;
    }

    setFieldErrors({});
    setCreateError(null);
    setCreateSuccessMsg(
      `Created schedule ${result.schedule.id} for ${result.schedule.area} (${WASTE_CATEGORIES[result.schedule.wasteCategory].shortName}).`
    );
    setSelectedScheduleId(result.schedule.id);
    setNotes('');
    if (areaChoice === '__custom__') {
      setCustomArea('');
    }
    setShowCreateForm(false);
  };

  const handleSaveScheduleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    setUpdateError(null);
    setUpdateSuccessMsg(null);

    const result = onUpdateSchedule(selectedSchedule.id, {
      status: draftStatus,
      assignedFleetId: draftFleetId,
      priority: draftPriority,
      notes: draftNotes,
    });

    if (result.error) {
      setUpdateError(result.error);
      return;
    }

    setUpdateSuccessMsg(
      `Saved ${selectedSchedule.id} with status "${draftStatus}". Changes persist in this browser.`
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
              {OPERATIONS_DEMO_NOTICE.plannerHeadline}
            </p>
            <p className="text-xs sm:text-sm text-[#525D57] leading-relaxed">
              {OPERATIONS_DEMO_NOTICE.plannerDescription}
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
              <span>Close Schedule Form</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>New Collection Schedule</span>
            </>
          )}
        </button>
      </div>

      {/* Corruption / Storage Error Guard */}
      {error && (
        <div
          role="alert"
          className="bg-[#FBF3EB] border border-[#EAD3BE] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#8C3F19] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#8C3F19]">
                Collection planner storage warning
              </p>
              <p className="text-xs sm:text-sm text-[#5D331B]">{error}</p>
            </div>
          </div>
          {isCorrupted && (
            <button
              type="button"
              onClick={onRecoverCorruptSchedules}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#8C3F19] text-white text-xs font-semibold whitespace-nowrap shrink-0"
            >
              Backup &amp; Restore Demo Schedules
            </button>
          )}
        </div>
      )}

      {/* Creation Confirmation Banner */}
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
            aria-label="Dismiss schedule confirmation"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#1F4E37] hover:bg-[#D7EBDD]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Collection Schedule Form */}
      {showCreateForm && (
        <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="pb-4 border-b border-[#DCE3DD] space-y-1">
            <h2 className="font-display text-lg font-bold text-[#1E2421]">
              Create Collection Schedule
            </h2>
            <p className="text-xs sm:text-sm text-[#525D57]">
              Assign a demonstration collection team and schedule window for a city ward.
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Area / Ward */}
              <div className="space-y-1.5">
                <label
                  htmlFor="planner-area-select"
                  className="block text-xs font-semibold text-[#1E2421]"
                >
                  Area / Ward
                </label>
                <select
                  id="planner-area-select"
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
                    placeholder="Enter ward or area name"
                    aria-label="Custom schedule area"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] mt-2 focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                  />
                )}
                {fieldErrors.area && (
                  <p className="text-xs text-[#8C3F19]">{fieldErrors.area}</p>
                )}
              </div>

              {/* Waste Category */}
              <div className="space-y-1.5">
                <label
                  htmlFor="planner-category-select"
                  className="block text-xs font-semibold text-[#1E2421]"
                >
                  Waste Category
                </label>
                <select
                  id="planner-category-select"
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

              {/* Assigned Demo Vehicle / Team */}
              <div className="space-y-1.5">
                <label
                  htmlFor="planner-fleet-select"
                  className="block text-xs font-semibold text-[#1E2421]"
                >
                  Vehicle / Team (Demonstration Fleet)
                </label>
                <select
                  id="planner-fleet-select"
                  value={assignedFleetId}
                  onChange={(e) => setAssignedFleetId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                >
                  {DEMO_COLLECTION_FLEET.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.vehicleCode} · {unit.teamName} ({unit.specialization})
                    </option>
                  ))}
                </select>
                {fieldErrors.assignedFleetId && (
                  <p className="text-xs text-[#8C3F19]">
                    {fieldErrors.assignedFleetId}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label
                  htmlFor="planner-date-input"
                  className="block text-xs font-semibold text-[#1E2421]"
                >
                  Collection Date
                </label>
                <input
                  id="planner-date-input"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm font-mono text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                />
                {fieldErrors.scheduledDate && (
                  <p className="text-xs text-[#8C3F19]">
                    {fieldErrors.scheduledDate}
                  </p>
                )}
              </div>

              {/* Time */}
              <div className="space-y-1.5">
                <label
                  htmlFor="planner-time-input"
                  className="block text-xs font-semibold text-[#1E2421]"
                >
                  Collection Time
                </label>
                <input
                  id="planner-time-input"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm font-mono text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                />
                {fieldErrors.scheduledTime && (
                  <p className="text-xs text-[#8C3F19]">
                    {fieldErrors.scheduledTime}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-[#1E2421]">
                  Priority
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {COLLECTION_PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`min-h-[44px] rounded-xl border text-xs font-semibold transition-colors ${
                        priority === p
                          ? 'bg-[#1F4E37] text-white border-[#1F4E37]'
                          : 'bg-[#F8F7F3] text-[#1E2421] border-[#DCE3DD] hover:bg-[#EBF1EC]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="planner-notes-input"
                className="block text-xs font-semibold text-[#1E2421]"
              >
                Dispatch Instructions <span className="font-normal text-[#525D57]">(Optional)</span>
              </label>
              <input
                id="planner-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Access via North Market service lane before 09:00"
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
                <span>Create Collection Schedule</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">
            Total Schedules · Demo
          </p>
          <p className="font-display text-2xl font-bold text-[#1E2421] tabular-nums">
            {summary.total}
          </p>
          <p className="text-xs text-[#525D57]">Saved in local browser</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">
            Scheduled / Assigned
          </p>
          <p className="font-display text-2xl font-bold text-[#395543] tabular-nums">
            {summary.pending}
          </p>
          <p className="text-xs text-[#525D57]">Active upcoming pickups</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">Collected</p>
          <p className="font-display text-2xl font-bold text-[#1F4E37] tabular-nums">
            {summary.collected}
          </p>
          <p className="text-xs text-[#525D57]">Completed runs</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">High Priority</p>
          <p className="font-display text-2xl font-bold text-[#8C3F19] tabular-nums">
            {summary.highPriority}
          </p>
          <p className="text-xs text-[#525D57]">Priority attention runs</p>
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
              placeholder="Search ID, team, notes..."
              aria-label="Search collection schedules"
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
            aria-label="Filter schedules by area"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
          >
            <option value="All">All Areas / Wards</option>
            {areaOptions.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter schedules by waste category"
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
            aria-label="Filter schedules by status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as CollectionScheduleStatus | 'All')
            }
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
          >
            <option value="All">All Statuses</option>
            {COLLECTION_SCHEDULE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Main Split: Schedule Table / Mobile Cards + Selected Schedule Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-[#525D57] px-1">
            <span>
              Showing <span className="font-mono tabular-nums">{filteredSchedules.length}</span>{' '}
              of <span className="font-mono tabular-nums">{schedules.length}</span> schedules
            </span>
            <span>Select a schedule to update status or team</span>
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

          {!isLoading && filteredSchedules.length === 0 && (
            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-[#1E2421]">
                {schedules.length === 0
                  ? 'No collection schedules stored yet'
                  : 'No schedules match your selected filters'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {schedules.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setAreaFilter('All');
                      setCategoryFilter('All');
                      setStatusFilter('All');
                    }}
                    className="min-h-[40px] px-4 py-2 rounded-lg bg-[#E6F2EA] text-[#1F4E37] text-xs font-semibold"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onRestoreDemoSchedules}
                    className="min-h-[40px] px-4 py-2 rounded-lg bg-[#E6F2EA] text-[#1F4E37] text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Restore Demo Schedules</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {!isLoading && filteredSchedules.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#DCE3DD] bg-[#F8F7F3] text-xs font-semibold text-[#525D57]">
                      <th className="py-3 px-4">Schedule</th>
                      <th className="py-3 px-4">Area &amp; Stream</th>
                      <th className="py-3 px-4">Window</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE3DD] text-sm">
                    {filteredSchedules.map((schedule) => {
                      const isSelected = selectedSchedule?.id === schedule.id;
                      const cat = WASTE_CATEGORIES[schedule.wasteCategory];
                      const catStyle = CATEGORY_STYLES[schedule.wasteCategory];
                      return (
                        <tr
                          key={schedule.id}
                          onClick={() => {
                            setSelectedScheduleId(schedule.id);
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
                              {schedule.id}
                            </p>
                            <p className="text-xs text-[#525D57]">
                              <span className={`font-semibold ${PRIORITY_TEXT_CLASS[schedule.priority]}`}>
                                {schedule.priority} Priority
                              </span>
                              {' · '}
                              {schedule.isDemoRecord ? 'Demo' : 'Created'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-xs font-semibold text-[#1E2421]">
                              {schedule.area}
                            </p>
                            <p className={`text-xs inline-flex items-center gap-1 ${catStyle.accentText}`}>
                              <CategoryIcon category={schedule.wasteCategory} className="w-3.5 h-3.5" />
                              <span>{cat.shortName}</span>
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-mono tabular-nums text-xs font-medium text-[#1E2421]">
                              {schedule.scheduledDate}
                            </p>
                            <p className="font-mono tabular-nums text-xs text-[#525D57]">
                              {schedule.scheduledTime}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <ScheduleStatusBadge status={schedule.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredSchedules.map((schedule) => {
                  const isSelected = selectedSchedule?.id === schedule.id;
                  const cat = WASTE_CATEGORIES[schedule.wasteCategory];
                  return (
                    <button
                      key={schedule.id}
                      type="button"
                      onClick={() => {
                        setSelectedScheduleId(schedule.id);
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
                          {schedule.id} · {schedule.isDemoRecord ? 'Demo Record' : 'Created'}
                        </span>
                        <ScheduleStatusBadge status={schedule.status} />
                      </div>
                      <p className="text-sm font-semibold text-[#1E2421]">
                        {schedule.area} — {cat.shortName}
                      </p>
                      <p className="text-xs text-[#525D57] font-mono tabular-nums">
                        {schedule.scheduledDate} at {schedule.scheduledTime} ·{' '}
                        <span className={PRIORITY_TEXT_CLASS[schedule.priority]}>
                          {schedule.priority} Priority
                        </span>
                      </p>
                      <p className="text-xs text-[#525D57] truncate">
                        {schedule.assignedTeamLabel}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Selected Schedule Detail & Status Updater */}
        <aside className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 lg:sticky lg:top-20">
          {selectedSchedule ? (
            <>
              <div className="pb-4 border-b border-[#DCE3DD] space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-[#525D57]">
                    <span className="font-mono tabular-nums font-semibold text-[#1E2421]">
                      {selectedSchedule.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {selectedSchedule.isDemoRecord
                        ? 'Demo Record'
                        : 'Admin Schedule'}
                    </span>
                  </div>
                  <ScheduleStatusBadge status={selectedSchedule.status} />
                </div>

                <h3 className="font-display text-lg sm:text-xl font-bold text-[#1E2421]">
                  {selectedSchedule.area}
                </h3>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#525D57]">
                  <span className="inline-flex items-center gap-1 font-medium text-[#1F4E37]">
                    <CategoryIcon
                      category={selectedSchedule.wasteCategory}
                      className="w-3.5 h-3.5"
                    />
                    {WASTE_CATEGORIES[selectedSchedule.wasteCategory].name}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {selectedSchedule.scheduledDate} {selectedSchedule.scheduledTime}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveScheduleUpdate} className="space-y-4">
                {/* Status Selection */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-[#1E2421]">
                    Collection Status
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {COLLECTION_SCHEDULE_STATUSES.map((statusOption) => (
                      <button
                        key={statusOption}
                        type="button"
                        onClick={() => {
                          setDraftStatus(statusOption);
                          setUpdateError(null);
                          setUpdateSuccessMsg(null);
                        }}
                        className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                          draftStatus === statusOption
                            ? 'bg-[#1F4E37] text-white border-[#1F4E37]'
                            : 'bg-[#F8F7F3] text-[#1E2421] border-[#DCE3DD] hover:bg-[#EBF1EC]'
                        }`}
                      >
                        {statusOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reassign Demo Fleet */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-schedule-fleet"
                    className="block text-xs font-semibold text-[#1E2421]"
                  >
                    Assigned Vehicle / Team (Demo Fleet)
                  </label>
                  <select
                    id="edit-schedule-fleet"
                    value={draftFleetId}
                    onChange={(e) => setDraftFleetId(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                  >
                    {DEMO_COLLECTION_FLEET.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.vehicleCode} · {unit.teamName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-[#1E2421]">
                    Priority
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {COLLECTION_PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setDraftPriority(p)}
                        className={`min-h-[40px] rounded-xl border text-xs font-semibold transition-colors ${
                          draftPriority === p
                            ? 'bg-[#1F4E37] text-white border-[#1F4E37]'
                            : 'bg-[#F8F7F3] text-[#1E2421] border-[#DCE3DD] hover:bg-[#EBF1EC]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-schedule-notes"
                    className="block text-xs font-semibold text-[#1E2421]"
                  >
                    Schedule Notes
                  </label>
                  <textarea
                    id="edit-schedule-notes"
                    rows={2}
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    placeholder="Operational pickup notes..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none resize-y"
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
                  <span>Save Schedule Update</span>
                </button>
              </form>
            </>
          ) : (
            <div className="py-8 text-center text-sm text-[#525D57]">
              Select a collection schedule to view or update its assignment.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
