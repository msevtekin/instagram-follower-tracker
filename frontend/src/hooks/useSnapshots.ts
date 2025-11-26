/**
 * useSnapshots Hook
 * 
 * Manages snapshot operations with API integration.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createSnapshot,
  getSnapshots,
  deleteSnapshot,
  deleteAllSnapshots,
  compareSnapshots,
  SnapshotResponse,
  ComparisonResponse,
} from '../services/api';

interface UseSnapshotsReturn {
  snapshots: SnapshotResponse[];
  loading: boolean;
  error: string | null;
  lastUploadCount: number | null;
  comparisonResult: ComparisonResponse | null;
  uploadFollowers: (content: string) => Promise<void>;
  fetchSnapshots: () => Promise<void>;
  removeSnapshot: (id: string) => Promise<void>;
  removeAllSnapshots: () => Promise<void>;
  compare: (oldId: string, newId: string) => Promise<void>;
  clearError: () => void;
  clearComparison: () => void;
}

export function useSnapshots(): UseSnapshotsReturn {
  const { getIdToken } = useAuth();
  const [snapshots, setSnapshots] = useState<SnapshotResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUploadCount, setLastUploadCount] = useState<number | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);

  const getToken = async (): Promise<string> => {
    const token = await getIdToken();
    if (!token) throw new Error('Not authenticated');
    return token;
  };

  const uploadFollowers = useCallback(async (content: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await createSnapshot(token, content);
      setLastUploadCount(result.followerCount);
      // Refresh snapshots list
      const updated = await getSnapshots(token);
      setSnapshots(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await getSnapshots(token);
      setSnapshots(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch snapshots');
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  const removeSnapshot = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      await deleteSnapshot(token, id);
      setSnapshots(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete snapshot');
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  const removeAllSnapshots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      await deleteAllSnapshots(token);
      setSnapshots([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete snapshots');
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  const compare = useCallback(async (oldId: string, newId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await compareSnapshots(token, oldId, newId);
      setComparisonResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  const clearError = useCallback(() => setError(null), []);
  const clearComparison = useCallback(() => setComparisonResult(null), []);

  return {
    snapshots,
    loading,
    error,
    lastUploadCount,
    comparisonResult,
    uploadFollowers,
    fetchSnapshots,
    removeSnapshot,
    removeAllSnapshots,
    compare,
    clearError,
    clearComparison,
  };
}

export default useSnapshots;
