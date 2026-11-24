import { useCallback, useEffect, useState } from 'react';
import {
  CivicReport,
  CivicReportCreateInput,
  CivicReportStatus,
} from '../types/ecosort';
import {
  CIVIC_REPORTS_STORAGE_KEY,
  CIVIC_REPORTS_UPDATED_EVENT,
  createCivicReport,
  CreateReportResult,
  loadCivicReports,
  recoverCorruptedStorageWithDemo,
  restoreMissingDemoReports,
  updateCivicReportStatus,
  UpdateReportStatusResult,
} from '../utils/civicReportsStorage';

export function useCivicReports() {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCorrupted, setIsCorrupted] = useState(false);

  const syncFromStorage = useCallback(() => {
    const result = loadCivicReports();
    setReports(result.reports);
    setError(result.error);
    setIsCorrupted(result.isCorrupted);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Allow initial loading state frame before hydrating synchronously from localStorage
    const timer = window.setTimeout(() => {
      syncFromStorage();
    }, 60);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === CIVIC_REPORTS_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    const handleCustomUpdate = () => {
      syncFromStorage();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(CIVIC_REPORTS_UPDATED_EVENT, handleCustomUpdate);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CIVIC_REPORTS_UPDATED_EVENT, handleCustomUpdate);
    };
  }, [syncFromStorage]);

  const submitReport = useCallback(
    (input: CivicReportCreateInput): CreateReportResult => {
      const result = createCivicReport(input);
      setReports(result.reports);
      if (!result.fieldErrors) {
        setError(result.error);
      }
      return result;
    },
    []
  );

  const updateStatus = useCallback(
    (
      reportId: string,
      nextStatus: CivicReportStatus,
      adminNote: string
    ): UpdateReportStatusResult => {
      const result = updateCivicReportStatus(reportId, nextStatus, adminNote);
      setReports(result.reports);
      return result;
    },
    []
  );

  const restoreDemoRecords = useCallback(() => {
    const result = restoreMissingDemoReports();
    setReports(result.reports);
    setError(result.error);
  }, []);

  const recoverCorruptStorage = useCallback(() => {
    const result = recoverCorruptedStorageWithDemo();
    setReports(result.reports);
    setError(result.error);
    setIsCorrupted(result.isCorrupted);
  }, []);

  return {
    reports,
    isLoading,
    error,
    isCorrupted,
    refreshReports: syncFromStorage,
    submitReport,
    updateStatus,
    restoreDemoRecords,
    recoverCorruptStorage,
  };
}
