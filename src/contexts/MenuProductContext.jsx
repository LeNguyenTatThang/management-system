import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dezlab_products';

const initialProducts = [
  { id: 'CF001', name: 'Cà phê sữa', category: 'Cà phê', price: 25000, cost: 7640, profit: 17360, image: 'https://coffee.alexflipnote.dev/random?1', description: 'Cà phê sữa truyền thống', status: 'Đang bán', tags: ['Khay', 'Ống hút ngắn', 'Thìa ngắn'], size: '360ml', fc: '30.6%' },
  { id: 'CF002', name: 'Bạc xỉu', category: 'Cà phê', price: 30000, cost: 8500, profit: 21500, image: 'https://coffee.alexflipnote.dev/random?2', description: 'Bạc xỉu Sài Gòn', status: 'Đang bán', tags: ['Khay', 'Ống hút'], size: '360ml', fc: '28.3%' },
  { id: 'TR001', name: 'Trà đào cam sả', category: 'Trà', price: 40000, cost: 12000, profit: 28000, image: 'https://coffee.alexflipnote.dev/random?3', description: 'Trà đào cam sả tươi mát', status: 'Đang bán', tags: ['Ống hút to'], size: '500ml', fc: '30.0%' },
  { id: 'TS001', name: 'Trà sữa trân châu', category: 'Đá xay', price: 35000, cost: 10500, profit: 24500, image: 'https://coffee.alexflipnote.dev/random?4', description: 'Trà sữa trân châu đường đen', status: 'Ngừng bán', tags: ['Ống hút to', 'Trân châu'], size: '500ml', fc: '30.0%' },
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
    return newProduct;
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
