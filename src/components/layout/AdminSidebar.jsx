import { NavLink } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import Icon from '../common/Icon.jsx';

const LINKS = [
  { to: '/admin', label: 'Panel General', icon: 'dashboard', end: true },
  { to: '/admin/productos', label: 'Productos y Categorías', icon: 'box' },
  { to: '/admin/pedidos', label: 'Pedidos y Remisiones', icon: 'truck' },
  { to: '/admin/usuarios', label: 'Control de Acceso', icon: 'users' },
  { to: '/admin/preferencias', label: 'Preferencias', icon: 'settings' },
];

function AdminSidebar({ isOpen, onNavigate }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between p-space-md overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-sm px-space-xs pt-space-xs">
          <Logo className="h-14" />
          <div className="px-space-sm py-space-xs rounded-lg bg-surface-container-low flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Entorno</span>
            <span className="px-space-sm py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm font-bold uppercase">
              Planta Central
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center gap-space-sm px-space-md py-space-sm rounded-xl font-label-lg text-label-lg transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_1.6rem_rgba(0,212,255,0.3)] bevel-top'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <Icon name={link.icon} />
              {link.label}
            </NavLink>
          ))}

          <NavLink
            to="/"
            onClick={onNavigate}
            className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all mt-space-md font-label-lg text-label-lg"
          >
            <Icon name="store" />
            Ver Tienda Pública
          </NavLink>
        </nav>
      </div>

      <div className="flex flex-col gap-space-xs p-space-sm rounded-xl bg-surface-container-low">
        <span className="flex items-center gap-space-xs font-label-sm text-label-sm text-secondary uppercase">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
          Sistema Operativo
        </span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Limpieza Profesional • Resultados que Brillan
        </span>
      </div>
    </aside>
  );
}

export default AdminSidebar;
