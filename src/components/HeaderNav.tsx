import React, { useState } from 'react';
import { Menu, Recycle, X } from 'lucide-react';
import { AdminView, AppRole, CitizenView } from '../types/ecosort';

interface HeaderNavProps {
  role: AppRole;
  citizenView: CitizenView;
  adminView: AdminView;
  onSelectRole: (role: AppRole) => void;
  onSelectCitizenView: (view: CitizenView) => void;
  onSelectAdminView: (view: AdminView) => void;
  onJumpToSection: (sectionId: string) => void;
}

export function HeaderNav({
  role,
  citizenView,
  adminView,
  onSelectRole,
  onSelectCitizenView,
  onSelectAdminView,
  onJumpToSection,
}: HeaderNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#DCE3DD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick(() => onSelectRole('landing'))}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 rounded-lg py-1 focus-visible:outline-2"
        >
          <span className="w-8 h-8 rounded-lg bg-[#1F4E37] text-white flex items-center justify-center shrink-0">
            <Recycle className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-[#1E2421]">
            EcoSort
          </span>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#525D57]"
        >
          {role === 'landing' && (
            <>
              <button
                type="button"
                onClick={() => onJumpToSection('four-streams')}
                className="hover:text-[#1F4E37] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
              >
                Four Streams
              </button>
              <button
                type="button"
                onClick={() => onJumpToSection('portal-selector')}
                className="hover:text-[#1F4E37] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
              >
                Portals
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectRole('citizen');
                  onSelectCitizenView('guide');
                }}
                className="hover:text-[#1F4E37] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
              >
                Segregation Guide
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectRole('admin');
                  onSelectAdminView('dashboard');
                }}
                className="hover:text-[#1F4E37] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
              >
                Municipal Overview
              </button>
            </>
          )}

          {role === 'citizen' && (
            <>
              <button
                type="button"
                onClick={() => onSelectCitizenView('dashboard')}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 underline-offset-4 ${
                  citizenView === 'dashboard'
                    ? 'text-[#1F4E37] font-semibold underline'
                    : 'hover:text-[#1F4E37] hover:underline'
                }`}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => onSelectCitizenView('guide')}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 underline-offset-4 ${
                  citizenView === 'guide'
                    ? 'text-[#1F4E37] font-semibold underline'
                    : 'hover:text-[#1F4E37] hover:underline'
                }`}
              >
                Segregation Guide
              </button>
              <button
                type="button"
                onClick={() => onSelectCitizenView('search')}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 underline-offset-4 ${
                  citizenView === 'search'
                    ? 'text-[#1F4E37] font-semibold underline'
                    : 'hover:text-[#1F4E37] hover:underline'
                }`}
              >
                Item Search
              </button>
              <button
                type="button"
                onClick={() => onSelectCitizenView('reports')}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 underline-offset-4 ${
                  citizenView === 'reports'
                    ? 'text-[#1F4E37] font-semibold underline'
                    : 'hover:text-[#1F4E37] hover:underline'
                }`}
              >
                Civic Reports
              </button>
            </>
          )}

          {role === 'admin' && (
            <>
              <button
                type="button"
                onClick={() => onSelectAdminView('dashboard')}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 underline-offset-4 ${
                  adminView === 'dashboard'
                    ? 'text-[#1F4E37] font-semibold underline'
                    : 'hover:text-[#1F4E37] hover:underline'
                }`}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => onSelectAdminView('reports')}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 underline-offset-4 ${
                  adminView === 'reports'
                    ? 'text-[#1F4E37] font-semibold underline'
                    : 'hover:text-[#1F4E37] hover:underline'
                }`}
              >
                Civic Reports
              </button>
              <button
                type="button"
                onClick={() => onSelectAdminView('planner')}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 underline-offset-4 ${
                  adminView === 'planner'
                    ? 'text-[#1F4E37] font-semibold underline'
                    : 'hover:text-[#1F4E37] hover:underline'
                }`}
              >
                Collection Planner
              </button>
              <button
                type="button"
                onClick={() => onSelectAdminView('hotspots')}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 underline-offset-4 ${
                  adminView === 'hotspots'
                    ? 'text-[#1F4E37] font-semibold underline'
                    : 'hover:text-[#1F4E37] hover:underline'
                }`}
              >
                Hotspot Insights
              </button>
              <button
                type="button"
                onClick={() => onSelectAdminView('analytics')}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 underline-offset-4 ${
                  adminView === 'analytics'
                    ? 'text-[#1F4E37] font-semibold underline'
                    : 'hover:text-[#1F4E37] hover:underline'
                }`}
              >
                Analytics
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {role === 'landing' ? (
            <button
              type="button"
              onClick={() => {
                onSelectRole('citizen');
                onSelectCitizenView('search');
              }}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#1F4E37] hover:bg-[#173B2A] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              Sort an Item
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectRole('landing')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-[#1F4E37] bg-[#E6F2EA] hover:bg-[#D7EBDD] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              Switch Role
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#1E2421] hover:bg-[#EBF1EC] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DCE3DD] bg-[#FFFFFF] px-4 py-3 space-y-1">
          <p className="text-xs font-medium text-[#525D57] px-3 py-1">
            Switch Experience
          </p>
          <button
            type="button"
            onClick={() => handleNavClick(() => onSelectRole('landing'))}
            className={`w-full text-left px-3 min-h-[44px] rounded-lg text-sm font-medium flex items-center justify-between ${
              role === 'landing'
                ? 'bg-[#E6F2EA] text-[#1F4E37]'
                : 'text-[#1E2421] hover:bg-[#F8F7F3]'
            }`}
          >
            <span>Platform Overview</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick(() => onSelectRole('citizen'))}
            className={`w-full text-left px-3 min-h-[44px] rounded-lg text-sm font-medium flex items-center justify-between ${
              role === 'citizen'
                ? 'bg-[#E6F2EA] text-[#1F4E37]'
                : 'text-[#1E2421] hover:bg-[#F8F7F3]'
            }`}
          >
            <span>Citizen Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick(() => onSelectRole('admin'))}
            className={`w-full text-left px-3 min-h-[44px] rounded-lg text-sm font-medium flex items-center justify-between ${
              role === 'admin'
                ? 'bg-[#E6F2EA] text-[#1F4E37]'
                : 'text-[#1E2421] hover:bg-[#F8F7F3]'
            }`}
          >
            <span>Municipal Admin Portal</span>
          </button>
        </div>
      )}
    </header>
  );
}
