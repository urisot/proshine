import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import CatalogPage from '../pages/CatalogPage.jsx';
import MyOrdersPage from '../pages/MyOrdersPage.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import AdminProductsPage from '../pages/admin/AdminProductsPage.jsx';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage.jsx';
import AdminUsersPage from '../pages/admin/AdminUsersPage.jsx';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage.jsx';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/acceso" element={<AuthPage />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route
            path="/mis-pedidos"
            element={
              <ProtectedRoute requiredRole="cliente">
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/productos" element={<AdminProductsPage />} />
          <Route path="/admin/pedidos" element={<AdminOrdersPage />} />
          <Route path="/admin/usuarios" element={<AdminUsersPage />} />
          <Route path="/admin/preferencias" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
