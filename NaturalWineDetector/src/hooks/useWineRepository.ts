/**
 * Wine repository hook for managing wine data operations
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { WineRecord } from '../types/WineTypes';
import { WineRepository } from '../repositories/WineRepository';
import { handleError } from '../utils/errorHandler';

export const useWineRepository = () => {
  const [wines, setWines] = useState<WineRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const repository = useRef(new WineRepository()).current;

  const saveWine = async (wine: WineRecord): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await repository.saveWine(wine);
      // Refresh the wines list after saving
      await loadWines();
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadWines = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const wineRecords = await repository.getAllWines();
      setWines(wineRecords);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      setWines([]); // Clear wines on error
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshWines = useCallback(async (): Promise<void> => {
    try {
      setRefreshing(true);
      setError(null);
      const wineRecords = await repository.getAllWines();
      setWines(wineRecords);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getWineById = async (id: string): Promise<WineRecord | null> => {
    try {
      setError(null);
      return await repository.getWineById(id);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      return null;
    }
  };

  const deleteWine = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await repository.deleteWine(id);
      // Refresh the wines list after deletion
      await loadWines();
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getWinesByConsumption = async (consumed: boolean): Promise<WineRecord[]> => {
    try {
      setError(null);
      return await repository.getWinesByConsumption(consumed);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      return [];
    }
  };

  const getWinesByNaturalStatus = async (isNatural: boolean): Promise<WineRecord[]> => {
    try {
      setError(null);
      return await repository.getWinesByNaturalStatus(isNatural);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      return [];
    }
  };

  const searchWinesByNotes = async (searchTerm: string): Promise<WineRecord[]> => {
    try {
      setError(null);
      return await repository.searchWinesByNotes(searchTerm);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      return [];
    }
  };

  const getWineStats = async () => {
    try {
      setError(null);
      return await repository.getWineStats();
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      return { total: 0, consumed: 0, natural: 0 };
    }
  };

  // Load wines on hook initialization
  useEffect(() => {
    loadWines();
  }, [loadWines]);

  return {
    wines,
    loading,
    error,
    refreshing,
    saveWine,
    loadWines,
    refreshWines,
    getWineById,
    deleteWine,
    getWinesByConsumption,
    getWinesByNaturalStatus,
    searchWinesByNotes,
    getWineStats,
  };
};