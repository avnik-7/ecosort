import { useCallback, useEffect, useState } from 'react';
import {
  WasteBatch,
  WasteBatchCreateInput,
  WasteBatchStatus,
} from '../types/ecosort';
import {
  createWasteBatch,
  CreateBatchResult,
  loadWasteBatches,
  recoverCorruptedBatchesWithDemo,
  restoreMissingDemoBatches,
  UpdateBatchStatusResult,
  updateWasteBatchStatus,
  WASTE_BATCHES_STORAGE_KEY,
  WASTE_BATCHES_UPDATED_EVENT,
} from '../utils/wasteBatchStorage';

export function useWasteBatches() {
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCorrupted, setIsCorrupted] = useState(false);

  const syncFromStorage = useCallback(() => {
    const result = loadWasteBatches();
    setBatches(result.batches);
    setError(result.error);
    setIsCorrupted(result.isCorrupted);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      syncFromStorage();
    }, 60);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === WASTE_BATCHES_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    const handleCustomUpdate = () => {
      syncFromStorage();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(WASTE_BATCHES_UPDATED_EVENT, handleCustomUpdate);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(WASTE_BATCHES_UPDATED_EVENT, handleCustomUpdate);
    };
  }, [syncFromStorage]);

  const addBatch = useCallback(
    (input: WasteBatchCreateInput): CreateBatchResult => {
      const result = createWasteBatch(input);
      setBatches(result.batches);
      if (!result.fieldErrors) {
        setError(result.error);
      }
      return result;
    },
    []
  );

  const updateBatchStatus = useCallback(
    (
      batchId: string,
      nextStatus: WasteBatchStatus,
      note: string
    ): UpdateBatchStatusResult => {
      const result = updateWasteBatchStatus(batchId, nextStatus, note);
      setBatches(result.batches);
      return result;
    },
    []
  );

  const restoreDemoBatches = useCallback(() => {
    const result = restoreMissingDemoBatches();
    setBatches(result.batches);
    setError(result.error);
  }, []);

  const recoverCorruptBatches = useCallback(() => {
    const result = recoverCorruptedBatchesWithDemo();
    setBatches(result.batches);
    setError(result.error);
    setIsCorrupted(result.isCorrupted);
  }, []);

  return {
    batches,
    isLoading,
    error,
    isCorrupted,
    addBatch,
    updateBatchStatus,
    restoreDemoBatches,
    recoverCorruptBatches,
  };
}
