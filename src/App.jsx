import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StaffProvider } from './contexts/StaffContext';
import { MenuProductProvider } from './contexts/MenuProductContext';
import { IngredientProvider } from './contexts/IngredientContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { SupplierProvider } from './contexts/SupplierContext';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import MenuProducts from './pages/MenuProducts';
import Recipes from './pages/Recipes';
import POS from './pages/POS';
import Ingredients from './pages/Ingredients';
import Orders from './pages/Orders';
import Staff from './pages/Staff';
import Suppliers from './pages/Suppliers';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StaffProvider>
        <MenuProductProvider>
        <IngredientProvider>
        <RecipeProvider>
        <SupplierProvider>
          <AppRoutes />
        </SupplierProvider>
        </RecipeProvider>
        </IngredientProvider>
        </MenuProductProvider>
        </StaffProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
