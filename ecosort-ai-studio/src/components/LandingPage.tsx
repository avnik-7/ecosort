import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { CATEGORY_ORDER, WASTE_CATEGORIES } from '../data/wasteCatalog';
import { AppRole, CitizenView, WasteCategoryId } from '../types/ecosort';
import { CATEGORY_STYLES, CategoryIcon } from './categoryTheme';

interface LandingPageProps {
  onEnterCitizen: (initialView?: CitizenView, category?: WasteCategoryId | 'all') => void;
  onEnterAdmin: () => void;
  onSelectRole: (role: AppRole) => void;
}

const HERO_IMAGE_SRC = '/src/assets/images/ecosort_landing_hero_1795202683935.jpg';

export function LandingPage({
  onEnterCitizen,
  onEnterAdmin,
}: LandingPageProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* Split Editorial Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Hero Copy & Role Launchers */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-6 sm:p-10 shadow-sm">
            <div className="space-y-5">
              <p className="text-xs sm:text-sm font-medium text-[#1F4E37]">
                Smart Waste Segregation · Municipal Management Platform
              </p>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-[#1E2421] leading-[1.15]">
                A cleaner city starts with smarter segregation.
              </h1>

              <p className="text-base sm:text-lg text-[#525D57] leading-relaxed max-w-xl">
                EcoSort connects everyday household sorting with city-wide stream
                visibility. Citizens get clear, rule-based disposal instructions
                across four waste categories, while municipal teams monitor
                ward-level demonstration trends.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#DCE3DD] space-y-4">
              <p className="text-xs font-semibold text-[#525D57]">
                Choose your workspace to begin
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onEnterCitizen('dashboard')}
                  className="min-h-[48px] px-5 py-3 rounded-xl bg-[#1F4E37] hover:bg-[#173B2A] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  <span>Enter Citizen Portal</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onEnterAdmin}
                  className="min-h-[48px] px-5 py-3 rounded-xl bg-[#E6F2EA] hover:bg-[#D7EBDD] text-[#1F4E37] border border-[#C5DEC9] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  <span>Municipal Admin Portal</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#525D57] pt-1">
                <span>4 verified waste streams</span>
                <span aria-hidden="true">·</span>
                <span>Deterministic sorting rules</span>
                <span aria-hidden="true">·</span>
                <span>No sign-in required</span>
              </div>
            </div>
          </div>

          {/* Right Hero Photography */}
          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-[#DCE3DD] bg-[#EBF1EC] shadow-sm relative">
              {!imageError ? (
                <img
                  src={HERO_IMAGE_SRC}
                  alt="Four minimalist municipal waste segregation bins in sage green, forest green, ivory, and charcoal in a sunlit civic courtyard"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover lg:h-full"
                />
              ) : (
                <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center p-8 text-center bg-[#E6F2EA]">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {CATEGORY_ORDER.map((catId) => (
                      <div
                        key={catId}
                        className="w-16 h-16 rounded-xl bg-white border border-[#DCE3DD] flex items-center justify-center text-[#1F4E37]"
                      >
                        <CategoryIcon category={catId} className="w-6 h-6" />
                      </div>
                    ))}
                  </div>
                  <p className="font-display text-base font-semibold text-[#1E2421]">
                    Four-Stream Civic Segregation
                  </p>
                  <p className="text-sm text-[#525D57] mt-1 max-w-xs">
                    Wet, Dry, E-waste, and Hazardous streams separated at source.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Four Waste Categories Strip */}
      <section
        id="four-streams"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E2421] tracking-tight">
              Four standardized waste streams
            </h2>
            <p className="text-sm sm:text-base text-[#525D57] max-w-2xl">
              Every item in the EcoSort catalog maps to one clear handling path.
              Select a stream to inspect its rules and examples.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEnterCitizen('search')}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DCE3DD] bg-[#FFFFFF] hover:bg-[#EBF1EC] text-sm font-medium text-[#1F4E37] inline-flex items-center gap-2 transition-colors self-start sm:self-auto whitespace-nowrap shrink-0"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>Search an Item</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_ORDER.map((catId) => {
            const spec = WASTE_CATEGORIES[catId];
            const style = CATEGORY_STYLES[catId];
            return (
              <button
                key={catId}
                type="button"
                onClick={() => onEnterCitizen('guide', catId)}
                className="text-left bg-[#FFFFFF] border border-[#DCE3DD] hover:border-[#6F8F78] rounded-2xl p-5 sm:p-6 transition-colors flex flex-col justify-between gap-5 group shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl ${style.surfaceBg} ${style.accentText} flex items-center justify-center shrink-0`}
                    >
                      <CategoryIcon category={catId} className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-medium text-[#525D57]">
                      {spec.binDesignation}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-[#1E2421] group-hover:text-[#1F4E37] transition-colors">
                      {spec.shortName}
                    </h3>
                    <p className="text-sm text-[#525D57] mt-1 leading-relaxed">
                      {spec.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DCE3DD] flex items-center justify-between text-xs font-semibold text-[#1F4E37]">
                  <span>View stream guide</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Role Selector Comparison Section */}
      <section
        id="portal-selector"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E2421] tracking-tight">
            Two connected experiences
          </h2>
          <p className="text-sm sm:text-base text-[#525D57] max-w-2xl">
            Switch seamlessly between citizen sorting tools and municipal
            demonstration oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Citizen Portal Card */}
          <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-[#E6F2EA] text-[#1F4E37] flex items-center justify-center">
                  <Users className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-medium text-[#525D57]">For Households &amp; Residents</p>
                  <h3 className="font-display text-xl font-bold text-[#1E2421]">
                    Citizen Portal
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#525D57] leading-relaxed">
                Look up everyday household items, understand why they belong in
                Wet, Dry, E-waste, or Hazardous streams, and follow practical
                step-by-step preparation instructions.
              </p>

              <ul className="space-y-2.5 text-sm text-[#1E2421] pt-1">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Citizen dashboard with quick lookup &amp; sorting readiness checklist</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Filterable four-category Waste Segregation Guide</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#1F4E37] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Deterministic item search with honest uncertainty handling</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onEnterCitizen('dashboard')}
              className="min-h-[48px] w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1F4E37] hover:bg-[#173B2A] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors self-start"
            >
              <span>Open Citizen Portal</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Municipal Admin Portal Card */}
          <div className="bg-[#FFFFFF] border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-[#EBF1EC] text-[#395543] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-medium text-[#525D57]">
                    For City Operations · Demonstration Data
                  </p>
                  <h3 className="font-display text-xl font-bold text-[#1E2421]">
                    Municipal Admin Portal
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#525D57] leading-relaxed">
                Inspect city-wide collection streams, diversion metrics, and
                ward-by-ward segregation compliance using clearly labeled
                demonstration statistics.
              </p>

              <ul className="space-y-2.5 text-sm text-[#1E2421] pt-1">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#395543] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Municipal dashboard with stream share &amp; contamination indicators</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#395543] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Category-by-category waste overview and recovery routes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#395543] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Interactive area-wise demonstration statistics across 6 wards</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onEnterAdmin}
              className="min-h-[48px] w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EBF1EC] text-[#1F4E37] border border-[#1F4E37] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors self-start"
            >
              <span>Open Municipal Admin</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Deterministic Classification Transparency Note */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#E6F2EA] border border-[#C5DEC9] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#1E2421]">
              Deterministic rules — never guesswork
            </h2>
            <p className="text-sm sm:text-base text-[#395543] leading-relaxed">
              Mis-sorted batteries or chemicals endanger sanitation workers and
              ruin recyclable batches. EcoSort classifies items strictly from
              verified catalog rules and returns an explicit uncertainty or
              clarification message whenever an item is unknown or ambiguous.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEnterCitizen('search')}
            className="min-h-[48px] px-5 py-3 rounded-xl bg-[#1F4E37] hover:bg-[#173B2A] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            <span>Test Item Lookup</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
