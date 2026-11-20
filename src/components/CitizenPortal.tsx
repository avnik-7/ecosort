import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  Check,
  ChevronRight,
  Flag,
  HelpCircle,
  LayoutDashboard,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  CATEGORY_ORDER,
  filterCatalogItems,
  resolveWasteQuery,
  WASTE_CATEGORIES,
  WASTE_ITEMS,
} from '../data/wasteCatalog';
import {
  CitizenView,
  CivicReport,
  CivicReportType,
  WasteCategoryId,
  WasteItem,
} from '../types/ecosort';
import { CreateReportResult } from '../utils/civicReportsStorage';
import { CATEGORY_STYLES, CategoryIcon } from './categoryTheme';
import { CitizenReportsSection } from './CitizenReportsSection';
import { DisposalDetailPanel } from './DisposalDetailPanel';

interface CitizenPortalProps {
  activeView: CitizenView;
  onChangeView: (view: CitizenView) => void;
  selectedCategoryFilter: WasteCategoryId | 'all';
  onChangeCategoryFilter: (cat: WasteCategoryId | 'all') => void;
  onSwitchToAdmin: (initialView?: 'dashboard' | 'reports') => void;
  reports: CivicReport[];
  reportsLoading: boolean;
  reportsError: string | null;
  reportsCorrupted: boolean;
  onSubmitReport: (input: {
    reportType: CivicReportType;
    area: string;
    locationDetail: string;
    description: string;
    contactOptional?: string;
  }) => CreateReportResult;
  onRecoverCorruptReports: () => void;
  onRestoreDemoReports: () => void;
}

interface ChecklistTask {
  id: string;
  label: string;
  streamHint: string;
}

const HOUSEHOLD_CHECKLIST: ChecklistTask[] = [
  {
    id: 'drain-wet',
    label: 'Drain excess soup or liquids from kitchen scraps before binning',
    streamHint: 'Wet',
  },
  {
    id: 'rinse-dry',
    label: 'Rinse and air-dry plastic bottles, cans, and glass jars',
    streamHint: 'Dry',
  },
  {
    id: 'flatten-boxes',
    label: 'Flatten clean corrugated cardboard and keep oil-stained lids separate',
    streamHint: 'Dry / Wet',
  },
  {
    id: 'tape-batteries',
    label: 'Tape lithium & 9V battery terminals before storing for drop-off',
    streamHint: 'Hazardous',
  },
  {
    id: 'wipe-devices',
    label: 'Back up and factory-reset old phones before E-waste drop-off',
    streamHint: 'E-waste',
  },
];

const QUICK_SEARCH_EXAMPLES = [
  'Coffee grounds',
  'PET bottle',
  'Charging cable',
  'Paint can',
  'Pizza box',
  'Oil',
  'Battery',
  'Unmarked chemical',
];

