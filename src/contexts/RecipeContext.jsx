import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dezlab_recipes';

const initialRecipes = [
  {
    id: 'RC01', productId: 'CF001', productName: 'Cà phê sữa',
    image: 'https://coffee.alexflipnote.dev/random?1',
    note: 'Công thức cà phê sữa truyền thống, phù hợp khẩu vị người Việt.',
    ingredients: [
      { ingredientId: 'NL01', amount: 0.02 },
      { ingredientId: 'NL02', amount: 0.5 },
    ]
  },
  {
    id: 'RC02', productId: 'TR001', productName: 'Trà đào cam sả',
    image: 'https://coffee.alexflipnote.dev/random?3',
    note: 'Trà đào cam sả tươi mát, thích hợp cho mùa hè.',
    ingredients: [
      { ingredientId: 'NL05', amount: 1 },
      { ingredientId: 'NL03', amount: 0.1 },
    ]
  },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialRecipes;
  } catch { return initialRecipes; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const RecipeContext = createContext(null);

export function RecipeProvider({ children }) {
  const [recipes, setRecipes] = useState(loadData);

  const addRecipe = useCallback(async (recipe) => {
    const newItem = { id: `RC${String(recipes.length + 1).padStart(2, '0')}`, ...recipe };
    const updated = [...recipes, newItem];
    setRecipes(updated);
    saveData(updated);
  }, [recipes]);

  const updateRecipe = useCallback(async (id, data) => {
    const updated = recipes.map(r => r.id === id ? { ...r, ...data } : r);
    setRecipes(updated);
    saveData(updated);
  }, [recipes]);

  const deleteRecipe = useCallback(async (id) => {
    const updated = recipes.filter(r => r.id !== id);
    setRecipes(updated);
    saveData(updated);
  }, [recipes]);

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipe() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipe must be used within RecipeProvider');
  return ctx;
}
