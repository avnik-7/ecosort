import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  MapPin,
  RefreshCw,
  Save,
  Search,
  X,
} from 'lucide-react';
import { MUNICIPAL_ZONE_STATS } from '../data/municipalDemoData';
import {
  CivicReport,
  CivicReportStatus,
  CivicReportType,
} from '../types/ecosort';
import {
  CIVIC_REPORT_STATUS_ORDER,
  CIVIC_REPORT_TYPE_META,
  UpdateReportStatusResult,
} from '../utils/civicReportsStorage';
import {
  formatReportDate,
  ReportStatusHistoryTimeline,
  ReportStatusLabel,
} from './civicReportTheme';

interface AdminReportsSectionProps {
  reports: CivicReport[];
  isLoading: boolean;
  error: string | null;
  isCorrupted: boolean;
  onUpdateStatus: (
    reportId: string,
    nextStatus: CivicReportStatus,
    adminNote: string
  ) => UpdateReportStatusResult;
  onRecoverCorruptStorage: () => void;
  onRestoreDemoRecords: () => void;
  onSwitchToCitizenReports: () => void;
}

const ALL_REPORT_TYPES: CivicReportType[] = [
  'overflowing_bin',
  'illegal_dumping',
  'missed_collection',
  'hazardous_waste',
  'other',
];

