import { KEYS, readList, writeList, readObject, writeObject, generateId } from './storage.js';
import { normalizeAddress, formatAddress } from './addressService.js';
import { get as getSettings } from './settingsService.js';

const STATUSES = ['pendiente', 'confirmado', 'en_transito', 'terminado', 'cancelado'];

function getAll() {
  return readList(KEYS.ORDERS);
}

// order.total guarda el subtotal (precios + IVA). Aquí se suma el IVA configurado,
// igual que en el carrito, para que la nota y la pantalla muestren el mismo importe.
function getTotals(order) {
  const { taxRate } = getSettings();
  const subtotal = order.total;
  const tax = subtotal * (taxRate / 100);
  return { subtotal, taxRate, tax, total: subtotal + tax };
}

function getByUser(userId) {
  return getAll().filter((order) => order.userId === userId);
}

function getById(id) {
  return getAll().find((order) => order.id === id) || null;
}

// Folio consecutivo de 5 dígitos para la nota de venta (00001, 00002, ...).
function getNextFolio() {
  const highest = getAll().reduce((max, order) => {
    const value = Number(order.folio);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);
  return String(highest + 1).padStart(5, '0');
}

function create({ userId, customerName, customerPhone, customerAddress, customerRfc, items, notes }) {
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const newOrder = {
    id: generateId('PS'),
    folio: getNextFolio(),
    userId,
    customerName,
    customerPhone,
    customerAddress: normalizeAddress(customerAddress),
    customerRfc: customerRfc || '',
    items,
    total,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
    notes: notes || '',
  };

  const orders = getAll();
  orders.unshift(newOrder);
  writeList(KEYS.ORDERS, orders);

  return newOrder;
}

function updateStatus(id, newStatus) {
  if (!STATUSES.includes(newStatus)) {
    return null;
  }
  const orders = getAll();
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) {
    return null;
  }
  orders[index] = { ...orders[index], status: newStatus };
  writeList(KEYS.ORDERS, orders);
  return orders[index];
}

function canCancel(order) {
  return order.status !== 'en_transito' && order.status !== 'terminado' && order.status !== 'cancelado';
}

function cancel(id) {
  const order = getById(id);
  if (!order) {
    return { success: false, message: 'Pedido no encontrado.' };
  }
  if (!canCancel(order)) {
    return { success: false, message: 'El pedido no puede cancelarse en su estatus actual.' };
  }
  updateStatus(id, 'cancelado');
  return { success: true };
}

function getWhatsappSettings() {
  return readObject(KEYS.SETTINGS) || { whatsappNumber: '' };
}

function setWhatsappNumber(number) {
  writeObject(KEYS.SETTINGS, { whatsappNumber: number.trim() });
}

function buildWhatsappMessage(order) {
  const totals = getTotals(order);
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

function getWhatsappLink(order) {
  const { whatsappNumber } = getWhatsappSettings();
  const message = encodeURIComponent(buildWhatsappMessage(order));
  return `https://wa.me/${whatsappNumber}?text=${message}`;
}

function getSalesSummary() {
  const orders = getAll();
  const totalSales = orders
    .filter((order) => order.status !== 'cancelado')
    .reduce((sum, order) => sum + getTotals(order).total, 0);

  const byStatus = STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((order) => order.status === status).length;
    return acc;
  }, {});

  return { totalSales, totalOrders: orders.length, byStatus };
}

export {
  STATUSES,
  getNextFolio,
  getAll,
  getByUser,
  getById,
  getTotals,
  create,
  updateStatus,
  canCancel,
  cancel,
  getWhatsappSettings,
  setWhatsappNumber,
  buildWhatsappMessage,
  getWhatsappLink,
  getSalesSummary,
};
