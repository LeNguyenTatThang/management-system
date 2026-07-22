import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dezlab_products';

const initialProducts = [
  { id: 'CF001', name: 'Cà phê sữa', category: 'Cà phê', price: 25000, image: 'https://coffee.alexflipnote.dev/random?1', description: 'Cà phê sữa truyền thống', status: 'Đang bán' },
  { id: 'CF002', name: 'Bạc xỉu', category: 'Cà phê', price: 30000, image: 'https://coffee.alexflipnote.dev/random?2', description: 'Bạc xỉu Sài Gòn', status: 'Đang bán' },
  { id: 'TR001', name: 'Trà đào cam sả', category: 'Trà', price: 40000, image: 'https://coffee.alexflipnote.dev/random?3', description: 'Trà đào cam sả tươi mát', status: 'Đang bán' },
  { id: 'TS001', name: 'Trà sữa trân châu', category: 'Đá xay', price: 35000, image: 'https://coffee.alexflipnote.dev/random?4', description: 'Trà sữa trân châu đường đen', status: 'Đang bán' },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialProducts;
  } catch { return initialProducts; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const MenuProductContext = createContext(null);

export function MenuProductProvider({ children }) {
  const [products, setProducts] = useState(loadData);

  const addProduct = useCallback(async (product) => {
    const newProduct = { id: `CF${String(products.length + 1).padStart(3, '0')}`, ...product };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveData(updated);
  }, [products]);

  const updateProduct = useCallback(async (id, data) => {
    const updated = products.map(p => p.id === id ? { ...p, ...data } : p);
    setProducts(updated);
    saveData(updated);
  }, [products]);

  const deleteProduct = useCallback(async (id) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveData(updated);
  }, [products]);

  return (
    <MenuProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </MenuProductContext.Provider>
  );
}

export function useMenuProduct() {
  const ctx = useContext(MenuProductContext);
  if (!ctx) throw new Error('useMenuProduct must be used within MenuProductProvider');
  return ctx;
}