export function AdminReportsSection({
  reports,
  isLoading,
  error,
  isCorrupted,
  onUpdateStatus,
  onRecoverCorruptStorage,
  onRestoreDemoRecords,
  onSwitchToCitizenReports,
}: AdminReportsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CivicReportType | 'All'>('All');
  const [areaFilter, setAreaFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<CivicReportStatus | 'All'>('All');

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<CivicReportStatus>('Under Review');
  const [draftNote, setDraftNote] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);

  const areaOptions = useMemo(() => {
    const set = new Set<string>(MUNICIPAL_ZONE_STATS.map((z) => z.zoneName));
    for (const r of reports) {
      set.add(r.area);
    }
    return Array.from(set).sort();
  }, [reports]);

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reports.filter((r) => {
      if (categoryFilter !== 'All' && r.reportType !== categoryFilter) return false;
      if (areaFilter !== 'All' && r.area !== areaFilter) return false;
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q) ||
        r.locationDetail.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
  }, [reports, searchQuery, categoryFilter, areaFilter, statusFilter]);

  const selectedReport = useMemo(() => {
    if (selectedReportId) {
      const match = reports.find((r) => r.id === selectedReportId);
      if (match) return match;
    }
    return filteredReports[0] ?? reports[0] ?? null;
  }, [reports, filteredReports, selectedReportId]);

  useEffect(() => {
    if (selectedReport) {
      setDraftStatus(selectedReport.status);
      setDraftNote(selectedReport.adminNote ?? '');
      setUpdateError(null);
    }
  }, [selectedReport?.id]);

  const counts = useMemo(() => {
    return {
      total: reports.length,
      submitted: reports.filter((r) => r.status === 'Submitted').length,
      active: reports.filter(
        (r) => r.status === 'Under Review' || r.status === 'In Progress'
      ).length,
      resolved: reports.filter((r) => r.status === 'Resolved').length,
      citizenCount: reports.filter((r) => !r.isDemoRecord).length,
    };
  }, [reports]);

  const handleSaveStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setUpdateError(null);
    setUpdateSuccessMsg(null);

    const result = onUpdateStatus(selectedReport.id, draftStatus, draftNote);
    if (result.error) {
      setUpdateError(result.error);
      return;
    }

    setUpdateSuccessMsg(
      `Saved ${selectedReport.id} as "${draftStatus}". Updated status is now visible in the Citizen Portal.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Shared Data Disclosure */}
      <div
        role="note"
        className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-semibold text-[#1E2421]">
              Shared Browser Report Queue · Demo Records + Local Citizen Submissions
            </p>
            <p className="text-xs sm:text-sm text-[#525D57]">
              Status updates and notes saved here persist in this browser&apos;s
              localStorage and synchronize immediately with the Citizen Portal.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSwitchToCitizenReports}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#E6F2EA] hover:bg-[#D7EBDD] text-xs font-semibold text-[#1F4E37] whitespace-nowrap shrink-0 self-start sm:self-center transition-colors"
        >
          Open Citizen Reports View
        </button>
      </div>

      {/* Storage Error / Corruption Banner */}
      {error && (
        <div
          role="alert"
          className="bg-[#FBF3EB] border border-[#EAD3BE] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#8C3F19] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#8C3F19]">
                Report storage error
              </p>
              <p className="text-xs sm:text-sm text-[#5D331B]">{error}</p>
            </div>
          </div>
          {isCorrupted && (
            <button
              type="button"
              onClick={onRecoverCorruptStorage}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#8C3F19] text-white text-xs font-semibold whitespace-nowrap shrink-0"
            >
              Backup &amp; Restore Demo Queue
            </button>
          )}
        </div>
      )}

      {/* Live Queue KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">Total Reports</p>
          <p className="font-display text-2xl font-bold text-[#1E2421] tabular-nums">
            {counts.total}
          </p>
          <p className="text-xs text-[#525D57] tabular-nums">
            {counts.citizenCount} citizen · {counts.total - counts.citizenCount} demo
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">Newly Submitted</p>
          <p className="font-display text-2xl font-bold text-[#395543] tabular-nums">
            {counts.submitted}
          </p>
          <p className="text-xs text-[#525D57]">Awaiting triage</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">Review / In Progress</p>
          <p className="font-display text-2xl font-bold text-[#8C3F19] tabular-nums">
            {counts.active}
          </p>
          <p className="text-xs text-[#525D57]">Active field handling</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs font-medium text-[#525D57]">Resolved</p>
          <p className="font-display text-2xl font-bold text-[#1F4E37] tabular-nums">
            {counts.resolved}
          </p>
          <p className="text-xs text-[#525D57]">Closed with resolution note</p>
        </div>
      </section>

      {/* Filters Toolbar */}
      <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#525D57] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, location, notes..."
              aria-label="Search reports"
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

          {/* Category Filter */}
          <div>
            <label htmlFor="admin-category-filter" className="sr-only">
              Filter by report category
            </label>
            <select
              id="admin-category-filter"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as CivicReportType | 'All')
              }
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
            >
              <option value="All">All Report Categories</option>
              {ALL_REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CIVIC_REPORT_TYPE_META[t].label}
                </option>
              ))}
            </select>
          </div>

          {/* Area Filter */}
          <div>
            <label htmlFor="admin-area-filter" className="sr-only">
              Filter by area
            </label>
            <select
              id="admin-area-filter"
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
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="admin-status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as CivicReportStatus | 'All')
              }
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {CIVIC_REPORT_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Split: Reports Table / Mobile Cards + Detail & Status Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Report Queue */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-[#525D57] px-1">
            <span>
              Showing <span className="font-mono tabular-nums">{filteredReports.length}</span>{' '}
              of <span className="font-mono tabular-nums">{reports.length}</span> reports
            </span>
            <span>Select a report to review or update status</span>
          </div>

          {isLoading && (
            <div className="space-y-3" aria-busy="true">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded-xl bg-[#FFFFFF] border border-[#DCE3DD] animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoading && filteredReports.length === 0 && (
            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-[#1E2421]">
                {reports.length === 0
                  ? 'No reports currently in storage'
                  : 'No reports match these filter criteria'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {reports.length > 0 ? (
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
                    onClick={onRestoreDemoRecords}
                    className="min-h-[40px] px-4 py-2 rounded-lg bg-[#E6F2EA] text-[#1F4E37] text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Restore Demo Reports</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {!isLoading && filteredReports.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#DCE3DD] bg-[#F8F7F3] text-xs font-semibold text-[#525D57]">
                      <th className="py-3 px-4">Report</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Area</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE3DD] text-sm">
                    {filteredReports.map((report) => {
                      const isSelected = selectedReport?.id === report.id;
                      const meta = CIVIC_REPORT_TYPE_META[report.reportType];
                      return (
                        <tr
                          key={report.id}
                          onClick={() => {
                            setSelectedReportId(report.id);
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
                              {report.id}
                            </p>
                            <p className="text-xs text-[#525D57]">
                              {report.isDemoRecord ? 'Demo Record' : 'Citizen Submission'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-[#1E2421]">
                            {meta.shortLabel}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-xs font-medium text-[#1E2421]">
                              {report.area}
                            </p>
                            <p className="text-xs text-[#525D57] truncate max-w-[180px]">
                              {report.locationDetail}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <ReportStatusLabel status={report.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden space-y-3">
                {filteredReports.map((report) => {
                  const isSelected = selectedReport?.id === report.id;
                  const meta = CIVIC_REPORT_TYPE_META[report.reportType];
                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => {
                        setSelectedReportId(report.id);
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
                          {report.id} · {report.isDemoRecord ? 'Demo Record' : 'Citizen'}
                        </span>
                        <ReportStatusLabel status={report.status} />
                      </div>
                      <p className="text-sm font-semibold text-[#1E2421]">
                        {meta.label} — {report.area}
                      </p>
                      <p className="text-xs text-[#525D57] line-clamp-2">
                        {report.locationDetail}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Report Detail & Administrative Status Update Panel */}
        <aside className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 lg:sticky lg:top-20">
          {selectedReport ? (
            <>
              <div className="pb-4 border-b border-[#DCE3DD] space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#525D57]">
                    <span className="font-mono tabular-nums font-semibold text-[#1E2421]">
                      {selectedReport.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {selectedReport.isDemoRecord ? 'Demo Record' : 'Citizen Submission'}
                    </span>
                  </div>
                  <ReportStatusLabel status={selectedReport.status} />
                </div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#1E2421]">
                  {CIVIC_REPORT_TYPE_META[selectedReport.reportType].label}
                </h2>
                <p className="text-xs sm:text-sm text-[#525D57] flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#1E2421]">{selectedReport.area}</strong> —{' '}
                    {selectedReport.locationDetail}
                  </span>
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-xs font-semibold text-[#525D57]">
                  Reported Issue Description
                </p>
                <p className="text-[#1E2421] leading-relaxed">
                  {selectedReport.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#525D57] pt-1">
                  <span className="font-mono tabular-nums">
                    Submitted {formatReportDate(selectedReport.createdAt)}
                  </span>
                  {selectedReport.contactOptional && (
                    <span>Contact: {selectedReport.contactOptional}</span>
                  )}
                </div>
              </div>

              {/* Admin Status Update Form */}
              <form
                onSubmit={handleSaveStatusUpdate}
                className="pt-4 border-t border-[#DCE3DD] space-y-4"
              >
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#1E2421]">
                    Update Workflow Status
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {CIVIC_REPORT_STATUS_ORDER.map((statusOption) => {
                      const active = draftStatus === statusOption;
                      return (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={() => {
                            setDraftStatus(statusOption);
                            setUpdateError(null);
                            setUpdateSuccessMsg(null);
                          }}
                          className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                            active
                              ? 'bg-[#1F4E37] text-white border-[#1F4E37]'
                              : 'bg-[#F8F7F3] text-[#1E2421] border-[#DCE3DD] hover:bg-[#EBF1EC]'
                          }`}
                        >
                          {statusOption}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-note-input"
                    className="block text-xs font-semibold text-[#1E2421]"
                  >
                    Administrative Update / Resolution Note
                    {draftStatus === 'Resolved' && (
                      <span className="font-normal text-[#8C3F19] ml-1">
                        (Required for Resolved)
                      </span>
                    )}
                  </label>
                  <textarea
                    id="admin-note-input"
                    rows={3}
                    value={draftNote}
                    onChange={(e) => {
                      setDraftNote(e.target.value);
                      setUpdateError(null);
                    }}
                    placeholder="Add crew dispatch notes, inspection findings, or resolution summary..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none resize-y"
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
                  <span>Save Status Update</span>
                </button>
              </form>

              {/* Chronological History */}
              <div className="pt-4 border-t border-[#DCE3DD] space-y-3">
                <p className="text-xs font-semibold text-[#1E2421]">
                  Audit &amp; Status History
                </p>
                <ReportStatusHistoryTimeline history={selectedReport.statusHistory} />
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm text-[#525D57]">
              Select a report from the queue to view details and update its status.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
