import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader.jsx';
import CartDrawer from '../cart/CartDrawer.jsx';

function PublicLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <PublicHeader onOpenCart={() => setIsCartOpen(true)} />
      <Outlet />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default PublicLayout;
