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
import AdminSalesPage from '../pages/admin/AdminSalesPage.jsx';
import AdminUsersPage from '../pages/admin/AdminUsersPage.jsx';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage.jsx';
import AdminRolesPage from '../pages/admin/AdminRolesPage.jsx';

// Cada ruta del panel exige la clave de permiso de su opción de menú (ver menuCatalog.js).
const ADMIN_ROUTES = [
  { path: '/admin', permission: 'panel', Page: AdminDashboardPage },
  { path: '/admin/productos', permission: 'catalogos.productos', Page: AdminProductsPage },
  { path: '/admin/pedidos', permission: 'pedidos.remisiones', Page: AdminOrdersPage },
  { path: '/admin/ventas', permission: 'ventas.generar', Page: AdminSalesPage },
  { path: '/admin/usuarios', permission: 'configuraciones.usuarios', Page: AdminUsersPage },
  { path: '/admin/roles', permission: 'configuraciones.roles', Page: AdminRolesPage },
  { path: '/admin/preferencias', permission: 'configuraciones.preferencias', Page: AdminSettingsPage },
];

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
            <ProtectedRoute panel>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {ADMIN_ROUTES.map(({ path, permission, Page }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute permission={permission}>
                  <Page />
                </ProtectedRoute>
              }
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
