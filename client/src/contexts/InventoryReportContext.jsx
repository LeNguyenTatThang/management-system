import { createContext, useContext, useState, useCallback } from 'react';
import {
  getSummary,
  getMovements,
  getImportExportReport,
  getTopIngredients,
  getLowStockReport,
  getStocktakeReport,
  getIngredientReport,
} from '../services/inventoryReportService';

const InventoryReportContext = createContext(null);

export function InventoryReportProvider({ children }) {
  const [summary, setSummary] = useState(null);
  const [movements, setMovements] = useState([]);
  const [movementPagination, setMovementPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [topIngredients, setTopIngredients] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [stocktakeReport, setStocktakeReport] = useState(null);
  const [ingredientReport, setIngredientReport] = useState(null);
  const [importExportReport, setImportExportReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSummary(params);
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMovements = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMovements(params);
      setMovements(data.items);
      setMovementPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchImportExportReport = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getImportExportReport(params);
      setImportExportReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopIngredients = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopIngredients(params);
      setTopIngredients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLowStockReport = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLowStockReport(params);
      setLowStock(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStocktakeReport = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStocktakeReport(params);
      setStocktakeReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIngredientReport = useCallback(async (id, params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIngredientReport(id, params);
      setIngredientReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <InventoryReportContext.Provider
      value={{
        summary,
        movements,
        movementPagination,
        topIngredients,
        lowStock,
        stocktakeReport,
        ingredientReport,
        importExportReport,
        loading,
        error,
        fetchSummary,
        fetchMovements,
        fetchImportExportReport,
        fetchTopIngredients,
        fetchLowStockReport,
        fetchStocktakeReport,
        fetchIngredientReport,
      }}
    >
      {children}
    </InventoryReportContext.Provider>
  );
}

export function useInventoryReport() {
  const ctx = useContext(InventoryReportContext);
  if (!ctx) {
    throw new Error(
      'useInventoryReport must be used within InventoryReportProvider',
    );
  }
  return ctx;
}
