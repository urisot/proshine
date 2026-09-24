import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import * as orderService from '../../services/orderService.js';
import { getAll as getAllUsers } from '../../services/userService.js';
import { get as getSettings } from '../../services/settingsService.js';
import { normalizeAddress } from '../../services/addressService.js';
import Icon from '../common/Icon.jsx';
import IconButton from '../common/IconButton.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Modal from '../common/Modal.jsx';

function CartDrawer({ isOpen, onClose }) {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const { session, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const settings = getSettings();
  const tax = total * (settings.taxRate / 100);
  const hasFreeShipping = total >= settings.freeShippingThreshold;

  function goTo(path) {
    onClose();
    navigate(path);
  }

  function handleOpenConfirm(event) {
    event.preventDefault();
    if (!isAuthenticated) {
      showToast('Inicia sesión para completar tu pedido.', 'error');
      goTo('/acceso');
      return;
    }
    setIsConfirmOpen(true);
  }

  function handleConfirmOrder(event) {
    event.preventDefault();

    const currentUser = getAllUsers().find((user) => user.id === session.id);
    const order = orderService.create({
      userId: session.id,
      customerName: session.name,
      customerPhone: currentUser?.phone || '',
      customerAddress: normalizeAddress(currentUser?.address),
      customerRfc: currentUser?.rfc || '',
      items,
      notes,
    });

    window.open(orderService.getWhatsappLink(order), '_blank', 'noopener');

    clearCart();
    setNotes('');
    setIsConfirmOpen(false);
    showToast(`Pedido ${order.id} enviado por WhatsApp.`);
    goTo('/mis-pedidos');
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-[90] bg-surface-container-lowest/70 backdrop-blur-sm animate-fade-in"
          aria-label="Cerrar carrito"
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[42rem] max-w-full z-[90] flex flex-col bg-surface-container border-l border-secondary/20 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between gap-space-md p-space-md hairline">
          <div className="flex items-center gap-space-sm min-w-0">
            <span className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center bevel-top shrink-0">
              <Icon name="cart" />
            </span>
            <div className="flex flex-col min-w-0">
              <h2 className="font-display text-headline-sm text-on-surface">Tu Pedido ProShine</h2>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                Directo a Producción / Bodega
              </span>
            </div>
          </div>
          <IconButton icon="close" label="Cerrar carrito" onClick={onClose} variant="close" rounded="rounded-full" />
        </header>

        <div className="flex-1 overflow-y-auto p-space-md">
          {items.length === 0 ? (
            <EmptyState
              icon="cart"
              title="El carrito está vacío"
              message="Selecciona productos del catálogo industrial o doméstico para generar tu orden."
              action={
                <button
                  type="button"
                  onClick={() => goTo('/')}
                  className="mt-space-xs px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-md bevel-top"
                >
                  Explorar Catálogo
                </button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-space-sm stagger">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.unit}`}
                  className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container/60 glow-hover border border-transparent"
                >
                  <span className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
                    <Icon name="flask" />
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-title-md text-title-md text-on-surface truncate">{item.name}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {item.unit} • ${item.unitPrice.toFixed(2)} c/u
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0">
                    <div className="flex items-center rounded-lg bg-surface-container-high overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.unit, item.quantity - 1)}
                        className="w-10 h-11 flex items-center justify-center text-title-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
                        aria-label={`Disminuir cantidad de ${item.name}`}
                      >
                        −
                      </button>
                      <span className="px-space-xs font-label-md text-label-md text-on-surface min-w-[2.8rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.unit, item.quantity + 1)}
                        className="w-10 h-11 flex items-center justify-center text-title-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
                        aria-label={`Aumentar cantidad de ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <IconButton
                      icon="trash"
                      label={`Quitar ${item.name}`}
                      onClick={() => removeItem(item.productId, item.unit)}
                      variant="danger"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="flex flex-col gap-space-sm p-space-md border-t border-surface-container-high">
            <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
              <span>IVA ({settings.taxRate}%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between font-body-sm text-body-sm">
              <span className="text-on-surface-variant">Envío</span>
              <span className={hasFreeShipping ? 'text-secondary font-bold' : 'text-on-surface-variant'}>
                {hasFreeShipping
                  ? 'Gratis'
                  : `Faltan $${(settings.freeShippingThreshold - total).toFixed(2)} para envío gratis`}
              </span>
            </div>
            <div className="flex items-center justify-between pt-space-xs border-t border-surface-container-high">
              <span className="font-label-lg text-label-lg text-on-surface uppercase">Total a Confirmar</span>
              <span className="font-display text-headline-sm text-secondary font-bold">${(total + tax).toFixed(2)} MXN</span>
            </div>
            <button
              type="button"
              onClick={handleOpenConfirm}
              className="w-full flex items-center justify-center gap-space-xs py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-lg text-label-lg shadow-lg bevel-top hover:brightness-110 transition"
            >
              <Icon name="chat" className="w-5 h-5" />
              Realizar Pedido vía WhatsApp
            </button>
          </footer>
        )}
      </aside>

      <Modal
        isOpen={isConfirmOpen}
        title="Confirmación de Pedido"
        subtitle="Revisa los conceptos antes de enviarlos a ventas"
        icon="document"
        onClose={() => setIsConfirmOpen(false)}
      >
        <form onSubmit={handleConfirmOrder} className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container">
            {items.map((item) => (
              <div key={`${item.productId}-${item.unit}`} className="flex justify-between gap-space-sm font-body-sm text-body-sm">
                <span className="text-on-surface truncate">
                  {item.name} ({item.unit}) ×{item.quantity}
                </span>
                <span className="text-on-surface-variant shrink-0">${(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="order-notes" className="font-label-md text-label-md text-on-surface-variant">
              Notas adicionales (opcional)
            </label>
            <textarea
              id="order-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              placeholder="Horario de entrega, andén de carga, referencias..."
              className="w-full bg-surface-container-lowest text-on-surface px-space-md py-space-sm rounded-lg outline-none focus:bg-surface-container-high transition"
            />
          </div>

          <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container">
            <span className="font-label-lg text-label-lg text-on-surface uppercase">Total</span>
            <span className="font-display text-headline-sm text-secondary font-bold">${(total + tax).toFixed(2)} MXN</span>
          </div>

          <div className="sticky bottom-0 flex flex-col sm:flex-row items-center justify-end gap-space-sm py-space-md bg-surface-container border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              className="w-full sm:w-auto px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-lg text-label-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-lg text-label-lg shadow-lg bevel-top"
            >
              <Icon name="chat" className="w-4 h-4" />
              Enviar Pedido
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default CartDrawer;
