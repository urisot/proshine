import { useEffect } from 'react';
import { seedIfEmpty } from './services/seedData.js';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AppRouter from './router/AppRouter.jsx';

function App() {
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppRouter />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
