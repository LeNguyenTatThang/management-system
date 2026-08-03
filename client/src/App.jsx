import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StaffProvider } from './contexts/StaffContext';
import { MenuProductProvider } from './contexts/MenuProductContext';
import { IngredientProvider } from './contexts/IngredientContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { SupplierProvider } from './contexts/SupplierContext';
import { AccountProvider } from './contexts/AccountContext';
import { RoleProvider } from './contexts/RoleContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { AttendanceProvider } from './contexts/AttendanceContext';
import { LeaveProvider } from './contexts/LeaveContext';
import { ImportReceiptProvider } from './contexts/ImportReceiptContext';
import { InventoryExportProvider } from './contexts/InventoryExportContext';
import { InventoryAdjustmentProvider } from './contexts/InventoryAdjustmentContext';
import { StockLedgerProvider } from './contexts/StockLedgerContext';
import { InventoryStocktakeProvider } from './contexts/InventoryStocktakeContext';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/dashboard/Dashboard';
import MenuProducts from './pages/dishes/MenuProducts';
import ProductCreate from './pages/dishes/ProductCreate';
import ProductDetail from './pages/dishes/ProductDetail';
import Recipes from './pages/recipes/Recipes';
import RecipeComponentCreate from './pages/recipes/RecipeComponentCreate';
import RecipeDetail from './pages/recipes/RecipeDetail';
import POS from './pages/pos/POS';
import Ingredients from './pages/ingredients/Ingredients';
import IngredientCreate from './pages/ingredients/IngredientCreate';
import IngredientDetail from './pages/ingredients/IngredientDetail';
import Orders from './pages/orders/Orders';
import OrderCreate from './pages/orders/OrderCreate';
import OrderDetail from './pages/orders/OrderDetail';
import Staff from './pages/employees/Staff';
import StaffDetail from './pages/employees/StaffDetail';
import EmployeeCreate from './pages/employees/EmployeeCreate';
import Suppliers from './pages/suppliers/Suppliers';
import SupplierCreate from './pages/suppliers/SupplierCreate';
import Themes from './pages/themes/Themes';
import Vouchers from './pages/vouchers/Vouchers';
import VoucherCreate from './pages/vouchers/VoucherCreate';
import Promotions from './pages/promotions/Promotions';
import PromotionCreate from './pages/promotions/PromotionCreate';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Accounts from './pages/accounts/Accounts';
import AccountCreate from './pages/accounts/AccountCreate';
import Roles from './pages/roles/Roles';
import RoleCreate from './pages/roles/RoleCreate';
import Schedules from './pages/schedules/Schedules';
import ScheduleCreate from './pages/schedules/ScheduleCreate';
import ScheduleDetail from './pages/schedules/ScheduleDetail';
import ScheduleEdit from './pages/schedules/ScheduleEdit';
import Attendance from './pages/attendance/Attendance';
import AttendanceDetail from './pages/attendance/AttendanceDetail';
import LeaveRequests from './pages/leave-requests/LeaveRequests';
import LeaveRequestDetail from './pages/leave-requests/LeaveRequestDetail';
import ImportReceiptList from './pages/inventory/imports/ImportReceiptList';
import ImportReceiptCreate from './pages/inventory/imports/ImportReceiptCreate';
import ImportReceiptDetail from './pages/inventory/imports/ImportReceiptDetail';
import ImportReceiptEdit from './pages/inventory/imports/ImportReceiptEdit';
import ExportReceiptList from './pages/inventory/exports/ExportReceiptList';
import ExportReceiptCreate from './pages/inventory/exports/ExportReceiptCreate';
import ExportReceiptDetail from './pages/inventory/exports/ExportReceiptDetail';
import ExportReceiptEdit from './pages/inventory/exports/ExportReceiptEdit';
import AdjustmentList from './pages/inventory/adjustments/AdjustmentList';
import AdjustmentCreate from './pages/inventory/adjustments/AdjustmentCreate';
import AdjustmentDetail from './pages/inventory/adjustments/AdjustmentDetail';
import AdjustmentEdit from './pages/inventory/adjustments/AdjustmentEdit';
import StockLedgerList from './pages/inventory/stock-ledger/StockLedgerList';
import StockLedgerDetail from './pages/inventory/stock-ledger/StockLedgerDetail';
import StocktakeList from './pages/inventory/stocktakes/StocktakeList';
import StocktakeCreate from './pages/inventory/stocktakes/StocktakeCreate';
import StocktakeDetail from './pages/inventory/stocktakes/StocktakeDetail';
import StocktakeEdit from './pages/inventory/stocktakes/StocktakeEdit';
import InventoryReportDashboard from './pages/inventory/reports/InventoryReportDashboard';
import StockMovementReport from './pages/inventory/reports/StockMovementReport';
import TopIngredients from './pages/inventory/reports/TopIngredients';
import LowStockReport from './pages/inventory/reports/LowStockReport';
import StocktakeReport from './pages/inventory/reports/StocktakeReport';
import IngredientReport from './pages/inventory/reports/IngredientReport';
import TransferList from './pages/inventory/transfers/TransferList';
import TransferCreate from './pages/inventory/transfers/TransferCreate';
import TransferDetail from './pages/inventory/transfers/TransferDetail';
import TransferEdit from './pages/inventory/transfers/TransferEdit';
import { InventoryTransferProvider } from './contexts/InventoryTransferContext';

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
        <Route path="products/new" element={<ProductCreate />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="products/:id/edit" element={<ProductCreate />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="recipes/new" element={<RecipeComponentCreate />} />
        <Route path="recipes/:id" element={<RecipeDetail />} />
        <Route path="recipes/:id/edit" element={<RecipeComponentCreate />} />
        <Route path="pos" element={<POS />} />
        <Route path="orders/create" element={<OrderCreate />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="ingredients" element={<Ingredients />} />
        <Route path="ingredients/create" element={<IngredientCreate />} />
        <Route path="ingredients/:id" element={<IngredientDetail />} />
        <Route path="orders" element={<Orders />} />
        <Route path="staff" element={<Staff />} />
        <Route path="staff/:id" element={<StaffDetail />} />
        <Route path="employees/create" element={<EmployeeCreate />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="suppliers/new" element={<SupplierCreate />} />
        <Route path="themes" element={<Themes />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="attendance/:id" element={<AttendanceDetail />} />
        <Route path="leave-requests" element={<LeaveRequests />} />
        <Route path="leave-requests/:id" element={<LeaveRequestDetail />} />
        <Route path="inventory/imports" element={<ImportReceiptList />} />
        <Route path="inventory/imports/create" element={<ImportReceiptCreate />} />
        <Route path="inventory/imports/:id" element={<ImportReceiptDetail />} />
        <Route path="inventory/imports/:id/edit" element={<ImportReceiptEdit />} />
        <Route path="inventory/exports" element={<ExportReceiptList />} />
        <Route path="inventory/exports/create" element={<ExportReceiptCreate />} />
        <Route path="inventory/exports/:id" element={<ExportReceiptDetail />} />
        <Route path="inventory/exports/:id/edit" element={<ExportReceiptEdit />} />
        <Route path="inventory/adjustments" element={<AdjustmentList />} />
        <Route path="inventory/adjustments/create" element={<AdjustmentCreate />} />
        <Route path="inventory/adjustments/:id" element={<AdjustmentDetail />} />
        <Route path="inventory/adjustments/:id/edit" element={<AdjustmentEdit />} />
        <Route path="inventory/stock-ledger" element={<StockLedgerList />} />
        <Route path="inventory/stock-ledger/:id" element={<StockLedgerDetail />} />
        <Route path="inventory/stocktakes" element={<StocktakeList />} />
        <Route path="inventory/stocktakes/create" element={<StocktakeCreate />} />
        <Route path="inventory/stocktakes/:id" element={<StocktakeDetail />} />
        <Route path="inventory/stocktakes/:id/edit" element={<StocktakeEdit />} />
        <Route path="inventory/reports" element={<InventoryReportDashboard />} />
        <Route path="inventory/reports/movements" element={<StockMovementReport />} />
        <Route path="inventory/reports/top-ingredients" element={<TopIngredients />} />
        <Route path="inventory/reports/low-stock" element={<LowStockReport />} />
        <Route path="inventory/reports/stocktake" element={<StocktakeReport />} />
        <Route path="inventory/reports/ingredient/:ingredientId" element={<IngredientReport />} />
        <Route path="inventory/transfers" element={<TransferList />} />
        <Route path="inventory/transfers/create" element={<TransferCreate />} />
        <Route path="inventory/transfers/:id" element={<TransferDetail />} />
        <Route path="inventory/transfers/:id/edit" element={<TransferEdit />} />
        <Route path="schedules" element={<Schedules />} />
        <Route path="schedules/create" element={<ScheduleCreate />} />
        <Route path="schedules/:id" element={<ScheduleDetail />} />
        <Route path="schedules/:id/edit" element={<ScheduleEdit />} />
        <Route path="vouchers" element={<Vouchers />} />
        <Route path="vouchers/create" element={<VoucherCreate />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="promotions/create" element={<PromotionCreate />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="accounts/create" element={<AccountCreate />} />
        <Route path="accounts/roles" element={<Roles />} />
        <Route path="accounts/roles/create" element={<RoleCreate />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: 'var(--font-sans)' } }} />
      <AuthProvider>
        <ThemeProvider>
        <StaffProvider>
        <MenuProductProvider>
        <IngredientProvider>
        <RecipeProvider>
        <SupplierProvider>
          <RoleProvider>
          <AccountProvider>
          <ScheduleProvider>
          <AttendanceProvider>
          <LeaveProvider>
          <ImportReceiptProvider>
          <InventoryExportProvider>
          <InventoryAdjustmentProvider>
          <InventoryStocktakeProvider>
          <InventoryTransferProvider>
          <StockLedgerProvider>
          <AppRoutes />
          </StockLedgerProvider>
          </InventoryTransferProvider>
          </InventoryStocktakeProvider>
          </InventoryAdjustmentProvider>
          </InventoryExportProvider>
          </ImportReceiptProvider>
          </LeaveProvider>
          </AttendanceProvider>
          </ScheduleProvider>
          </AccountProvider>
          </RoleProvider>
        </SupplierProvider>
        </RecipeProvider>
        </IngredientProvider>
        </MenuProductProvider>
        </StaffProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
