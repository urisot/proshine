import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminHeader from './AdminHeader.jsx';

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
        onNavigate={() => setIsSidebarOpen(false)}
      />
      {isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-surface-container-lowest/70 backdrop-blur-sm"
          aria-label="Cerrar menú"
        />
      )}
      <AdminHeader
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
      />
      {/* El espacio izquierdo sigue el ancho del menú (completo o colapsado) en escritorio. */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-[7.2rem]' : 'lg:pl-[28rem]'}`}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
