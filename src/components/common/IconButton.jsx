import Icon from './Icon.jsx';

// Área de click de 4.4rem (44px): mínimo recomendado para objetivos táctiles.
const VARIANTS = {
  neutral: 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface',
  ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
  accent: 'bg-surface-container hover:bg-surface-container-high text-secondary',
  danger: 'bg-surface-container hover:bg-error-container text-error hover:text-on-error-container',
  close: 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface',
};

function IconButton({ icon, label, onClick, variant = 'neutral', disabled = false, rounded = 'rounded-lg', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`w-11 h-11 flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${rounded} ${VARIANTS[variant]}`}
    >
      <Icon name={icon} className="w-5 h-5" />
    </button>
  );
}

export default IconButton;
