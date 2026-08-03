import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../services/recipeService';

const RecipeContext = createContext(null);

export function RecipeProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecipes = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecipes(params);
      setRecipes(data);
    } catch (e) {
      setError(e.message || 'Không thể tải danh sách công thức');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const getRecipeById = useCallback(async (id) => {
    try {
      return await getRecipe(id);
    } catch {
      return null;
    }
  }, []);

  const addRecipe = useCallback(async (data) => {
    const created = await createRecipe(data);
    setRecipes((prev) => [...prev, created]);
    return created;
  }, []);

  const editRecipe = useCallback(async (id, data) => {
    const updated = await updateRecipe(id, data);
    setRecipes((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const removeRecipe = useCallback(async (id) => {
    await deleteRecipe(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        loading,
        error,
        fetchRecipes,
        getRecipeById,
        addRecipe,
        editRecipe,
        removeRecipe,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipe() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipe must be used within RecipeProvider');
  return ctx;
}
