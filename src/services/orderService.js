import { selectAll, insertRow, callRpc } from './supabaseClient.js';
import * as orderLogService from './orderLogService.js';
import { normalizeAddress, formatAddress } from './addressService.js';
import { generateId } from './idService.js';
import * as settingsService from './settingsService.js';

const STATUSES = ['pendiente', 'confirmado', 'en_transito', 'terminado', 'cancelado'];

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_transito: 'En Tránsito',
  terminado: 'Terminado',
  cancelado: 'Cancelado',
};

function fromRow(row) {
  return {
    id: row.id,
    folio: row.folio,
    userId: row.user_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    customerRfc: row.customer_rfc,
    items: row.items,
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    notes: row.notes,
  };
}

async function getAll() {
  const rows = await selectAll('orders', { order: 'created_at.desc' });
  return rows.map(fromRow);
}

// order.total guarda el subtotal (precios + IVA). Aquí se suma el IVA configurado,
// igual que en el carrito, para que la nota y la pantalla muestren el mismo importe.
function getTotals(order, taxRate) {
  const subtotal = order.total;
  const tax = subtotal * (taxRate / 100);
  return { subtotal, taxRate, tax, total: subtotal + tax };
}

async function getByUser(userId) {
  const rows = await selectAll('orders', { filters: { user_id: userId }, order: 'created_at.desc' });
  return rows.map(fromRow);
}

async function getById(id) {
  const rows = await selectAll('orders', { filters: { id } });
  return rows[0] ? fromRow(rows[0]) : null;
}

// Folio consecutivo de 5 dígitos para la nota de venta (00001, 00002, ...).
async function getNextFolio() {
  const orders = await getAll();
  const highest = orders.reduce((max, order) => {
    const value = Number(order.folio);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);
  return String(highest + 1).padStart(5, '0');
}

async function create({ userId, customerName, customerPhone, customerAddress, customerRfc, items, notes }) {
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const folio = await getNextFolio();

  const row = await insertRow('orders', {
    id: generateId('PS'),
    folio,
    user_id: userId,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_address: normalizeAddress(customerAddress),
    customer_rfc: customerRfc || '',
    items,
    total,
    status: 'pendiente',
    notes: notes || '',
  });

  // Primer movimiento de la bitácora: el cliente creó el pedido.
  await orderLogService.add({
    orderId: row.id,
    previousStatus: null,
    newStatus: 'pendiente',
    changedBy: userId,
    changedByName: customerName,
    changedByRole: 'cliente',
  });

  return fromRow(row);
}

// actor es la sesión de quien hace el cambio: { id, name, role }.
// Devuelve { order, log } o null si el estatus no es válido.
async function updateStatus(id, newStatus, actor) {
  if (!STATUSES.includes(newStatus)) {
    return null;
  }
  const logRow = await callRpc('change_order_status', {
    p_order_id: id,
    p_new_status: newStatus,
    p_user_id: actor.id,
    p_user_name: actor.name,
    p_user_role: actor.role,
  });
  return { order: await getById(id), log: orderLogService.fromRow(logRow) };
}

function canCancel(order) {
  return order.status !== 'en_transito' && order.status !== 'terminado' && order.status !== 'cancelado';
}

async function cancel(id, actor) {
  const order = await getById(id);
  if (!order) {
    return { success: false, message: 'Pedido no encontrado.' };
  }
  if (!canCancel(order)) {
    return { success: false, message: 'El pedido no puede cancelarse en su estatus actual.' };
  }
  await updateStatus(id, 'cancelado', actor);
  return { success: true };
}

function buildWhatsappMessage(order, settings) {
  const totals = getTotals(order, settings.taxRate);
  const lines = [
    `Nuevo pedido ProShine: ${order.id}`,
    `Cliente: ${order.customerName}`,
    `Teléfono: ${order.customerPhone}`,
    `Entrega: ${formatAddress(order.customerAddress)}`,
    '',
    'Productos:',
    ...order.items.map((item) => `- ${item.name} (${item.unit}) x${item.quantity} = $${(item.unitPrice * item.quantity).toFixed(2)}`),
    '',
    `Subtotal: $${totals.subtotal.toFixed(2)}`,
    `IVA (${totals.taxRate}%): $${totals.tax.toFixed(2)}`,
    `Total: $${totals.total.toFixed(2)} MXN`,
  ];
  return lines.join('\n');
}

async function getWhatsappLink(order) {
  const settings = await settingsService.get();
  const message = encodeURIComponent(buildWhatsappMessage(order, settings));
  return `https://wa.me/${settings.whatsappNumber}?text=${message}`;
}

// Fecha con formato dd/mm/aaaa, hh:mm (24 horas, es-MX).
function formatStatusDate(isoDate) {
  return new Date(isoDate).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Solo dígitos; los clientes son de México, así que un número de 10 dígitos lleva prefijo 52.
function normalizePhone(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  return digits.length === 10 ? `52${digits}` : digits;
}

// El administrador no avisa de las cancelaciones.
function shouldNotifyCustomer(newStatus) {
  return newStatus !== 'cancelado';
}

function buildStatusChangeMessage(order, log) {
  const folio = order.folio || order.id;
  return `Hola ${order.customerName}, tu pedido ProShine ${folio} cambió a estatus *${STATUS_LABELS[log.newStatus]}* el ${formatStatusDate(log.changedAt)}.`;
}

function getCustomerStatusLink(order, log) {
  const message = encodeURIComponent(buildStatusChangeMessage(order, log));
  return `https://wa.me/${normalizePhone(order.customerPhone)}?text=${message}`;
}

async function getSalesSummary() {
  const orders = await getAll();
  const { taxRate } = await settingsService.get();
  const totalSales = orders
    .filter((order) => order.status !== 'cancelado')
    .reduce((sum, order) => sum + getTotals(order, taxRate).total, 0);

  const byStatus = STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((order) => order.status === status).length;
    return acc;
  }, {});

  return { totalSales, totalOrders: orders.length, byStatus };
}

export {
  STATUSES,
  STATUS_LABELS,
  getNextFolio,
  getAll,
  getByUser,
  getById,
  getTotals,
  create,
  updateStatus,
  canCancel,
  cancel,
  buildWhatsappMessage,
  getWhatsappLink,
  formatStatusDate,
  normalizePhone,
  shouldNotifyCustomer,
  buildStatusChangeMessage,
  getCustomerStatusLink,
  getSalesSummary,
};
