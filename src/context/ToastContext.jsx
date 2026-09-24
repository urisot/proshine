import { createContext, useCallback, useContext, useState } from 'react';
import Icon from '../components/common/Icon.jsx';

const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="fixed bottom-6 right-6 left-6 sm:left-auto z-[110] flex items-center gap-space-sm px-space-lg py-space-sm rounded-xl bg-surface-container-high border border-secondary/20 shadow-2xl animate-fade-up"
        >
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary'
            }`}
          >
            <Icon name={toast.type === 'error' ? 'alert' : 'check'} className="w-4 h-4" strokeWidth={2} />
          </span>
          <span className={`font-body-md text-body-md font-semibold ${toast.type === 'error' ? 'text-error' : 'text-on-surface'}`}>
            {toast.message}
          </span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
}

export { ToastProvider, useToast };
