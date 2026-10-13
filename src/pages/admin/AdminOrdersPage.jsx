import { useEffect, useState } from 'react';
import * as orderService from '../../services/orderService.js';
import * as settingsService from '../../services/settingsService.js';
import { printRemision, downloadOrdersReport, getFolio } from '../../services/remisionService.js';
import { formatAddress } from '../../services/addressService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import OrderLogModal from '../../components/common/OrderLogModal.jsx';
import OrdersTable from '../../components/admin/OrdersTable.jsx';
import OrderPaymentModal from '../../components/admin/OrderPaymentModal.jsx';
import StatusNotificationModal from '../../components/admin/StatusNotificationModal.jsx';
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
  const [orders, setOrders] = useState([]);
  const [taxRate, setTaxRate] = useState(16);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneTerm, setPhoneTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [logOrder, setLogOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [ordersToComplete, setOrdersToComplete] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    orderService.getAll().then(setOrders);
    settingsService.get().then((settings) => setTaxRate(settings.taxRate));
  }, []);

  // Cambia el estatus de uno o varios pedidos, uno por uno, para que cada cambio quede en la bitácora.
  // "terminado" usa orderService.complete para registrar la venta con la forma de pago elegida.
  async function applyStatusChange(targetOrders, newStatus, paymentMethod) {
    const results = [];
    const errors = [];

    for (const order of targetOrders) {
      try {
        const result =
          newStatus === 'terminado'
            ? await orderService.complete(order.id, paymentMethod, session)
            : await orderService.updateStatus(order.id, newStatus, session);
        results.push(result);
      } catch (error) {
        errors.push(`${order.id}: ${error.message}`);
      }
    }

    setOrders(await orderService.getAll());
    setSelectedIds([]);
    setBulkStatus('');

    if (results.length > 0) {
      const label = STATUS_LABELS[newStatus];
      showToast(
        results.length === 1
          ? `Pedido ${results[0].order.id} actualizado a "${label}".`
          : `${results.length} pedidos actualizados a "${label}".`
      );
    }
    if (errors.length > 0) {
      showToast(`No se pudo actualizar: ${errors.join(' • ')}`, 'error');
    }

    // El aviso a los clientes lo envía el administrador desde los enlaces de WhatsApp (sin envío automático).
    if (orderService.shouldNotifyCustomer(newStatus)) {
      setNotifications(results.map(({ order, log }) => ({ order, log })));
    }
  }

  function handleStatusChange(orderId, newStatus) {
    const order = orders.find((item) => item.id === orderId);
    if (newStatus === 'terminado') {
      setOrdersToComplete([order]);
      return;
    }
    applyStatusChange([order], newStatus);
  }

  function handleBulkSubmit(event) {
    event.preventDefault();
    if (!selectedStatus || !bulkTargets.includes(bulkStatus)) {
      return;
    }
    if (bulkStatus === 'terminado') {
      setOrdersToComplete(selectedOrders);
      return;
    }
    applyStatusChange(selectedOrders, bulkStatus);
  }

  async function handleConfirmPayment(paymentMethod) {
    setIsSaving(true);
    await applyStatusChange(ordersToComplete, 'terminado', paymentMethod);
    setIsSaving(false);
    setOrdersToComplete([]);
  }

  function handleToggleSelect(orderId) {
    setSelectedIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]
    );
  }

  function handleToggleAll(orderIds, shouldSelect) {
    setSelectedIds((current) => {
      const withoutPage = current.filter((id) => !orderIds.includes(id));
      return shouldSelect ? [...withoutPage, ...orderIds] : withoutPage;
    });
  }

  async function handleDownloadRemision(order) {
    await printRemision(order);
    showToast(`Nota de venta ${getFolio(order)} lista. Imprímela o elige "Guardar como PDF".`);
  }

  async function handleExportAll(event) {
    event.preventDefault();
    await downloadOrdersReport(filteredOrders);
    showToast('Reporte de pedidos descargado en formato CSV.');
  }

  const phoneDigits = phoneTerm.replace(/\D/g, '');

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhone = !phoneDigits || (order.customerPhone || '').replace(/\D/g, '').includes(phoneDigits);
    return matchesStatus && matchesSearch && matchesPhone;
  });

  // Solo cuentan los pedidos seleccionados que siguen visibles con los filtros actuales.
  const selectedOrders = filteredOrders.filter((order) => selectedIds.includes(order.id));
  // Regla del cambio masivo: todos los pedidos deben estar en el mismo estatus.
  const selectedStatus =
    selectedOrders.length > 0 && selectedOrders.every((order) => order.status === selectedOrders[0].status)
      ? selectedOrders[0].status
      : null;
  const hasMixedStatus = selectedOrders.length > 0 && !selectedStatus;
  const bulkTargets = selectedStatus ? orderService.getBulkTargets(selectedStatus) : [];

  const completionTotal = ordersToComplete.reduce(
    (sum, order) => sum + orderService.getTotals(order, taxRate).total,
    0
  );

  const detailTotals = detailOrder ? orderService.getTotals(detailOrder, taxRate) : null;

  return (
    <main className="pt-20 bg-surface min-h-screen px-space-md lg:px-space-lg py-space-md pb-space-xl">
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
          <div className="relative w-full sm:w-56 flex items-center">
            <Icon name="phone" className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
            <input
              type="tel"
              value={phoneTerm}
              onChange={(event) => setPhoneTerm(event.target.value)}
              placeholder="Filtrar por teléfono..."
              aria-label="Filtrar por número de contacto"
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

        <form
          onSubmit={handleBulkSubmit}
          className="flex flex-col md:flex-row md:items-center gap-space-md glass-panel p-space-md rounded-xl shadow-md"
        >
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Cambio masivo</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {selectedOrders.length === 0 && 'Selecciona pedidos con el mismo estatus.'}
              {selectedStatus &&
                `${selectedOrders.length} seleccionado${selectedOrders.length === 1 ? '' : 's'} • ${STATUS_LABELS[selectedStatus]}`}
              {hasMixedStatus && (
                <span className="text-error">Los pedidos seleccionados deben estar en el mismo estatus.</span>
              )}
            </span>
          </div>
          <select
            value={bulkTargets.includes(bulkStatus) ? bulkStatus : ''}
            onChange={(event) => setBulkStatus(event.target.value)}
            disabled={bulkTargets.length === 0}
            aria-label="Nuevo estatus para los pedidos seleccionados"
            className="w-full md:w-56 md:ml-auto px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Cambiar estatus a...</option>
            {bulkTargets.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <div className="flex gap-space-sm">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              disabled={selectedIds.length === 0}
              className="flex-1 md:flex-none px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar selección
            </button>
            <button
              type="submit"
              disabled={!bulkTargets.includes(bulkStatus)}
              className="flex-1 md:flex-none flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-lg text-label-lg shadow-lg bevel-top disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="check" className="w-4 h-4" />
              Aplicar
            </button>
          </div>
        </form>

        <OrdersTable
          orders={filteredOrders}
          taxRate={taxRate}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          onStatusChange={handleStatusChange}
          onViewDetail={setDetailOrder}
          onViewLog={setLogOrder}
          onDownloadRemision={handleDownloadRemision}
        />
      </div>

      <OrderLogModal order={logOrder} onClose={() => setLogOrder(null)} />

      <OrderPaymentModal
        orders={ordersToComplete}
        total={completionTotal}
        isSaving={isSaving}
        onConfirm={handleConfirmPayment}
        onClose={() => setOrdersToComplete([])}
      />

      <StatusNotificationModal notifications={notifications} onClose={() => setNotifications([])} />

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
