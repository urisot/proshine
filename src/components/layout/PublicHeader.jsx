import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import Logo from '../common/Logo.jsx';
import Icon from '../common/Icon.jsx';
import IconButton from '../common/IconButton.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';

function PublicHeader({ onOpenCart }) {
  const { isAuthenticated, isAdmin, session, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  function handleConfirmLogout() {
    setIsLogoutOpen(false);
    setIsMenuOpen(false);
    logout();
  }

  const navLinks = [
    { to: '/', label: 'Catálogo y Tienda', end: true },
    ...(isAuthenticated && !isAdmin ? [{ to: '/mis-pedidos', label: 'Mis Pedidos' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Panel Admin' }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `px-space-md py-space-sm font-label-lg text-label-lg rounded-lg transition-all ${
      isActive
        ? 'bg-primary-container text-on-primary-container shadow-[0_0_1.6rem_rgba(0,212,255,0.3)]'
        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-40 glass-panel border-x-0 border-t-0 shadow-[0_1px_1.2rem_rgba(0,0,0,0.4)]">
      <div className="h-20 w-full px-margin-mobile sm:px-margin flex items-center justify-between gap-space-md">
        <Link to="/" className="flex items-center shrink-0">
          <Logo className="h-12 sm:h-14" />
        </Link>

        <nav className="hidden lg:flex items-center gap-space-xs p-1 rounded-xl bg-surface-container-lowest/60">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-space-sm">
          {!isAdmin && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary transition-colors bevel-top"
            >
              <Icon name="cart" />
              <span className="hidden sm:inline font-label-md text-label-md">Carrito</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[2rem] h-5 px-1 flex items-center justify-center rounded-full bg-primary-container text-on-primary-container text-[1rem] font-bold shadow-[0_0_1rem_rgba(0,212,255,0.5)] animate-scale-in">
                  {itemCount}
                </span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-space-xs pl-space-xs">
              <span className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
                <Icon name="user" className="w-4 h-4" />
              </span>
              <span className="hidden md:inline font-label-sm text-label-sm text-on-surface-variant max-w-[12rem] truncate">
                {session.name}
              </span>
              <IconButton
                icon="logout"
                label="Cerrar sesión"
                onClick={() => setIsLogoutOpen(true)}
                variant="ghost"
              />
            </div>
          ) : (
            <Link
              to="/acceso"
              className="px-space-md py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-lg text-label-lg shadow-md bevel-top hover:brightness-110 transition"
            >
              Ingresar
            </Link>
          )}

          <span className="lg:hidden">
            <IconButton
              icon={isMenuOpen ? 'close' : 'menu'}
              label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setIsMenuOpen((current) => !current)}
            />
          </span>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="lg:hidden flex flex-col gap-1 px-margin-mobile pb-space-md animate-fade-up">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setIsMenuOpen(false)} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="px-space-md py-space-sm text-left font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          )}
        </nav>
      )}

      <ConfirmDialog
        isOpen={isLogoutOpen}
        title="Cerrar Sesión"
        message={
          itemCount > 0
            ? `¿Deseas cerrar tu sesión?.`
            : '¿Deseas cerrar tu sesión?'
        }
        confirmLabel="Sí, Cerrar Sesión"
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutOpen(false)}
      />
    </header>
  );
}

export default PublicHeader;
