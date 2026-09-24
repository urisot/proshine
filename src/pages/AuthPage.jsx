import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Logo from '../components/common/Logo.jsx';
import Icon from '../components/common/Icon.jsx';
import AddressFields from '../components/common/AddressFields.jsx';
import { EMPTY_ADDRESS, getMissingRequired } from '../services/addressService.js';

const SECTORS = [
  { icon: 'home', label: 'Hogar' },
  { icon: 'hotel', label: 'Hoteles' },
  { icon: 'school', label: 'Escuelas' },
  { icon: 'building', label: 'Empresas' },
  { icon: 'factory', label: 'Industria' },
];

const INPUT_CLASS =
  'w-full bg-surface-container-lowest/80 text-on-surface font-body-md text-body-md pl-11 pr-space-md py-space-sm rounded-lg outline-none focus:bg-surface-container-high focus:ring-1 focus:ring-secondary/40 transition placeholder:text-outline/70';

function Field({ id, label, icon, hint, children }) {
  return (
    <div className="flex flex-col gap-space-xs">
      <label htmlFor={id} className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="text-secondary font-label-sm">{hint}</span>}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-outline pointer-events-none">
          <Icon name={icon} className="w-4 h-4" />
        </span>
        {children}
      </div>
    </div>
  );
}

function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    phone: '',
    email: '',
    rfc: '',
    address: { ...EMPTY_ADDRESS },
    password: '',
    confirmPassword: '',
  });

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  }

  function handleRegisterChange(event) {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    const result = login(loginForm);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    showToast(`Bienvenido/a ${result.user.name}.`);
    navigate(result.user.role === 'admin' ? '/admin' : '/');
  }

  function handleAddressChange(address) {
    setRegisterForm((current) => ({ ...current, address }));
  }

  function handleRegisterSubmit(event) {
    event.preventDefault();

    const missingAddress = getMissingRequired(registerForm.address);
    if (missingAddress.length > 0) {
      showToast(`Completa la dirección: ${missingAddress.join(', ')}.`, 'error');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }
    if (registerForm.password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    const result = register(registerForm);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    showToast('¡Registro exitoso! Bienvenido/a a ProShine.');
    navigate('/');
  }

  function fillDemoCredentials(role) {
    setActiveTab('login');
    if (role === 'admin') {
      setLoginForm({ email: 'admin@proshine.com', password: 'admin123' });
      showToast('Credenciales de Administrador cargadas.');
    } else {
      setLoginForm({ email: 'cliente@proshine.com', password: 'cliente123' });
      showToast('Credenciales de Cliente cargadas.');
    }
  }

  const tabClass = (tab) =>
    `flex items-center justify-center gap-space-xs py-space-sm rounded font-title-md text-title-md transition-all duration-300 ${
      activeTab === tab ? 'bg-primary-container text-on-primary-container shadow-md bevel-top' : 'text-on-surface-variant hover:text-on-surface'
    }`;

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-surface p-space-md py-space-xl overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[36rem] h-[36rem] rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl flex flex-col gap-space-sm animate-fade-up">
        <Link
          to="/"
          className="self-start inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg glass-panel text-on-surface-variant hover:text-secondary font-label-md text-label-md transition-colors"
        >
          <Icon name="arrowLeft" className="w-4 h-4" />
          Volver a la Tienda
        </Link>

        <div className="relative w-full rounded-xl p-space-md sm:p-space-lg glass-panel-strong shadow-2xl overflow-hidden">
          <header className="relative z-10 flex flex-col items-center text-center gap-space-sm mb-space-md">
            <span className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-high/80 font-label-sm text-label-sm uppercase tracking-wider text-secondary bevel-top">
              <Icon name="shield" className="w-3.5 h-3.5" />
              Autenticación Segura
            </span>
            <Logo className="h-20" />
            <div className="w-full flex items-center justify-between px-space-sm pt-space-xs">
              {SECTORS.map((sector) => (
                <span key={sector.label} className="flex flex-col items-center gap-1 text-on-surface-variant/70">
                  <Icon name={sector.icon} className="w-4 h-4 text-secondary" />
                  <span className="font-label-sm text-[0.9rem]">{sector.label}</span>
                </span>
              ))}
            </div>
          </header>

          <div className="relative z-10 grid grid-cols-2 p-1 bg-surface-container-lowest/70 rounded-lg mb-space-md">
            <button type="button" onClick={() => setActiveTab('login')} className={tabClass('login')}>
              <Icon name="lock" className="w-4 h-4" />
              Iniciar Sesión
            </button>
            <button type="button" onClick={() => setActiveTab('register')} className={tabClass('register')}>
              <Icon name="user" className="w-4 h-4" />
              Registrarse
            </button>
          </div>

          {activeTab === 'login' ? (
            <form className="relative z-10 flex flex-col gap-space-md animate-fade-in" onSubmit={handleLoginSubmit}>
              <Field id="login-email" label="Correo Electrónico" icon="mail" hint="REQUERIDO">
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="gerencia@empresa.com"
                  className={INPUT_CLASS}
                />
              </Field>

              <Field id="login-password" label="Contraseña" icon="lock">
                <input
                  id="login-password"
                  name="password"
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="••••••••••••"
                  className={`${INPUT_CLASS} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((current) => !current)}
                  className="absolute right-1 w-11 h-11 flex items-center justify-center rounded-lg text-outline hover:text-secondary hover:bg-surface-container transition-colors"
                  aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <Icon name="eye" className="w-5 h-5" />
                </button>
              </Field>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-space-xs py-space-md rounded-lg bg-gradient-to-r from-primary-container via-secondary-container to-secondary text-on-primary-container font-display text-headline-sm tracking-wide shadow-lg bevel-top hover:brightness-110 transition"
              >
                Ingresar a ProShine
                <Icon name="arrowRight" className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <form className="relative z-10 flex flex-col gap-space-sm animate-fade-in" onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                <Field id="reg-name" label="Nombre y Apellido" icon="user">
                  <input id="reg-name" name="name" type="text" required value={registerForm.name} onChange={handleRegisterChange} placeholder="Carlos Méndez" className={INPUT_CLASS} />
                </Field>
                <Field id="reg-phone" label="Teléfono / WhatsApp" icon="phone">
                  <input id="reg-phone" name="phone" type="tel" required value={registerForm.phone} onChange={handleRegisterChange} placeholder="+52 55 4920 1832" className={INPUT_CLASS} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                <Field id="reg-email" label="Correo Electrónico" icon="mail">
                  <input id="reg-email" name="email" type="email" required value={registerForm.email} onChange={handleRegisterChange} placeholder="contacto@organizacion.com" className={INPUT_CLASS} />
                </Field>
                <Field id="reg-rfc" label="R.F.C." hint="OPCIONAL" icon="document">
                  <input id="reg-rfc" name="rfc" type="text" maxLength={13} value={registerForm.rfc} onChange={handleRegisterChange} placeholder="XAXX010101000" className={`${INPUT_CLASS} uppercase`} />
                </Field>
              </div>

              <fieldset className="flex flex-col gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest/50">
                <legend className="flex items-center gap-space-xs px-space-xs font-label-md text-label-md text-secondary uppercase tracking-wider">
                  <Icon name="pin" className="w-4 h-4" />
                  Dirección de Entrega
                </legend>
                <AddressFields
                  idPrefix="reg-address"
                  address={registerForm.address}
                  onChange={handleAddressChange}
                  inputClass="w-full bg-surface-container-lowest/80 text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-lg outline-none focus:bg-surface-container-high focus:ring-1 focus:ring-secondary/40 transition placeholder:text-outline/70"
                  labelClass="font-label-sm text-label-sm text-on-surface-variant"
                />
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                <Field id="reg-password" label="Contraseña" icon="lock">
                  <input id="reg-password" name="password" type="password" required minLength={6} value={registerForm.password} onChange={handleRegisterChange} placeholder="Mínimo 6 caracteres" className={INPUT_CLASS} />
                </Field>
                <Field id="reg-confirm-password" label="Confirmar Contraseña" icon="check">
                  <input id="reg-confirm-password" name="confirmPassword" type="password" required minLength={6} value={registerForm.confirmPassword} onChange={handleRegisterChange} placeholder="Repite contraseña" className={INPUT_CLASS} />
                </Field>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-space-xs py-space-md rounded-lg bg-gradient-to-r from-primary-container via-secondary-container to-secondary text-on-primary-container font-display text-headline-sm tracking-wide shadow-lg bevel-top hover:brightness-110 transition mt-space-xs"
              >
                Crear Cuenta de Cliente
                <Icon name="arrowRight" className="w-5 h-5" />
              </button>
            </form>
          )}
{/*
          <div className="relative z-10 mt-space-lg bg-surface-container-low/60 rounded-lg p-space-sm flex flex-col gap-space-xs">
            <span className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              <Icon name="sparkle" className="w-3.5 h-3.5" />
              Acceso Rápido Demo
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
              <button
                type="button"
                onClick={() => fillDemoCredentials('cliente')}
                className="p-space-sm rounded-lg bg-surface-container-high hover:bg-surface-bright text-left transition flex items-start gap-space-sm glow-hover border border-transparent"
              >
                <span className="p-2 rounded bg-surface-container text-secondary shrink-0">
                  <Icon name="cart" className="w-4 h-4" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="font-title-md text-title-md text-on-surface">Cliente</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Catálogo y pedidos</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="p-space-sm rounded-lg bg-surface-container-high hover:bg-surface-bright text-left transition flex items-start gap-space-sm glow-hover border border-transparent"
              >
                <span className="p-2 rounded bg-surface-container text-primary shrink-0">
                  <Icon name="shield" className="w-4 h-4" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="font-title-md text-title-md text-on-surface">Administrador</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Gestión CRUD y ventas</span>
                </span>
              </button>
            </div>
            
          </div>
*/}
        </div>
      </div>
    </main>
  );
}

export default AuthPage;
