import { STATUSES, getTotals } from '../../services/orderService.js';
import Icon from '../common/Icon.jsx';
import IconButton from '../common/IconButton.jsx';
import EmptyState from '../common/EmptyState.jsx';

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_transito: 'En Tránsito',
  terminado: 'Terminado',
  cancelado: 'Cancelado',
};

const STATUS_COLORS = {
  pendiente: 'bg-[#422006] text-[#fde047]',
  confirmado: 'bg-[#082f49] text-[#7dd3fc]',
  en_transito: 'bg-[#3b0764] text-[#d8b4fe]',
  terminado: 'bg-[#022c22] text-[#6ee7b7]',
  cancelado: 'bg-[#450a0a] text-[#fca5a5]',
};

function OrdersTable({ orders, onStatusChange, onViewDetail, onDownloadRemision }) {
  if (orders.length === 0) {
    return (
      <div className="glass-panel rounded-xl">
        <EmptyState
          icon="inbox"
          title="Sin pedidos"
          message="No hay pedidos que coincidan con los filtros seleccionados."
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto glass-panel rounded-xl shadow-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-high/60 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            <th className="py-space-sm px-space-md">Folio</th>
            <th className="py-space-sm px-space-md">Cliente / Empresa</th>
            <th className="py-space-sm px-space-md">Contacto</th>
            <th className="py-space-sm px-space-md">Fecha • Hora</th>
            <th className="py-space-sm px-space-md text-right">Total (MXN)</th>
            <th className="py-space-sm px-space-md">Estatus Logístico</th>
            <th className="py-space-sm px-space-md text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="font-body-md text-body-md">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-surface-container/50 transition-colors border-t border-surface-container-highest/20">
              <td className="py-space-md px-space-md font-label-lg text-label-lg text-secondary font-bold whitespace-nowrap">
                {order.id}
              </td>
              <td className="py-space-md px-space-md">
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface">{order.customerName}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {order.items.length} artículo{order.items.length === 1 ? '' : 's'} •{' '}
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} pzas
                  </span>
                </div>
              </td>
              <td className="py-space-md px-space-md">
                {order.customerPhone ? (
                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hola, damos seguimiento a su pedido ProShine ${order.id}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-lg bg-surface-container-high hover:bg-secondary-container hover:text-on-secondary text-secondary font-label-sm text-label-sm transition-colors whitespace-nowrap"
                  >
                    <Icon name="chat" className="w-3.5 h-3.5" />
                    {order.customerPhone}
                  </a>
                ) : (
                  <span className="font-body-sm text-body-sm text-outline">Sin teléfono</span>
                )}
              </td>
              <td className="py-space-md px-space-md text-on-surface-variant font-label-md text-label-md whitespace-nowrap">
                {new Date(order.createdAt).toLocaleString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="py-space-md px-space-md text-right font-display text-headline-sm text-on-surface font-semibold whitespace-nowrap">
                ${getTotals(order).total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="py-space-md px-space-md">
                <select
                  value={order.status}
                  onChange={(event) => onStatusChange(order.id, event.target.value)}
                  className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm uppercase font-bold cursor-pointer focus:outline-none ${STATUS_COLORS[order.status]}`}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-space-md px-space-md text-right">
                <div className="inline-flex items-center gap-space-xs">
                  <IconButton icon="eye" label={`Ver detalle del pedido ${order.id}`} onClick={() => onViewDetail(order)} />
                  <IconButton
                    icon="download"
                    label={`Imprimir nota de venta ${order.id}`}
                    onClick={() => onDownloadRemision(order)}
                    variant="accent"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersTable;
