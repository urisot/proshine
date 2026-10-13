import Icon from '../common/Icon.jsx';
import { PAYMENT_METHODS, PAYMENT_LABELS, getChange } from '../../services/saleService.js';

const PAYMENT_ICONS = {
  efectivo: 'money',
  tarjeta: 'card',
  spei: 'bank',
  credito: 'document',
};

function formatMxn(amount) {
  return `$${amount.toFixed(2)} MXN`;
}

function SaleCheckoutPanel({
  totals,
  paymentMethod,
  onPaymentMethodChange,
  cashReceived,
  onCashReceivedChange,
  isSaving,
  onCheckout,
  onCancel,
}) {
  const change = getChange(totals.total, cashReceived);

  return (
    <section className="rounded-xl bg-surface-container-low p-space-lg shadow-md flex flex-col gap-space-md">
      <header className="flex items-center gap-space-xs">
        <Icon name="money" className="w-5 h-5 text-secondary" />
        <h2 className="font-display text-headline-sm text-on-surface">Liquidación y Cobro</h2>
      </header>

      <dl className="flex flex-col gap-space-xs p-space-md rounded-xl bg-surface-container font-body-md text-body-md">
        <div className="flex justify-between items-center">
          <dt className="text-on-surface-variant">Subtotal bruto:</dt>
          <dd className="text-on-surface font-semibold">{formatMxn(totals.grossSubtotal)}</dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-on-surface-variant">Descuentos aplicados:</dt>
          <dd className="text-secondary font-semibold">-{formatMxn(totals.discount)}</dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-on-surface-variant">IVA ({totals.taxRate}%):</dt>
          <dd className="text-on-surface font-semibold">{formatMxn(totals.tax)}</dd>
        </div>
        <div className="h-px bg-surface-container-highest my-1" />
        <div className="flex justify-between items-end gap-space-sm pt-1">
          <dt className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Total a cobrar</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Moneda Nacional</span>
          </dt>
          <dd className="font-display text-headline-md sm:text-headline-lg text-secondary font-bold leading-none text-right">
            ${totals.total.toFixed(2)}
          </dd>
        </div>
      </dl>

      <fieldset className="flex flex-col gap-space-xs">
        <legend className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-space-xs">Método de pago:</legend>
        <div className="grid grid-cols-2 gap-space-xs">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => onPaymentMethodChange(method)}
              aria-pressed={paymentMethod === method}
              className={`px-space-sm py-space-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-space-xs transition-all ${
                paymentMethod === method
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name={PAYMENT_ICONS[method]} className="w-4 h-4" />
              {PAYMENT_LABELS[method]}
            </button>
          ))}
        </div>
      </fieldset>

      {paymentMethod === 'efectivo' && (
        <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest">
          <div className="flex items-center justify-between font-label-sm text-label-sm uppercase text-on-surface-variant">
            <label htmlFor="cashReceived">Efectivo recibido ($):</label>
            <button
              type="button"
              onClick={() => onCashReceivedChange(totals.total.toFixed(2))}
              className="text-secondary hover:underline uppercase"
            >
              [Exacto ${totals.total.toFixed(2)}]
            </button>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-secondary font-display text-headline-sm pointer-events-none">$</span>
            <input
              id="cashReceived"
              type="number"
              min="0"
              step="0.01"
              value={cashReceived}
              onChange={(event) => onCashReceivedChange(event.target.value)}
              className="w-full pl-8 pr-space-md py-space-xs rounded-lg bg-surface-container text-on-surface font-display text-headline-sm focus:outline-none focus:ring-1 focus:ring-secondary-container"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-body-md text-body-md text-on-surface-variant">Cambio a entregar:</span>
            <span className={`font-display text-headline-md font-bold ${change >= 0 ? 'text-secondary' : 'text-error'}`}>
              {change >= 0 ? formatMxn(change) : `Faltan $${Math.abs(change).toFixed(2)}`}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-space-sm pt-2">
        <button
          type="button"
          onClick={onCheckout}
          disabled={isSaving}
          className="w-full py-space-md rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-display text-headline-sm flex items-center justify-center gap-space-sm shadow-xl hover:opacity-95 transition-all bevel-top disabled:opacity-50 disabled:cursor-wait"
        >
          <Icon name="document" className="w-6 h-6" />
          {isSaving ? 'Registrando...' : 'COBRAR Y EMITIR [F12]'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-bright text-error font-label-md text-label-md flex items-center justify-center gap-space-xs transition-colors"
        >
          <Icon name="close" className="w-4 h-4" />
          Cancelar venta [ESC]
        </button>
      </div>
    </section>
  );
}

export default SaleCheckoutPanel;
