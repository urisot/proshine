import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import Icon from '../common/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { MENU, hasPermission } from '../../services/menuCatalog.js';

// Menú filtrado por los permisos del rol: se ocultan los hijos no permitidos y los padres sin hijos.
function getAllowedMenu(session) {
  return MENU.reduce((result, group) => {
    if (!group.children) {
      if (hasPermission(session, group.key)) {
        result.push(group);
      }
      return result;
    }
    const children = group.children.filter((child) => hasPermission(session, child.key));
    if (children.length > 0) {
      result.push({ ...group, children });
    }
    return result;
  }, []);
}

const ITEM_BASE = 'flex items-center gap-space-sm px-space-md py-space-sm rounded-xl font-label-lg text-label-lg transition-all';
const ITEM_IDLE = 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface';
const ITEM_ACTIVE = 'bg-primary-container text-on-primary-container shadow-[0_0_1.6rem_rgba(0,212,255,0.3)] bevel-top';

function groupHasPath(group, pathname) {
  return (group.children || []).some((child) => child.to === pathname);
}

// Minúsculas y sin acentos, para que "catalogos" encuentre "Catálogos".
function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// Si el padre coincide se muestran todos sus hijos; si no, solo los hijos que coinciden.
function filterMenu(menu, term) {
  if (!term) {
    return menu;
  }
  return menu.reduce((result, group) => {
    if (normalizeText(group.label).includes(term)) {
      result.push(group);
      return result;
    }
    const children = (group.children || []).filter((child) => normalizeText(child.label).includes(term));
    if (children.length > 0) {
      result.push({ ...group, children });
    }
    return result;
  }, []);
}

