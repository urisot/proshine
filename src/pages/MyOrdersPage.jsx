import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Icon from '../components/common/Icon.jsx';
import * as orderService from '../services/orderService.js';
import { printRemision, getFolio } from '../services/remisionService.js';

const STATUS_META = {
  pendiente: { label: 'Pendiente', badge: 'bg-[#422006] text-[#fde047]', step: 1 },
  confirmado: { label: 'Confirmado', badge: 'bg-[#082f49] text-[#7dd3fc]', step: 2 },
  en_transito: { label: 'En Tránsito', badge: 'bg-[#3b0764] text-[#d8b4fe]', step: 3 },
  terminado: { label: 'Terminado', badge: 'bg-[#022c22] text-[#6ee7b7]', step: 4 },
  cancelado: { label: 'Cancelado', badge: 'bg-[#450a0a] text-[#fca5a5]', step: 0 },
};

const TIMELINE = ['Pendiente', 'Confirmado', 'En Tránsito', 'Terminado'];

function MyOrdersPage() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(() => orderService.getByUser(session.id));
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  function handleDownloadRemision(order) {
    printRemision(order);
    showToast(`Nota de venta ${getFolio(order)} lista. Imprímela o elige "Guardar como PDF".`);
  }

  function handleCancelConfirm() {
    const result = orderService.cancel(orderToCancel.id);
    if (!result.success) {
      showToast(result.message, 'error');
    } else {
      showToast(`Pedido ${orderToCancel.id} cancelado.`);
      setOrders(orderService.getByUser(session.id));
    }
    setOrderToCancel(null);
  }

  const filteredOrders = orders.filter((order) => statusFilter === 'all' || order.status === statusFilter);

  return (
    <main className="w-full pt-28 pb-space-xl bg-surface min-h-screen px-margin-mobile sm:px-margin">
      <div className="max-w-4xl mx-auto flex flex-col gap-space-md">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md animate-fade-up">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Seguimiento</span>
            <h1 className="font-display text-headline-lg text-on-surface tracking-tight">Mis Pedidos</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Consulta el avance logístico y descarga tus remisiones.
            </p>
          </div>
          {orders.length > 0 && (
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full sm:w-52 px-space-md py-space-sm rounded-lg bg-surface-container-highest text-on-surface font-label-md text-label-md focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los estatus</option>
              {Object.entries(STATUS_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          )}
        </header>

        {orders.length === 0 && (
          <div className="glass-panel rounded-xl">
            <EmptyState
              icon="inbox"
              title="Aún no tienes pedidos"
              message="Cuando realices tu primera compra aparecerá aquí con su seguimiento logístico completo."
              action={
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mt-space-xs px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-md bevel-top"
                >
                  Ir al Catálogo
                </button>
              }
            />
          </div>
        )}

        {orders.length > 0 && filteredOrders.length === 0 && (
          <div className="glass-panel rounded-xl">
            <EmptyState
              icon="filter"
              title="Sin pedidos en este estatus"
              message="Cambia el filtro para ver el resto de tus pedidos."
            />
          </div>
        )}

        <div className="flex flex-col gap-space-md stagger">
          {filteredOrders.map((order) => {
            const meta = STATUS_META[order.status];
            const isCancelled = order.status === 'cancelado';
            const totals = orderService.getTotals(order);

            return (
              <article key={order.id} className="flex flex-col gap-space-sm glass-panel p-space-md rounded-xl lift-hover">
                <div className="flex flex-wrap items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary bevel-top">
                      <Icon name="document" />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-secondary font-bold">
                        Nota {getFolio(order)}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {new Date(order.createdAt).toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                  <span className={`px-space-sm py-0.5 rounded-full font-label-sm text-label-sm uppercase font-bold ${meta.badge}`}>
                    {meta.label}
                  </span>
                </div>

                {!isCancelled && (
                  <div className="flex items-center gap-1 py-space-xs">
                    {TIMELINE.map((step, index) => {
                      const isDone = index < meta.step;
                      const isCurrent = index === meta.step - 1;
                      return (
                        <div key={step} className="flex-1 flex flex-col gap-1">
                          <div
                            className={`h-1 rounded-full transition-colors ${
                              isDone ? 'bg-secondary-container' : 'bg-surface-container-highest'
                            } ${isCurrent ? 'shadow-[0_0_0.8rem_rgba(0,210,253,0.6)]' : ''}`}
                          />
                          <span className={`font-label-sm text-[0.9rem] ${isDone ? 'text-secondary' : 'text-outline'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <ul className="flex flex-col gap-1">
                  {order.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.unit}`}
                      className="flex justify-between gap-space-sm font-body-sm text-body-sm"
                    >
                      <span className="text-on-surface-variant truncate">
                        {item.name} ({item.unit}) ×{item.quantity}
                      </span>
                      <span className="text-on-surface-variant shrink-0">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="flex flex-col gap-1 pt-space-xs border-t border-surface-container-high font-body-sm text-body-sm text-on-surface-variant">
                  <div className="flex justify-between gap-space-sm">
                    <dt>Subtotal</dt>
                    <dd>${totals.subtotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between gap-space-sm">
                    <dt>IVA ({totals.taxRate}%)</dt>
                    <dd>${totals.tax.toFixed(2)}</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap items-center justify-between gap-space-sm">
                  <span className="font-display text-headline-sm text-on-surface font-bold">
                    ${totals.total.toFixed(2)} MXN
                  </span>
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <button
                      type="button"
                      onClick={() => handleDownloadRemision(order)}
                      className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary font-label-md text-label-md transition-colors"
                    >
                      <Icon name="download" className="w-4 h-4" />
                      Nota de Venta
                    </button>
                    {orderService.canCancel(order) && (
                      <button
                        type="button"
                        onClick={() => setOrderToCancel(order)}
                        className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-error-container text-error hover:text-on-error-container font-label-md text-label-md transition-colors"
                      >
                        <Icon name="close" className="w-4 h-4" />
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(orderToCancel)}
        title="Cancelar Pedido"
        message={`¿Confirmas que deseas cancelar el pedido ${orderToCancel?.id}? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, Cancelar"
        onConfirm={handleCancelConfirm}
        onCancel={() => setOrderToCancel(null)}
      />
    </main>
  );
}

export default MyOrdersPage;
