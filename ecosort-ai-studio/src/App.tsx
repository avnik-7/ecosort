/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CitizenPortal } from './components/CitizenPortal';
import { HeaderNav } from './components/HeaderNav';
import { LandingPage } from './components/LandingPage';
import { MunicipalPortal } from './components/MunicipalPortal';
import { useCivicReports } from './hooks/useCivicReports';
import { useCollectionPlanner } from './hooks/useCollectionPlanner';
import { useWasteBatches } from './hooks/useWasteBatches';
import {
  AdminView,
  AppRole,
  CitizenView,
  WasteCategoryId,
} from './types/ecosort';

export default function App() {
  const [role, setRole] = useState<AppRole>('landing');
  const [citizenView, setCitizenView] = useState<CitizenView>('dashboard');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    WasteCategoryId | 'all'
  >('all');

  const {
    reports,
    isLoading: reportsLoading,
    error: reportsError,
    isCorrupted: reportsCorrupted,
    submitReport,
    updateStatus,
    restoreDemoRecords,
    recoverCorruptStorage,
  } = useCivicReports();

  const {
    schedules,
    isLoading: schedulesLoading,
    error: schedulesError,
    isCorrupted: schedulesCorrupted,
    addSchedule,
    editSchedule,
    restoreDemoSchedules,
    recoverCorruptSchedules,
  } = useCollectionPlanner();

  const {
    batches,
    isLoading: batchesLoading,
    error: batchesError,
    isCorrupted: batchesCorrupted,
    addBatch,
    updateBatchStatus,
    restoreDemoBatches,
    recoverCorruptBatches,
  } = useWasteBatches();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRole = (nextRole: AppRole) => {
    setRole(nextRole);
    scrollToTop();
  };

  const handleEnterCitizen = (
    initialView: CitizenView = 'dashboard',
    category: WasteCategoryId | 'all' = 'all'
  ) => {
    setSelectedCategoryFilter(category);
    setCitizenView(initialView);
    setRole('citizen');
    scrollToTop();
  };

  const handleEnterAdmin = (initialView: AdminView = 'dashboard') => {
    setAdminView(initialView);
    setRole('admin');
    scrollToTop();
  };

  const handleJumpToSection = (sectionId: string) => {
    if (role !== 'landing') {
      setRole('landing');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#1E2421]">
      <HeaderNav
        role={role}
        citizenView={citizenView}
        adminView={adminView}
        onSelectRole={handleSelectRole}
        onSelectCitizenView={(view) => {
          setCitizenView(view);
          scrollToTop();
        }}
        onSelectAdminView={(view) => {
          setAdminView(view);
          scrollToTop();
        }}
        onJumpToSection={handleJumpToSection}
      />

      {/* Contextual Role Selector Strip inside portals for quick role switching */}
      {role !== 'landing' && (
        <div className="bg-[#FFFFFF] border-b border-[#DCE3DD]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#525D57]">
              <span className="font-medium text-[#1E2421]">Active Role:</span>
              <span>
                {role === 'citizen' ? 'Citizen Portal' : 'Municipal Admin Portal'}
              </span>
            </div>

            <div
              role="group"
              aria-label="Role selector"
              className="inline-flex items-center p-0.5 rounded-lg bg-[#F8F7F3] border border-[#DCE3DD]"
            >
              <button
                type="button"
                onClick={() => handleSelectRole('landing')}
                className="min-h-[34px] px-3 py-1 rounded-md text-xs font-medium text-[#525D57] hover:text-[#1E2421] transition-colors whitespace-nowrap"
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('citizen')}
                className={`min-h-[34px] px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  role === 'citizen'
                    ? 'bg-[#1F4E37] text-white'
                    : 'text-[#525D57] hover:text-[#1E2421]'
                }`}
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`min-h-[34px] px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  role === 'admin'
                    ? 'bg-[#1F4E37] text-white'
                    : 'text-[#525D57] hover:text-[#1E2421]'
                }`}
              >
                Municipal Admin
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {role === 'landing' && (
          <LandingPage
            onEnterCitizen={handleEnterCitizen}
            onEnterAdmin={() => handleEnterAdmin('dashboard')}
            onSelectRole={handleSelectRole}
          />
        )}

        {role === 'citizen' && (
          <CitizenPortal
            activeView={citizenView}
            onChangeView={setCitizenView}
            selectedCategoryFilter={selectedCategoryFilter}
            onChangeCategoryFilter={setSelectedCategoryFilter}
            onSwitchToAdmin={(initialView = 'dashboard') =>
              handleEnterAdmin(initialView)
            }
            reports={reports}
            reportsLoading={reportsLoading}
            reportsError={reportsError}
            reportsCorrupted={reportsCorrupted}
            onSubmitReport={submitReport}
            onRecoverCorruptReports={recoverCorruptStorage}
            onRestoreDemoReports={restoreDemoRecords}
          />
        )}

        {role === 'admin' && (
          <MunicipalPortal
            activeView={adminView}
            onChangeView={setAdminView}
            onSwitchToCitizen={(initialView = 'dashboard') =>
              handleEnterCitizen(initialView)
            }
            reports={reports}
            reportsLoading={reportsLoading}
            reportsError={reportsError}
            reportsCorrupted={reportsCorrupted}
            onUpdateReportStatus={updateStatus}
            onRecoverCorruptReports={recoverCorruptStorage}
            onRestoreDemoReports={restoreDemoRecords}
            schedules={schedules}
            schedulesLoading={schedulesLoading}
            schedulesError={schedulesError}
            schedulesCorrupted={schedulesCorrupted}
            onCreateSchedule={addSchedule}
            onUpdateSchedule={editSchedule}
            onRecoverCorruptSchedules={recoverCorruptSchedules}
            onRestoreDemoSchedules={restoreDemoSchedules}
            batches={batches}
            batchesLoading={batchesLoading}
            batchesError={batchesError}
            batchesCorrupted={batchesCorrupted}
            onCreateBatch={addBatch}
            onUpdateBatchStatus={updateBatchStatus}
            onRecoverCorruptBatches={recoverCorruptBatches}
            onRestoreDemoBatches={restoreDemoBatches}
          />
        )}
      </main>

      <footer className="border-t border-[#DCE3DD] bg-[#FFFFFF] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#525D57]">
          <div className="space-y-1">
            <p className="font-display font-semibold text-sm text-[#1E2421]">
              EcoSort
            </p>
            <p>A cleaner city starts with smarter segregation.</p>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-medium">
            <button
              type="button"
              onClick={() => handleSelectRole('landing')}
              className="hover:text-[#1F4E37] hover:underline underline-offset-4 py-1"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleEnterCitizen('guide')}
              className="hover:text-[#1F4E37] hover:underline underline-offset-4 py-1"
            >
              Segregation Guide
            </button>
            <button
              type="button"
              onClick={() => handleEnterCitizen('reports')}
              className="hover:text-[#1F4E37] hover:underline underline-offset-4 py-1"
            >
              Civic Reports
            </button>
            <button
              type="button"
              onClick={() => handleEnterAdmin('areas')}
              className="hover:text-[#1F4E37] hover:underline underline-offset-4 py-1"
            >
              Municipal Demo Stats
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