// isCollapsed solo aplica en escritorio (lg); en móvil el menú siempre se muestra completo.
function AdminSidebar({ isOpen, isCollapsed, onToggleCollapse, onNavigate }) {
  const { pathname } = useLocation();
  const { session } = useAuth();
  const [openGroups, setOpenGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  const allowedMenu = getAllowedMenu(session);
  const normalizedTerm = normalizeText(searchTerm);
  const isSearching = normalizedTerm !== '';
  const visibleMenu = filterMenu(allowedMenu, normalizedTerm);

  // Con el menú colapsado, la lupa expande el menú y deja el cursor en el buscador.
  function handleSearchIconClick() {
    onToggleCollapse();
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'Escape') {
      setSearchTerm('');
    }
  }

  function handleNavigate() {
    setSearchTerm('');
    onNavigate();
  }

  // Si se llega a una página por otro enlace (ej. desde el dashboard), se abre su grupo.
  useEffect(() => {
    const activeGroup = MENU.find((group) => groupHasPath(group, pathname));
    if (activeGroup) {
      setOpenGroups((current) => (current.includes(activeGroup.key) ? current : [...current, activeGroup.key]));
    }
  }, [pathname]);

  // Con el menú colapsado solo se ven los íconos: lg:hidden oculta los textos.
  const hideWhenCollapsed = isCollapsed ? 'lg:hidden' : '';

  function toggleGroup(groupId) {
    if (isCollapsed) {
      // Al tocar un padre con el menú colapsado se expande el menú y se abre ese grupo.
      onToggleCollapse();
      setOpenGroups((current) => (current.includes(groupId) ? current : [...current, groupId]));
      return;
    }
    setOpenGroups((current) =>
      current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId]
    );
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-[28rem] max-w-[85vw] bg-surface-container-lowest z-50 flex flex-col justify-between gap-space-md p-space-md overflow-y-auto overflow-x-hidden transition-all duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isCollapsed ? 'lg:w-[7.2rem] lg:px-space-sm' : ''}`}
    >
      <div className="flex flex-col gap-space-lg">
        <div className={`flex items-center gap-space-sm pt-space-xs ${isCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
          <span className={hideWhenCollapsed}>
            <Logo className="h-14" />
          </span>
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            aria-expanded={!isCollapsed}
            className="hidden lg:flex w-11 h-11 items-center justify-center shrink-0 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon name={isCollapsed ? 'chevronsRight' : 'chevronsLeft'} />
          </button>
        </div>

        {isCollapsed && (
          <button
            type="button"
            onClick={handleSearchIconClick}
            title="Buscar opción del menú"
            aria-label="Buscar opción del menú"
            className="hidden lg:flex w-full h-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <Icon name="search" className="w-5 h-5" />
          </button>
        )}

        <div role="search" className={`relative flex items-center ${hideWhenCollapsed}`}>
          <label htmlFor="adminMenuSearch" className="sr-only">
            Buscar opción del menú
          </label>
          <Icon name="search" className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
          <input
            id="adminMenuSearch"
            ref={searchInputRef}
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar opción..."
            autoComplete="off"
            className="w-full pl-10 pr-10 py-space-sm rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary-container transition"
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
              className="absolute right-2 w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <Icon name="close" className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className={`px-space-sm py-space-xs rounded-lg bg-surface-container-low flex items-center justify-between ${hideWhenCollapsed}`}>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Entorno</span>
          <span className="px-space-sm py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm font-bold uppercase">
            Planta Central
          </span>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Menú de administración">
          <ul className="flex flex-col gap-1">
            {visibleMenu.map((group) => {
              if (!group.children) {
                return (
                  <li key={group.key}>
                    <NavLink
                      to={group.to}
                      end={group.end}
                      onClick={handleNavigate}
                      title={group.label}
                      className={({ isActive }) =>
                        `${ITEM_BASE} ${isCollapsed ? 'lg:justify-center lg:px-0' : ''} ${isActive ? ITEM_ACTIVE : ITEM_IDLE}`
                      }
                    >
                      <Icon name={group.icon} className="w-5 h-5 shrink-0" />
                      <span className={hideWhenCollapsed}>{group.label}</span>
                    </NavLink>
                  </li>
                );
              }

              const isGroupOpen = isSearching || openGroups.includes(group.key);
              const isGroupActive = groupHasPath(group, pathname);
              const submenuId = `submenu-${group.key}`;

              return (
                <li key={group.key}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    title={group.label}
                    aria-expanded={isGroupOpen}
                    aria-controls={submenuId}
                    className={`w-full ${ITEM_BASE} ${isCollapsed ? 'lg:justify-center lg:px-0' : ''} ${
                      isGroupActive ? 'text-secondary bg-surface-container hover:bg-surface-container-high' : ITEM_IDLE
                    }`}
                  >
                    <Icon name={group.icon} className="w-5 h-5 shrink-0" />
                    <span className={`flex-1 text-left ${hideWhenCollapsed}`}>{group.label}</span>
                    <span className={`transition-transform duration-200 ${isGroupOpen ? 'rotate-90' : ''} ${hideWhenCollapsed}`}>
                      <Icon name="chevronRight" className="w-4 h-4" />
                    </span>
                  </button>

                  {isGroupOpen && (
                    <ul
                      id={submenuId}
                      className={`flex flex-col gap-1 mt-1 ml-space-lg pl-space-sm border-l border-surface-container-highest animate-fade-in ${hideWhenCollapsed}`}
                    >
                      {group.children.map((child) =>
                        child.to ? (
                          <li key={child.label}>
                            <NavLink
                              to={child.to}
                              onClick={handleNavigate}
                              className={({ isActive }) =>
                                `flex items-center px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-all ${
                                  isActive ? ITEM_ACTIVE : ITEM_IDLE
                                }`
                              }
                            >
                              {child.label}
                            </NavLink>
                          </li>
                        ) : (
                          <li key={child.label}>
                            <span
                              aria-disabled="true"
                              className="flex items-center justify-between gap-space-xs px-space-md py-space-xs rounded-lg font-label-md text-label-md text-outline cursor-not-allowed"
                            >
                              {child.label}
                              <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant uppercase shrink-0">
                                Próximamente
                              </span>
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </li>
              );
            })}

            {visibleMenu.length === 0 && (
              <li className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">
                No hay opciones que coincidan con "{searchTerm.trim()}".
              </li>
            )}

            <li className="mt-space-md">
              <NavLink
                to="/"
                onClick={handleNavigate}
                title="Ver Tienda Pública"
                className={`${ITEM_BASE} ${ITEM_IDLE} ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}
              >
                <Icon name="store" className="w-5 h-5 shrink-0" />
                <span className={hideWhenCollapsed}>Ver Tienda Pública</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      <div className={`flex flex-col gap-space-xs p-space-sm rounded-xl bg-surface-container-low ${hideWhenCollapsed}`}>
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