export function CitizenPortal({
  activeView,
  onChangeView,
  selectedCategoryFilter,
  onChangeCategoryFilter,
  onSwitchToAdmin,
  reports,
  reportsLoading,
  reportsError,
  reportsCorrupted,
  onSubmitReport,
  onRecoverCorruptReports,
  onRestoreDemoReports,
}: CitizenPortalProps) {
  const [dashboardQuery, setDashboardQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('Coffee grounds');
  const [guideQuery, setGuideQuery] = useState('');
  const [selectedGuideItem, setSelectedGuideItem] = useState<WasteItem | null>(
    WASTE_ITEMS[0]
  );
  const [recentLookups, setRecentLookups] = useState<WasteItem[]>([
    WASTE_ITEMS[0],
    WASTE_ITEMS[7],
    WASTE_ITEMS[14],
  ]);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({
    'drain-wet': true,
    'rinse-dry': true,
  });

  const searchResolution = useMemo(
    () => resolveWasteQuery(searchQuery),
    [searchQuery]
  );

  const filteredGuideItems = useMemo(
    () => filterCatalogItems(guideQuery, selectedCategoryFilter),
    [guideQuery, selectedCategoryFilter]
  );

  const recordLookup = (item: WasteItem) => {
    setRecentLookups((prev) => {
      const next = [item, ...prev.filter((existing) => existing.id !== item.id)];
      return next.slice(0, 4);
    });
  };

  const handleDashboardSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = dashboardQuery.trim();
    if (trimmed) {
      setSearchQuery(trimmed);
      const res = resolveWasteQuery(trimmed);
      if (res.primaryMatch) {
        recordLookup(res.primaryMatch);
      }
    }
    onChangeView('search');
  };

  const handleSelectCandidate = (item: WasteItem) => {
    setSearchQuery(item.name);
    recordLookup(item);
  };

  const handleQuickExample = (example: string) => {
    setSearchQuery(example);
    const res = resolveWasteQuery(example);
    if (res.primaryMatch) {
      recordLookup(res.primaryMatch);
    }
  };

  const toggleChecklistTask = (id: string) => {
    setCheckedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = HOUSEHOLD_CHECKLIST.filter((t) => checkedTasks[t.id]).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-20">
      {/* Portal Context & Sub-navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#DCE3DD]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
            <span>Citizen Portal</span>
            <span aria-hidden="true">·</span>
            <span>Deterministic Sorting &amp; Guidance</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1E2421] tracking-tight">
            {activeView === 'dashboard' && 'Citizen Segregation Dashboard'}
            {activeView === 'guide' && 'Waste Segregation Guide'}
            {activeView === 'search' && 'Waste Item Search & Disposal'}
            {activeView === 'reports' && 'Civic Waste Reports'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Citizen portal views"
            className="inline-flex items-center p-1 rounded-xl bg-[#EBF1EC] border border-[#DCE3DD] overflow-x-auto max-w-full"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'dashboard'}
              onClick={() => onChangeView('dashboard')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'dashboard'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'guide'}
              onClick={() => onChangeView('guide')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'guide'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>Segregation Guide</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'search'}
              onClick={() => onChangeView('search')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'search'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Item Search</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'reports'}
              onClick={() => onChangeView('reports')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'reports'
                  ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                  : 'text-[#525D57] hover:text-[#1E2421]'
              }`}
            >
              <Flag className="w-4 h-4" aria-hidden="true" />
              <span>Civic Reports</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSwitchToAdmin('dashboard')}
            className="text-xs font-semibold text-[#1F4E37] hover:underline underline-offset-4 whitespace-nowrap shrink-0 py-2 px-1"
          >
            Switch to Municipal Admin
          </button>
        </div>
      </div>

      {/* VIEW 1: CITIZEN DASHBOARD */}
      {activeView === 'dashboard' && (
        <div className="space-y-8">
          {/* Quick Lookup Hero Card */}
          <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-8 shadow-sm space-y-5">
            <div className="max-w-2xl space-y-1.5">
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#1E2421]">
                Not sure which bin an item belongs in?
              </h2>
              <p className="text-sm text-[#525D57]">
                Search our verified household catalog for deterministic sorting
                rules, preparation tips, and safety warnings.
              </p>
            </div>

            <form
              onSubmit={handleDashboardSearchSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-[#525D57] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={dashboardQuery}
                  onChange={(e) => setDashboardQuery(e.target.value)}
                  placeholder="Try: banana peel, pizza box, charging cable, paint can..."
                  aria-label="Search waste item"
                  className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#1F4E37] hover:bg-[#173B2A] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Check Disposal Rule</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-medium text-[#525D57]">
                Common lookups:
              </span>
              {['Coffee grounds', 'Pizza box', 'AA battery', 'Old phone'].map(
                (sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      handleQuickExample(sample);
                      onChangeView('search');
                    }}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#F8F7F3] hover:bg-[#E6F2EA] border border-[#DCE3DD] text-xs font-medium text-[#1E2421] transition-colors"
                  >
                    {sample}
                  </button>
                )
              )}
            </div>
          </section>

          {/* 4 Category Quick-Reference Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#1E2421]">
                Quick Category Reference
              </h2>
              <button
                type="button"
                onClick={() => {
                  onChangeCategoryFilter('all');
                  onChangeView('guide');
                }}
                className="text-xs sm:text-sm font-semibold text-[#1F4E37] hover:underline underline-offset-4 whitespace-nowrap"
              >
                Open full guide ({WASTE_ITEMS.length} items)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CATEGORY_ORDER.map((catId) => {
                const cat = WASTE_CATEGORIES[catId];
                const style = CATEGORY_STYLES[catId];
                const itemCount = WASTE_ITEMS.filter(
                  (i) => i.category === catId
                ).length;

                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => {
                      onChangeCategoryFilter(catId);
                      onChangeView('guide');
                    }}
                    className="text-left bg-[#FFFFFF] border border-[#DCE3DD] hover:border-[#6F8F78] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`w-10 h-10 rounded-xl ${style.surfaceBg} ${style.accentText} flex items-center justify-center`}
                        >
                          <CategoryIcon category={catId} className="w-5 h-5" />
                        </span>
                        <span className="font-mono tabular-nums text-xs text-[#525D57]">
                          {itemCount} items
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-[#1E2421]">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-[#525D57] mt-0.5">
                          {cat.binDesignation}
                        </p>
                      </div>
                      <ul className="space-y-1 text-xs text-[#525D57]">
                        {cat.examples.slice(0, 3).map((ex) => (
                          <li key={ex} className="truncate">
                            · {ex}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <span className="text-xs font-semibold text-[#1F4E37] inline-flex items-center gap-1 pt-2 border-t border-[#DCE3DD]">
                      <span>Explore {cat.shortName} rules</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Checklist + Recent Lookups & Demo Pickup Reference */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Household Sorting Readiness Checklist */}
            <section className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#1E2421]">
                    Daily Kitchen &amp; Bin Checklist
                  </h2>
                  <p className="text-xs sm:text-sm text-[#525D57]">
                    Practical habits that prevent contamination before pickup.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono tabular-nums text-xs font-semibold text-[#1F4E37]">
                    {completedCount}/{HOUSEHOLD_CHECKLIST.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCheckedTasks({})}
                    aria-label="Reset checklist"
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#525D57] hover:bg-[#F8F7F3] hover:text-[#1E2421]"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-[#DCE3DD]">
                {HOUSEHOLD_CHECKLIST.map((task) => {
                  const checked = Boolean(checkedTasks[task.id]);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => toggleChecklistTask(task.id)}
                      className="w-full py-3.5 flex items-start gap-3 text-left min-h-[48px] group"
                    >
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          checked
                            ? 'bg-[#1F4E37] border-[#1F4E37] text-white'
                            : 'bg-[#FFFFFF] border-[#9AA89F] group-hover:border-[#1F4E37]'
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-snug ${
                            checked
                              ? 'line-through text-[#738079]'
                              : 'text-[#1E2421]'
                          }`}
                        >
                          {task.label}
                        </p>
                        <p className="text-xs text-[#525D57] mt-0.5">
                          Stream: {task.streamHint}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Recent Lookups + Demo Schedule Notice */}
            <div className="lg:col-span-5 space-y-6">
              <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
                <h2 className="font-display text-lg font-bold text-[#1E2421]">
                  Recent Item Lookups
                </h2>
                <div className="divide-y divide-[#DCE3DD]">
                  {recentLookups.map((item) => {
                    const cat = WASTE_CATEGORIES[item.category];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSearchQuery(item.name);
                          onChangeView('search');
                        }}
                        className="w-full py-3 flex items-center justify-between gap-3 text-left min-h-[48px] hover:bg-[#F8F7F3] px-2 -mx-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-8 h-8 rounded-lg ${CATEGORY_STYLES[item.category].surfaceBg} ${CATEGORY_STYLES[item.category].accentText} flex items-center justify-center shrink-0`}
                          >
                            <CategoryIcon category={item.category} className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1E2421] truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-[#525D57] truncate">
                              {cat.shortName} · {cat.binDesignation}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#525D57] shrink-0" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="bg-[#EBF1EC] border border-[#CFDAD1] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1F4E37]">
                    <CalendarClock className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Sample Pickup Reference</span>
                  </div>
                  <span className="text-xs font-medium text-[#395543]">
                    Demonstration Data
                  </span>
                </div>
                <dl className="space-y-2 text-xs sm:text-sm text-[#1E2421]">
                  <div className="flex justify-between gap-4 py-1 border-b border-[#CFDAD1]">
                    <dt className="font-medium text-[#525D57]">Wet Organics</dt>
                    <dd className="font-medium">Daily · Morning Curbside</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1 border-b border-[#CFDAD1]">
                    <dt className="font-medium text-[#525D57]">Dry Recyclables</dt>
                    <dd className="font-medium">Tue &amp; Fri · Curbside</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1">
                    <dt className="font-medium text-[#525D57]">E-waste &amp; HHW</dt>
                    <dd className="font-medium">1st Saturday Ward Depot</dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>

          {/* Civic Reports Quick Launch Card */}
          <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-[#525D57]">
                <Flag className="w-3.5 h-3.5 text-[#1F4E37]" aria-hidden="true" />
                <span>Civic Reports</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {reports.filter((r) => r.status !== 'Resolved').length} active in local queue
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-[#1E2421]">
                Spotted an overflowing bin, missed pickup, or illegal dumping?
              </h2>
              <p className="text-sm text-[#525D57]">
                Submit a civic report to get a tracking ID and follow municipal status updates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChangeView('reports')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1F4E37] hover:bg-[#173B2A] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              <span>Open Civic Reports</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </section>
        </div>
      )}

      {/* VIEW 2: WASTE SEGREGATION GUIDE */}
      {activeView === 'guide' && (
        <div className="space-y-6">
          {/* Interactive Category Filter + Text Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EBF1EC] border border-[#DCE3DD] rounded-xl">
              <button
                type="button"
                onClick={() => onChangeCategoryFilter('all')}
                className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                    : 'text-[#525D57] hover:text-[#1E2421]'
                }`}
              >
                All Streams ({WASTE_ITEMS.length})
              </button>
              {CATEGORY_ORDER.map((catId) => {
                const cat = WASTE_CATEGORIES[catId];
                const isActive = selectedCategoryFilter === catId;
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => onChangeCategoryFilter(catId)}
                    className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[#FFFFFF] text-[#1F4E37] shadow-sm'
                        : 'text-[#525D57] hover:text-[#1E2421]'
                    }`}
                  >
                    <CategoryIcon category={catId} className="w-3.5 h-3.5" />
                    <span>{cat.shortName}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-72">
              <Search
                className="w-4 h-4 text-[#525D57] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={guideQuery}
                onChange={(e) => setGuideQuery(e.target.value)}
                placeholder="Filter guide items..."
                aria-label="Filter segregation guide items"
                className="w-full min-h-[44px] pl-10 pr-9 py-2 rounded-xl bg-[#FFFFFF] border border-[#DCE3DD] text-sm text-[#1E2421] placeholder:text-[#738079] focus:border-[#1F4E37] focus:outline-none"
              />
              {guideQuery && (
                <button
                  type="button"
                  onClick={() => setGuideQuery('')}
                  aria-label="Clear filter"
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[32px] min-w-[32px] flex items-center justify-center text-[#525D57] hover:text-[#1E2421]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Selected Category Standard Guidelines Panel */}
          {selectedCategoryFilter !== 'all' && (
            <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-7 shadow-sm space-y-5">
              {(() => {
                const spec = WASTE_CATEGORIES[selectedCategoryFilter];
                const style = CATEGORY_STYLES[selectedCategoryFilter];
                return (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE3DD]">
                      <div className="flex items-start gap-3.5">
                        <span
                          className={`w-11 h-11 rounded-xl ${style.surfaceBg} ${style.accentText} flex items-center justify-center shrink-0`}
                        >
                          <CategoryIcon category={spec.id} className="w-5 h-5" />
                        </span>
                        <div>
                          <p className="text-xs font-medium text-[#525D57]">
                            {spec.binDesignation} · {spec.collectionRoute}
                          </p>
                          <h2 className="font-display text-xl font-bold text-[#1E2421]">
                            {spec.name}
                          </h2>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-[#525D57] leading-relaxed">
                      {spec.summary} <span className="font-medium text-[#1E2421]">{spec.preparationRule}</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl bg-[#E6F2EA]/70 border border-[#C5DEC9] p-4 space-y-2">
                        <h3 className="text-xs font-bold text-[#1F4E37]">
                          Do Include
                        </h3>
                        <ul className="space-y-1.5 text-sm text-[#1E2421]">
                          {spec.dos.map((rule) => (
                            <li key={rule} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl bg-[#FBF3EB]/80 border border-[#EAD3BE] p-4 space-y-2">
                        <h3 className="text-xs font-bold text-[#8C3F19]">
                          Keep Out
                        </h3>
                        <ul className="space-y-1.5 text-sm text-[#1E2421]">
                          {spec.donts.map((rule) => (
                            <li key={rule} className="flex items-start gap-2">
                              <X className="w-4 h-4 text-[#8C3F19] shrink-0 mt-0.5" aria-hidden="true" />
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                );
              })()}
            </section>
          )}

          {/* Catalog Items List + Active Disposal Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-[#525D57] px-1">
                <span>
                  Showing <span className="font-mono tabular-nums">{filteredGuideItems.length}</span>{' '}
                  catalog items
                </span>
                <span>Select any item for instructions</span>
              </div>

              {filteredGuideItems.length === 0 ? (
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-6 text-center space-y-3">
                  <p className="text-sm font-semibold text-[#1E2421]">
                    No matching items in this stream filter
                  </p>
                  <p className="text-xs text-[#525D57]">
                    Try clearing your filter or switching to All Streams.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setGuideQuery('');
                      onChangeCategoryFilter('all');
                    }}
                    className="min-h-[40px] px-4 py-2 rounded-lg bg-[#E6F2EA] text-[#1F4E37] text-xs font-semibold"
                  >
                    Reset Guide Filters
                  </button>
                </div>
              ) : (
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl divide-y divide-[#DCE3DD] overflow-hidden shadow-sm">
                  {filteredGuideItems.map((item) => {
                    const cat = WASTE_CATEGORIES[item.category];
                    const style = CATEGORY_STYLES[item.category];
                    const isSelected = selectedGuideItem?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedGuideItem(item);
                          recordLookup(item);
                        }}
                        className={`w-full text-left p-4 flex items-center justify-between gap-3 transition-colors min-h-[60px] ${
                          isSelected
                            ? 'bg-[#E6F2EA]/75'
                            : 'hover:bg-[#F8F7F3]'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className={`w-9 h-9 rounded-lg ${style.surfaceBg} ${style.accentText} flex items-center justify-center shrink-0 mt-0.5`}
                          >
                            <CategoryIcon category={item.category} className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1E2421] truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-[#525D57] truncate mt-0.5">
                              {cat.shortName} · {item.aliases.slice(0, 2).join(', ')}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-[#1F4E37]' : 'text-[#525D57]'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-7 lg:sticky lg:top-20">
              {selectedGuideItem ? (
                <DisposalDetailPanel
                  item={selectedGuideItem}
                  relatedItems={WASTE_ITEMS.filter(
                    (i) =>
                      i.category === selectedGuideItem.category &&
                      i.id !== selectedGuideItem.id
                  ).slice(0, 3)}
                  onSelectRelated={(rel) => {
                    setSelectedGuideItem(rel);
                    recordLookup(rel);
                  }}
                />
              ) : (
                <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center text-sm text-[#525D57]">
                  Select an item from the list to inspect disposal steps and safety
                  warnings.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: WASTE ITEM SEARCH & DETERMINISTIC LOOKUP */}
      {activeView === 'search' && (
        <div className="space-y-6">
          <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
            <div className="space-y-1">
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#1E2421]">
                Deterministic Waste Item Lookup
              </h2>
              <p className="text-sm text-[#525D57]">
                Enter an everyday item name. Ambiguous or unverified terms return a
                clarification prompt or uncertainty notice rather than guessing.
              </p>
            </div>

            <div className="relative">
              <Search
                className="w-5 h-5 text-[#525D57] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search item (e.g., banana peel, pizza box, lithium battery, unmarked chemical)..."
                aria-label="Search waste catalog"
                className="w-full min-h-[52px] pl-12 pr-12 py-3 rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] text-sm sm:text-base text-[#1E2421] placeholder:text-[#738079] focus:bg-[#FFFFFF] focus:border-[#1F4E37] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#525D57] hover:text-[#1E2421] hover:bg-[#EBF1EC]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-[#525D57]">
                Try deterministic matches, ambiguous terms, or unknown inputs:
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SEARCH_EXAMPLES.map((example) => {
                  const active =
                    searchQuery.trim().toLowerCase() === example.toLowerCase();
                  return (
                    <button
                      key={example}
                      type="button"
                      onClick={() => handleQuickExample(example)}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-[#1F4E37] text-white border-[#1F4E37]'
                          : 'bg-[#F8F7F3] text-[#1E2421] border-[#DCE3DD] hover:bg-[#E6F2EA]'
                      }`}
                    >
                      {example}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Search Resolution States */}
          {searchResolution.status === 'empty' && (
            <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-8 text-center space-y-2">
              <p className="font-display text-base font-semibold text-[#1E2421]">
                Enter an item above to check its disposal category
              </p>
              <p className="text-sm text-[#525D57] max-w-md mx-auto">
                You can search by common household names, packaging types, or
                select one of the quick-test examples above.
              </p>
            </div>
          )}

          {searchResolution.status === 'matched' && searchResolution.primaryMatch && (
            <DisposalDetailPanel
              item={searchResolution.primaryMatch}
              relatedItems={searchResolution.relatedMatches}
              onSelectRelated={handleSelectCandidate}
            />
          )}

          {searchResolution.status === 'ambiguous' && (
            <section className="bg-[#FFFFFF] border border-[#EAD3BE] rounded-2xl p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-start gap-3.5">
                <span className="w-10 h-10 rounded-xl bg-[#FBF3EB] text-[#8C3F19] flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#8C3F19]">
                    Clarification Required · Deterministic Rule Check
                  </p>
                  <h3 className="font-display text-xl font-bold text-[#1E2421]">
                    “{searchResolution.query}” could belong to multiple streams
                  </h3>
                  <p className="text-sm sm:text-base text-[#525D57] leading-relaxed">
                    {searchResolution.reason}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#DCE3DD]">
                <p className="text-sm font-semibold text-[#1E2421]">
                  {searchResolution.clarifyingQuestion}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResolution.ambiguousCandidates.map((candidate) => {
                    const cat = WASTE_CATEGORIES[candidate.category];
                    const style = CATEGORY_STYLES[candidate.category];
                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => handleSelectCandidate(candidate)}
                        className="text-left p-4 rounded-xl border border-[#DCE3DD] bg-[#F8F7F3] hover:bg-[#E6F2EA] hover:border-[#6F8F78] transition-colors flex items-start gap-3 min-h-[68px]"
                      >
                        <span
                          className={`w-9 h-9 rounded-lg ${style.surfaceBg} ${style.accentText} flex items-center justify-center shrink-0`}
                        >
                          <CategoryIcon category={candidate.category} className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1E2421]">
                            {candidate.name}
                          </p>
                          <p className="text-xs text-[#525D57] mt-0.5">
                            {cat.shortName} · {cat.binDesignation}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {searchResolution.status === 'unknown' && (
            <section className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-start gap-3.5">
                <span className="w-10 h-10 rounded-xl bg-[#FBF3EB] text-[#8C3F19] flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[#8C3F19]">
                    Unverified Item · Safe Uncertainty Notice
                  </p>
                  <h3 className="font-display text-xl font-bold text-[#1E2421]">
                    Category not confirmed for “{searchResolution.query}”
                  </h3>
                  <p className="text-sm sm:text-base text-[#525D57] leading-relaxed">
                    {searchResolution.reason}
                  </p>
                </div>
              </div>

              {searchResolution.uncertaintyGuidance && (
                <div className="rounded-xl bg-[#F8F7F3] border border-[#DCE3DD] p-4 space-y-2.5">
                  <p className="text-xs font-semibold text-[#1E2421]">
                    Recommended precautionary steps
                  </p>
                  <ul className="space-y-2 text-sm text-[#525D57]">
                    {searchResolution.uncertaintyGuidance.map((step) => (
                      <li key={step} className="flex items-start gap-2.5">
                        <span className="font-mono text-xs text-[#1F4E37] mt-0.5">
                          ·
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onChangeCategoryFilter('all');
                    onChangeView('guide');
                  }}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1F4E37] hover:bg-[#173B2A] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span>Browse Segregation Guide</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DCE3DD] bg-[#FFFFFF] hover:bg-[#F8F7F3] text-sm font-semibold text-[#1E2421] transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {/* VIEW 4: CIVIC REPORTS */}
      {activeView === 'reports' && (
        <CitizenReportsSection
          reports={reports}
          isLoading={reportsLoading}
          error={reportsError}
          isCorrupted={reportsCorrupted}
          onSubmitReport={onSubmitReport}
          onRecoverCorruptStorage={onRecoverCorruptReports}
          onRestoreDemoRecords={onRestoreDemoReports}
          onSwitchToAdminReports={() => onSwitchToAdmin('reports')}
        />
      )}
    </div>
  );
}
