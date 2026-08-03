import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';
import {
  getSetups,
  createSetup,
  updateSetup,
  deleteSetup,
} from '../services/setupService';

const MenuProductContext = createContext(null);

export function MenuProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(params);
      setProducts(data);
    } catch (e) {
      setError(e.message || 'Không thể tải danh sách món');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {}
  }, []);

  const fetchSetups = useCallback(async () => {
    try {
      const data = await getSetups();
      setSetups(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSetups();
  }, [fetchProducts, fetchCategories, fetchSetups]);

  const getProductById = useCallback(async (id) => {
    try {
      return await getProduct(id);
    } catch (e) {
      return null;
    }
  }, []);

  const addProduct = useCallback(async (data) => {
    const created = await createProduct(data);
    setProducts((prev) => [...prev, created]);
    return created;
  }, []);

  const editProduct = useCallback(async (id, data) => {
    const updated = await updateProduct(id, data);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const removeProduct = useCallback(async (id) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addCategory = useCallback(async (data) => {
    const created = await createCategory(data);
    setCategories((prev) => [...prev, created]);
    return created;
  }, []);

  const editCategory = useCallback(async (id, data) => {
    const updated = await updateCategory(id, data);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const removeCategory = useCallback(async (id) => {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addSetup = useCallback(async (data) => {
    const created = await createSetup(data);
    setSetups((prev) => [...prev, created]);
    return created;
  }, []);

  const editSetup = useCallback(async (id, data) => {
    const updated = await updateSetup(id, data);
    setSetups((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const removeSetup = useCallback(async (id) => {
    await deleteSetup(id);
    setSetups((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <MenuProductContext.Provider
      value={{
        products,
        categories,
        setups,
        loading,
        error,
        fetchProducts,
        getProductById,
        addProduct,
        editProduct,
        removeProduct,
        addCategory,
        editCategory,
        removeCategory,
        addSetup,
        editSetup,
        removeSetup,
      }}
    >
      {children}
    </MenuProductContext.Provider>
  );
}

export function useMenuProduct() {
  const ctx = useContext(MenuProductContext);
  if (!ctx) throw new Error('useMenuProduct must be used within MenuProductProvider');
  return ctx;
}
