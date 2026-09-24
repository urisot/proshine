import { useState } from 'react';
import * as orderService from '../../services/orderService.js';
import { printRemision, downloadOrdersReport, getFolio } from '../../services/remisionService.js';
import { formatAddress } from '../../services/addressService.js';
import { useToast } from '../../context/ToastContext.jsx';
import OrdersTable from '../../components/admin/OrdersTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Icon from '../../components/common/Icon.jsx';

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_transito: 'En Tránsito',
  terminado: 'Terminado',
  cancelado: 'Cancelado',
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState(() => orderService.getAll());
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const { showToast } = useToast();


  function handleStatusChange(orderId, newStatus) {
    orderService.updateStatus(orderId, newStatus);
    setOrders(orderService.getAll());
    showToast(`Pedido ${orderId} actualizado a "${STATUS_LABELS[newStatus]}".`);
  }

  function handleDownloadRemision(order) {
    printRemision(order);
    showToast(`Nota de venta ${getFolio(order)} lista. Imprímela o elige "Guardar como PDF".`);
  }

  function handleExportAll(event) {
    event.preventDefault();
    downloadOrdersReport(filteredOrders);
    showToast('Reporte de pedidos descargado en formato CSV.');
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const detailTotals = detailOrder ? orderService.getTotals(detailOrder) : null;

  return (
    <main className="lg:pl-72 pt-20 bg-surface min-h-screen px-space-md lg:px-space-lg py-space-md pb-space-xl">
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md animate-fade-up">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Despachos y Rutas</span>
            <h1 className="font-display text-headline-lg text-on-surface tracking-tight">Gestión de Pedidos</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Cambio de fase logística, remisiones y contacto directo con el cliente.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportAll}
            className="flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg shadow-sm transition-colors"
          >
            <Icon name="download" className="w-4 h-4" />
            Exportar Listado (CSV)
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-space-md glass-panel p-space-md rounded-xl shadow-md">
          <div className="relative w-full sm:w-72 flex items-center">
            <Icon name="search" className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por folio o cliente..."
              className="w-full pl-10 pr-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full sm:w-56 px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none cursor-pointer"
          >
            <option value="all">Todos los estatus</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmado">Confirmados</option>
            <option value="en_transito">En Tránsito</option>
            <option value="terminado">Terminados</option>
            <option value="cancelado">Cancelados</option>
          </select>
          <span className="font-body-sm text-body-sm text-on-surface-variant sm:ml-auto">
            Mostrando {filteredOrders.length} de {orders.length} pedidos
          </span>
        </div>

        <OrdersTable
          orders={filteredOrders}
          onStatusChange={handleStatusChange}
          onViewDetail={setDetailOrder}
          onDownloadRemision={handleDownloadRemision}
        />
      </div>

      <Modal
        isOpen={Boolean(detailOrder)}
        title={`Nota de Venta ${detailOrder ? getFolio(detailOrder) : ''}`}
        subtitle={detailOrder?.customerName}
        icon="document"
        onClose={() => setDetailOrder(null)}
        maxWidthClass="max-w-2xl"
        footer={
          detailOrder && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-space-sm">
              <a
                href={`https://wa.me/${detailOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hola, damos seguimiento a su pedido ProShine ${detailOrder.id}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-secondary font-label-lg text-label-lg transition-colors"
              >
                <Icon name="chat" className="w-4 h-4" />
                Contactar por WhatsApp
              </a>
              <button
                type="button"
                onClick={() => handleDownloadRemision(detailOrder)}
                className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-lg text-label-lg shadow-lg bevel-top"
              >
                <Icon name="download" className="w-4 h-4" />
                Imprimir Nota de Venta (PDF)
              </button>
            </div>
          )
        }
      >
        {detailOrder && (
          <div className="flex flex-col gap-space-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-secondary uppercase">Cliente</span>
                <span className="font-title-md text-title-md text-on-surface">{detailOrder.customerName}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{detailOrder.customerPhone}</span>
                {detailOrder.customerRfc && (
                  <span className="font-label-sm text-label-sm text-outline uppercase">
                    R.F.C. {detailOrder.customerRfc}
                  </span>
                )}
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-secondary uppercase">Fecha y Estatus</span>
                <span className="font-body-md text-body-md text-on-surface">
                  {new Date(detailOrder.createdAt).toLocaleString('es-MX')}
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                  {STATUS_LABELS[detailOrder.status]}
                </span>
              </div>
            </div>

            <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-secondary uppercase">Domicilio de Entrega</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {formatAddress(detailOrder.customerAddress) || 'Sin domicilio registrado'}
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg bg-surface-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                    <th className="py-space-xs px-space-sm">Cant.</th>
                    <th className="py-space-xs px-space-sm">Descripción</th>
                    <th className="py-space-xs px-space-sm text-right">P. Unitario</th>
                    <th className="py-space-xs px-space-sm text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm text-on-surface">
                  {detailOrder.items.map((item) => (
                    <tr key={`${item.productId}-${item.unit}`} className="border-t border-surface-container-highest/20">
                      <td className="py-space-xs px-space-sm">{item.quantity}</td>
                      <td className="py-space-xs px-space-sm">
                        {item.name}
                        <span className="text-on-surface-variant"> • {item.unit}</span>
                      </td>
                      <td className="py-space-xs px-space-sm text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-space-xs px-space-sm text-right font-semibold">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {detailOrder.notes && (
              <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-secondary uppercase">Notas</span>
                <span className="font-body-md text-body-md text-on-surface">{detailOrder.notes}</span>
              </div>
            )}

            <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container">
              <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
                <span>Subtotal</span>
                <span>${detailTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
                <span>IVA ({detailTotals.taxRate}%)</span>
                <span>${detailTotals.tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-space-xs border-t border-surface-container-highest/30">
                <span className="font-label-lg text-label-lg text-on-surface uppercase">Total MXN</span>
                <span className="font-display text-headline-sm text-secondary font-bold">
                  ${detailTotals.total.toFixed(2)}
                </span>
              </div>
            </div>

          </div>
        )}
      </Modal>
    </main>
  );
}

export default AdminOrdersPage;
