import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Info,
  MapPin,
  RefreshCw,
  Search,
  Send,
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
  CreateReportResult,
} from '../utils/civicReportsStorage';
import {
  formatReportDate,
  REPORT_TYPE_ICONS,
  ReportStatusHistoryTimeline,
  ReportStatusLabel,
} from './civicReportTheme';

interface CitizenReportsSectionProps {
  reports: CivicReport[];
  isLoading: boolean;
  error: string | null;
  isCorrupted: boolean;
  onSubmitReport: (input: {
    reportType: CivicReportType;
    area: string;
    locationDetail: string;
    description: string;
    contactOptional?: string;
  }) => CreateReportResult;
  onRecoverCorruptStorage: () => void;
  onRestoreDemoRecords: () => void;
  onSwitchToAdminReports: () => void;
}

const REPORT_TYPES: CivicReportType[] = [
  'overflowing_bin',
  'illegal_dumping',
  'missed_collection',
  'hazardous_waste',
  'other',
];

const WARD_AREAS = MUNICIPAL_ZONE_STATS.map((z) => z.zoneName);

export function CitizenReportsSection({
  reports,
  isLoading,
  error,
  isCorrupted,
  onSubmitReport,
  onRecoverCorruptStorage,
  onRestoreDemoRecords,
  onSwitchToAdminReports,
}: CitizenReportsSectionProps) {
  const [reportType, setReportType] = useState<CivicReportType>('overflowing_bin');
  const [areaChoice, setAreaChoice] = useState<string>(WARD_AREAS[0]);
  const [customArea, setCustomArea] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [description, setDescription] = useState('');
  const [contactOptional, setContactOptional] = useState('');

  const [fieldErrors, setFieldErrors] = useState<
    Partial<
      Record<'reportType' | 'area' | 'locationDetail' | 'description' | 'contactOptional', string>
    >
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmittedReport, setLastSubmittedReport] =
    useState<CivicReport | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [listFilterQuery, setListFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CivicReportStatus | 'All'>('All');
  const [showOnlyCitizenSubmitted, setShowOnlyCitizenSubmitted] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const effectiveArea = areaChoice === '__custom__' ? customArea : areaChoice;

  const filteredReports = useMemo(() => {
    const q = listFilterQuery.trim().toLowerCase();
    return reports.filter((report) => {
      if (showOnlyCitizenSubmitted && report.isDemoRecord) return false;
      if (statusFilter !== 'All' && report.status !== statusFilter) return false;
      if (!q) return true;
      return (
        report.id.toLowerCase().includes(q) ||
        report.area.toLowerCase().includes(q) ||
        report.locationDetail.toLowerCase().includes(q) ||
        report.description.toLowerCase().includes(q) ||
        CIVIC_REPORT_TYPE_META[report.reportType].label.toLowerCase().includes(q)
      );
    });
  }, [reports, listFilterQuery, statusFilter, showOnlyCitizenSubmitted]);

  const selectedReport = useMemo(() => {
    if (selectedReportId) {
      const match = reports.find((r) => r.id === selectedReportId);
      if (match) return match;
    }
    return filteredReports[0] ?? null;
  }, [reports, filteredReports, selectedReportId]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const result = onSubmitReport({
      reportType,
      area: effectiveArea,
      locationDetail,
      description,
      contactOptional,
    });

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      setSubmitError(result.error);
      return;
    }

    if (result.error || !result.report) {
      setFieldErrors({});
      setSubmitError(result.error || 'Could not submit report.');
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setLastSubmittedReport(result.report);
    setSelectedReportId(result.report.id);
    setLocationDetail('');
    setDescription('');
    setContactOptional('');
    if (areaChoice === '__custom__') {
      setCustomArea('');
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Shared LocalStorage Prototype Notice */}
      <div
        role="note"
        className="bg-[#EBF1EC] border border-[#CFDAD1] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-semibold text-[#1E2421]">
              Browser-Local Civic Reporting · Shared with Municipal Admin
            </p>
            <p className="text-xs sm:text-sm text-[#525D57] leading-relaxed">
              Reports submitted here are saved to this browser&apos;s localStorage
              and appear immediately in the Municipal Admin Portal on this device
              (no cross-device sync). Sample records are clearly labeled as Demo
              Records.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSwitchToAdminReports}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#C5DEC9] hover:bg-[#E6F2EA] text-xs font-semibold text-[#1F4E37] whitespace-nowrap shrink-0 self-start sm:self-center transition-colors"
        >
          View in Admin Portal
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
                Report storage warning
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
              Backup &amp; Initialize Demo Data
            </button>
          )}
        </div>
      )}

      {/* Confirmation Banner after Submission */}
      {lastSubmittedReport && (
        <div
          role="status"
          className="bg-[#E6F2EA] border border-[#C5DEC9] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#1E2421]">
                Civic report submitted · Reference ID{' '}
                <span className="font-mono tabular-nums text-[#1F4E37]">
                  {lastSubmittedReport.id}
                </span>
              </p>
              <p className="text-xs sm:text-sm text-[#395543]">
                {CIVIC_REPORT_TYPE_META[lastSubmittedReport.reportType].label} in{' '}
                {lastSubmittedReport.area} is now queued with status{' '}
                <span className="font-semibold">{lastSubmittedReport.status}</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCopyId(lastSubmittedReport.id)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#C5DEC9] text-xs font-semibold text-[#1F4E37] inline-flex items-center gap-1.5"
            >
              {copiedId === lastSubmittedReport.id ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setLastSubmittedReport(null)}
              aria-label="Dismiss confirmation"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#395543] hover:bg-[#D7EBDD]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Submission Form + Submitted Reports Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Submit Civic Report Form */}
        <section className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="space-y-1 pb-4 border-b border-[#DCE3DD]">
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#1E2421]">
              Submit a Civic Waste Report
            </h2>
            <p className="text-xs sm:text-sm text-[#525D57]">
              Report overflowing bins, illegal dumping, missed pickups, or
              hazardous items in your neighborhood.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
            {/* Report Type Selector */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold text-[#1E2421]">
                Report Type
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REPORT_TYPES.map((typeId) => {
                  const meta = CIVIC_REPORT_TYPE_META[typeId];
                  const Icon = REPORT_TYPE_ICONS[typeId];
                  const selected = reportType === typeId;
                  return (
                    <button
                      key={typeId}
                      type="button"
                      onClick={() => setReportType(typeId)}
                      className={`text-left p-3 rounded-xl border transition-colors min-h-[48px] flex items-start gap-2.5 ${
                        selected
                          ? 'bg-[#E6F2EA] border-[#1F4E37] text-[#1E2421]'
                          : 'bg-[#F8F7F3] border-[#DCE3DD] text-[#525D57] hover:bg-[#EBF1EC]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          selected ? 'text-[#1F4E37]' : 'text-[#525D57]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-semibold leading-snug">
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {fieldErrors.reportType && (
                <p className="text-xs text-[#8C3F19]">{fieldErrors.reportType}</p>
              )}
            </fieldset>

            {/* Area / Ward Selector */}
            <div className="space-y-1.5">
              <label
                htmlFor="report-area-select"
                className="block text-xs font-semibold text-[#1E2421]"
              >
                Area / Ward
              </label>
              <select
                id="report-area-select"
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
                  placeholder="Enter neighborhood or ward name"
                  aria-label="Custom area name"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none mt-2"
                />
              )}
              {fieldErrors.area && (
                <p className="text-xs text-[#8C3F19]">{fieldErrors.area}</p>
              )}
            </div>

            {/* Specific Location / Landmark */}
            <div className="space-y-1.5">
              <label
                htmlFor="report-location-input"
                className="block text-xs font-semibold text-[#1E2421]"
              >
                Street / Landmark / Bin Location
              </label>
              <input
                id="report-location-input"
                type="text"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="e.g., Outside 18 Elm Street opposite Bus Stop 4"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
              />
              {fieldErrors.locationDetail && (
                <p className="text-xs text-[#8C3F19]">{fieldErrors.locationDetail}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="report-description-input"
                  className="block text-xs font-semibold text-[#1E2421]"
                >
                  Issue Description
                </label>
                <span className="font-mono tabular-nums text-[11px] text-[#525D57]">
                  {description.trim().length}/1000
                </span>
              </div>
              <textarea
                id="report-description-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what needs attention, waste type involved, and any immediate hazards..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none resize-y"
              />
              {fieldErrors.description && (
                <p className="text-xs text-[#8C3F19]">{fieldErrors.description}</p>
              )}
            </div>

            {/* Optional Contact */}
            <div className="space-y-1.5">
              <label
                htmlFor="report-contact-input"
                className="block text-xs font-semibold text-[#1E2421]"
              >
                Contact Details <span className="font-normal text-[#525D57]">(Optional · Email or Phone)</span>
              </label>
              <input
                id="report-contact-input"
                type="text"
                value={contactOptional}
                onChange={(e) => setContactOptional(e.target.value)}
                placeholder="e.g., resident@example.org or +1 555 019 2210"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
              />
              {fieldErrors.contactOptional && (
                <p className="text-xs text-[#8C3F19]">{fieldErrors.contactOptional}</p>
              )}
            </div>

            {submitError && (
              <p role="alert" className="text-xs font-medium text-[#8C3F19]">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={isCorrupted}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#1F4E37] hover:bg-[#173B2A] disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>Submit Civic Report</span>
            </button>
          </form>
        </section>

        {/* Right: Submitted Reports & Live Status Tracker */}
        <section className="lg:col-span-7 space-y-5">
          <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#1E2421]">
                  Submitted Reports &amp; Status
                </h2>
                <p className="text-xs text-[#525D57]">
                  Track citizen complaints and municipal resolution notes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOnlyCitizenSubmitted((prev) => !prev)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors self-start sm:self-auto whitespace-nowrap ${
                  showOnlyCitizenSubmitted
                    ? 'bg-[#1F4E37] text-white border-[#1F4E37]'
                    : 'bg-[#F8F7F3] text-[#1E2421] border-[#DCE3DD] hover:bg-[#EBF1EC]'
                }`}
              >
                {showOnlyCitizenSubmitted ? 'Showing My Submissions Only' : 'Filter: My Submissions'}
              </button>
            </div>

            {/* Search + Status Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-[#525D57] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={listFilterQuery}
                  onChange={(e) => setListFilterQuery(e.target.value)}
                  placeholder="Search by ID (ECO-2026-...), area, or keyword..."
                  aria-label="Search civic reports"
                  className="w-full min-h-[44px] pl-10 pr-9 py-2 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none"
                />
                {listFilterQuery && (
                  <button
                    type="button"
                    onClick={() => setListFilterQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[32px] min-w-[32px] flex items-center justify-center text-[#525D57]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#EBF1EC] border border-[#DCE3DD]">
                {(['All', ...CIVIC_REPORT_STATUS_ORDER] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      statusFilter === status
                        ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                        : 'text-[#525D57] hover:text-[#1E2421]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3 py-2" aria-busy="true">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-20 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredReports.length === 0 && (
              <div className="rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] p-6 text-center space-y-3">
                <p className="text-sm font-semibold text-[#1E2421]">
                  {reports.length === 0
                    ? 'No civic reports stored yet'
                    : 'No reports match your current filter'}
                </p>
                <p className="text-xs text-[#525D57]">
                  {reports.length === 0
                    ? 'Submit a report using the form or restore sample demonstration records.'
                    : 'Clear search keywords or switch the status filter back to All.'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {reports.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setListFilterQuery('');
                        setStatusFilter('All');
                        setShowOnlyCitizenSubmitted(false);
                      }}
                      className="min-h-[40px] px-4 py-2 rounded-lg bg-[#E6F2EA] text-[#1F4E37] text-xs font-semibold"
                    >
                      Reset Filters
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onRestoreDemoRecords}
                      className="min-h-[40px] px-4 py-2 rounded-lg bg-[#E6F2EA] text-[#1F4E37] text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Load Demo Reports</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Reports List */}
            {!isLoading && filteredReports.length > 0 && (
              <div className="divide-y divide-[#DCE3DD] border border-[#DCE3DD] rounded-xl overflow-hidden">
                {filteredReports.map((report) => {
                  const meta = CIVIC_REPORT_TYPE_META[report.reportType];
                  const isSelected = selectedReport?.id === report.id;
                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => setSelectedReportId(report.id)}
                      className={`w-full text-left p-4 transition-colors space-y-2 ${
                        isSelected ? 'bg-[#E6F2EA]/70' : 'bg-[#FFFFFF] hover:bg-[#F8F7F3]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#525D57]">
                          <span className="font-mono tabular-nums font-semibold text-[#1E2421]">
                            {report.id}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{meta.shortLabel}</span>
                          {report.isDemoRecord && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-medium text-[#395543]">
                                Demo Record
                              </span>
                            </>
                          )}
                        </div>
                        <ReportStatusLabel status={report.status} />
                      </div>

                      <p className="text-sm font-semibold text-[#1E2421] line-clamp-1">
                        {report.area} — {report.locationDetail}
                      </p>

                      <p className="text-xs text-[#525D57] line-clamp-2 leading-relaxed">
                        {report.description}
                      </p>

                      {report.adminNote && (
                        <p className="text-xs text-[#1F4E37] font-medium line-clamp-1">
                          Admin note: {report.adminNote}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Report Detail & Status History */}
          {selectedReport && (
            <article className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#DCE3DD]">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#525D57]">
                    <span className="font-mono tabular-nums font-semibold text-[#1E2421]">
                      {selectedReport.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{CIVIC_REPORT_TYPE_META[selectedReport.reportType].label}</span>
                    {selectedReport.isDemoRecord && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-[#395543]">Demo Record</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#1E2421]">
                    {selectedReport.area}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#525D57] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#1F4E37]" aria-hidden="true" />
                    <span>{selectedReport.locationDetail}</span>
                  </p>
                </div>

                <ReportStatusLabel status={selectedReport.status} />
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#525D57]">
                  Citizen Report Description
                </h4>
                <p className="text-sm text-[#1E2421] leading-relaxed">
                  {selectedReport.description}
                </p>
                {selectedReport.contactOptional && (
                  <p className="text-xs text-[#525D57]">
                    Contact provided: {selectedReport.contactOptional}
                  </p>
                )}
              </div>

              {selectedReport.adminNote && (
                <div className="rounded-xl bg-[#E6F2EA] border border-[#C5DEC9] p-4 space-y-1">
                  <p className="text-xs font-semibold text-[#1F4E37]">
                    Latest Municipal Update
                  </p>
                  <p className="text-sm text-[#1E2421] leading-relaxed">
                    {selectedReport.adminNote}
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-[#DCE3DD]">
                <div className="flex items-center justify-between text-xs text-[#525D57]">
                  <span className="font-semibold text-[#1E2421]">Status History</span>
                  <span className="font-mono tabular-nums">
                    Updated {formatReportDate(selectedReport.updatedAt)}
                  </span>
                </div>
                <ReportStatusHistoryTimeline history={selectedReport.statusHistory} />
              </div>
            </article>
          )}
        </section>
      </div>
    </div>
  );
}
