import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import MenuProducts from './pages/MenuProducts';
import Recipes from './pages/Recipes';
import POS from './pages/POS';
import Ingredients from './pages/Ingredients';
import Orders from './pages/Orders';
import Staff from './pages/Staff';
import Suppliers from './pages/Suppliers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<MenuProducts />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="pos" element={<POS />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="orders" element={<Orders />} />
          <Route path="staff" element={<Staff />} />
          <Route path="suppliers" element={<Suppliers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
