import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminHeader from './AdminHeader.jsx';

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-surface-container-lowest/70 backdrop-blur-sm"
          aria-label="Cerrar menú"
        />
      )}
      <AdminHeader onToggleSidebar={() => setIsSidebarOpen((current) => !current)} />
      <Outlet />
    </div>
  );
}

export default AdminLayout;
