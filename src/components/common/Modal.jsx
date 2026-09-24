import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';
import IconButton from './IconButton.jsx';

function Modal({ isOpen, title, subtitle, icon = 'flask', onClose, children, footer, maxWidthClass = 'max-w-lg' }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    // Evita que la página de fondo se desplace mientras el modal está abierto.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Se monta en document.body: los paneles con backdrop-filter crean contextos de
  // apilamiento que atraparían al modal detrás del contenido de la página.
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-space-md animate-fade-in">
      <div
        className={`w-full ${maxWidthClass} max-h-[90vh] bg-surface-container border border-secondary/20 rounded-xl shadow-2xl flex flex-col animate-scale-in overflow-hidden`}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between gap-space-md p-space-lg pb-space-md shrink-0">
          <div className="flex items-center gap-space-sm min-w-0">
            <span className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center bevel-top shrink-0">
              <Icon name={icon} />
            </span>
            <div className="flex flex-col min-w-0">
              <h3 className="font-display text-headline-sm text-on-surface truncate">{title}</h3>
              {subtitle && <span className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</span>}
            </div>
          </div>
          <IconButton icon="close" label="Cerrar" onClick={onClose} variant="close" rounded="rounded-full" />
        </header>

        {/* min-h-0 permite que este bloque haga scroll dentro del contenedor flex. */}
        <div className="flex-1 min-h-0 overflow-y-auto px-space-lg flex flex-col gap-space-md">{children}</div>

        {footer && (
          <footer className="shrink-0 p-space-lg pt-space-md border-t border-surface-container-high bg-surface-container">
            {footer}
          </footer>
        )}

        {!footer && <div className="shrink-0 h-space-lg" />}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
