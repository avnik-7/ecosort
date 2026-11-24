import { useCallback, useEffect, useState } from 'react';
import {
  CollectionPriority,
  CollectionSchedule,
  CollectionScheduleCreateInput,
  CollectionScheduleStatus,
} from '../types/ecosort';
import {
  COLLECTION_SCHEDULES_STORAGE_KEY,
  COLLECTION_SCHEDULES_UPDATED_EVENT,
  createCollectionSchedule,
  CreateScheduleResult,
  loadCollectionSchedules,
  recoverCorruptedSchedulesWithDemo,
  restoreMissingDemoSchedules,
  updateCollectionSchedule,
  UpdateScheduleResult,
} from '../utils/collectionPlannerStorage';

export function useCollectionPlanner() {
  const [schedules, setSchedules] = useState<CollectionSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCorrupted, setIsCorrupted] = useState(false);

  const syncFromStorage = useCallback(() => {
    const result = loadCollectionSchedules();
    setSchedules(result.schedules);
    setError(result.error);
    setIsCorrupted(result.isCorrupted);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      syncFromStorage();
    }, 60);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === COLLECTION_SCHEDULES_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    const handleCustomUpdate = () => {
      syncFromStorage();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(COLLECTION_SCHEDULES_UPDATED_EVENT, handleCustomUpdate);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(
        COLLECTION_SCHEDULES_UPDATED_EVENT,
        handleCustomUpdate
      );
    };
  }, [syncFromStorage]);

  const addSchedule = useCallback(
    (input: CollectionScheduleCreateInput): CreateScheduleResult => {
      const result = createCollectionSchedule(input);
      setSchedules(result.schedules);
      if (!result.fieldErrors) {
        setError(result.error);
      }
      return result;
    },
    []
  );

  const editSchedule = useCallback(
    (
      scheduleId: string,
      updates: {
        status: CollectionScheduleStatus;
        assignedFleetId: string;
        priority: CollectionPriority;
        notes?: string;
      }
    ): UpdateScheduleResult => {
      const result = updateCollectionSchedule(scheduleId, updates);
      setSchedules(result.schedules);
      return result;
    },
    []
  );

  const restoreDemoSchedules = useCallback(() => {
    const result = restoreMissingDemoSchedules();
    setSchedules(result.schedules);
    setError(result.error);
  }, []);

  const recoverCorruptSchedules = useCallback(() => {
    const result = recoverCorruptedSchedulesWithDemo();
    setSchedules(result.schedules);
    setError(result.error);
    setIsCorrupted(result.isCorrupted);
  }, []);

  return {
    schedules,
    isLoading,
    error,
    isCorrupted,
    addSchedule,
    editSchedule,
    restoreDemoSchedules,
    recoverCorruptSchedules,
  };
}
