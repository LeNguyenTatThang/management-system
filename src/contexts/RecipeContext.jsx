import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dezlab_recipes';

const initialRecipes = [
  {
    id: 'RC01', productId: 'CF001', productName: 'Cà phê sữa',
    image: 'https://coffee.alexflipnote.dev/random?1',
    note: 'Công thức cà phê sữa truyền thống, phù hợp khẩu vị người Việt.',
    instructions: [
      'Chiết xuất 18g cà phê - 36ml',
      'Cho sữa đặc vào ly khuấy đều',
      'Cho đá vào ly',
      'Phục vụ kèm khay và trà đá'
    ],
    ingredients: [
      { ingredientId: 'NL01', amount: 18, note: 'Rang vừa' },
      { ingredientId: 'NL02', amount: 20, note: '' },
    ]
  },
  {
    id: 'RC02', productId: 'TR001', productName: 'Trà đào cam sả',
    image: 'https://coffee.alexflipnote.dev/random?3',
    note: 'Trà đào cam sả tươi mát, thích hợp cho mùa hè.',
    instructions: [
      'Hãm trà túi lọc với 300ml nước sôi trong 5 phút',
      'Cắt cam sả lát mỏng',
      'Pha siro đào vào ly',
      'Thêm đá và trang trí'
    ],
    ingredients: [
      { ingredientId: 'NL05', amount: 1, note: '' },
      { ingredientId: 'NL03', amount: 10, note: 'Đường kính' },
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
