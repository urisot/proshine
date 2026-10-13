import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import { PAYMENT_METHODS, PAYMENT_LABELS } from '../../services/saleService.js';

const PAYMENT_ICONS = {
  efectivo: 'money',
  tarjeta: 'card',
  spei: 'bank',
  credito: 'document',
};

// Pregunta cómo se pagaron los pedidos que pasan a "Terminado" (por defecto efectivo).
// Una sola forma de pago aplica a todos los pedidos recibidos.
function OrderPaymentModal({ orders, total, isSaving, onConfirm, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const isOpen = orders.length > 0;

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('efectivo');
    }
  }, [isOpen]);

  function handleSubmit(event) {
    event.preventDefault();
    onConfirm(paymentMethod);
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Registrar venta"
      subtitle={orders.length === 1 ? `Pedido ${orders[0].id}` : `${orders.length} pedidos seleccionados`}
      icon="money"
      onClose={isSaving ? () => {} : onClose}
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Al pasar a Terminado se registra la venta y se descuenta el stock. ¿Cómo se realizó el pago?
        </p>

        <div className="flex justify-between items-end p-space-md rounded-xl bg-surface-container-high">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Total (IVA incluido)</span>
          <span className="font-display text-headline-sm text-secondary font-bold">${total.toFixed(2)} MXN</span>
        </div>

        <fieldset className="flex flex-col gap-space-xs">
          <legend className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-space-xs">Método de pago:</legend>
          <div className="grid grid-cols-2 gap-space-xs">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                aria-pressed={paymentMethod === method}
                className={`px-space-sm py-space-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-space-xs transition-all ${
                  paymentMethod === method
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon name={PAYMENT_ICONS[method]} className="w-4 h-4" />
                {PAYMENT_LABELS[method]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-space-sm">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-lg text-label-lg shadow-lg bevel-top disabled:opacity-50 disabled:cursor-wait"
          >
            <Icon name="check" className="w-4 h-4" />
            {isSaving ? 'Registrando...' : 'Terminar y registrar venta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default OrderPaymentModal;
