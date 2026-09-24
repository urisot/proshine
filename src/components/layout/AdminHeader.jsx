import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Icon from '../common/Icon.jsx';
import IconButton from '../common/IconButton.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';

function AdminHeader({ onToggleSidebar }) {
  const { session, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  function handleConfirmLogout() {
    setIsLogoutOpen(false);
    logout();
  }

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 z-40 glass-panel border-x-0 border-t-0 flex items-center justify-between px-space-md lg:px-space-lg">
      <div className="flex items-center gap-space-sm">
        <span className="lg:hidden">
          <IconButton icon="menu" label="Abrir menú" onClick={onToggleSidebar} />
        </span>
        <div className="hidden sm:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-low">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">LocalStorage: Sincronizado</span>
        </div>
      </div>

      <div className="flex items-center gap-space-sm">
        <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high">
          <Icon name="shield" className="w-3.5 h-3.5 text-primary" />
          <span className="font-label-sm text-label-sm text-secondary uppercase">Administrador</span>
        </div>
        <span className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
          <Icon name="user" className="w-4 h-4" />
        </span>
        <span className="hidden md:inline font-label-sm text-label-sm text-on-surface-variant max-w-[14rem] truncate">
          {session?.name}
        </span>
        <IconButton icon="logout" label="Cerrar sesión" onClick={() => setIsLogoutOpen(true)} variant="ghost" />
      </div>

      <ConfirmDialog
        isOpen={isLogoutOpen}
        title="Cerrar Sesión"
        message="¿Deseas salir del panel de administración?"
        confirmLabel="Sí, Cerrar Sesión"
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutOpen(false)}
      />
    </header>
  );
}

export default AdminHeader;
