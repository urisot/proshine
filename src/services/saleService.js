import { selectAll, callRpc } from './supabaseClient.js';
import { normalizeAddress } from './addressService.js';
import { generateId } from './idService.js';

const PAYMENT_METHODS = ['efectivo', 'tarjeta', 'spei', 'credito'];

const PAYMENT_LABELS = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  spei: 'SPEI / Transferencia',
  credito: 'Crédito',
};

const GENERAL_CUSTOMER_NAME = 'Público en General';

// Además de los campos de la venta, "total" guarda el subtotal (igual que en pedidos)
// para que printRemision pueda imprimir la venta como nota.
function fromRow(row) {
  const subtotal = Number(row.subtotal);
  return {
    id: row.id,
    folio: row.folio,
    userId: row.user_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerRfc: row.customer_rfc,
    customerAddress: row.customer_address,
    items: row.items,
    subtotal,
    discount: Number(row.discount),
    taxRate: Number(row.tax_rate),
    tax: Number(row.tax),
    grandTotal: Number(row.total),
    total: subtotal,
    paymentMethod: row.payment_method,
    cashReceived: row.cash_received === null ? null : Number(row.cash_received),
    changeGiven: row.change_given === null ? null : Number(row.change_given),
    soldBy: row.sold_by,
    soldByName: row.sold_by_name,
    createdAt: row.created_at,
    notes: `Venta de mostrador • Pago: ${PAYMENT_LABELS[row.payment_method]}`,
  };
}

async function getAll() {
  const rows = await selectAll('sales', { order: 'created_at.desc' });
  return rows.map(fromRow);
}

// Precio de menudeo con el descuento del producto (misma fórmula que el catálogo).
function getUnitPrice(product) {
  return product.discountPercent
    ? product.priceRetail - (product.priceRetail * product.discountPercent) / 100
    : product.priceRetail;
}

function createItem(product, quantity = 1) {
  return {
    productId: product.id,
    sku: product.sku,
    name: product.name,
    unit: product.unit,
    quantity,
    listPrice: product.priceRetail,
    discountPercent: product.discountPercent || 0,
    unitPrice: getUnitPrice(product),
  };
}

function roundMoney(amount) {
  return Math.round(amount * 100) / 100;
}

// El IVA se suma al subtotal, igual que en orderService.getTotals.
function calculateTotals(items, taxRate) {
  const grossSubtotal = items.reduce((sum, item) => sum + item.listPrice * item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = subtotal * (taxRate / 100);
  return {
    grossSubtotal: roundMoney(grossSubtotal),
    discount: roundMoney(grossSubtotal - subtotal),
    subtotal: roundMoney(subtotal),
    taxRate,
    tax: roundMoney(tax),
    total: roundMoney(subtotal + tax),
  };
}

function getChange(total, cashReceived) {
  return roundMoney((Number(cashReceived) || 0) - total);
}

// customer es un usuario de userService o null (Público en General).
// seller es la sesión del administrador: { id, name }.
// Devuelve { success, sale } o { success: false, message }.
async function register({ customer, items, paymentMethod, cashReceived, taxRate, seller }) {
  if (items.length === 0) {
    return { success: false, message: 'Agrega al menos un producto a la venta.' };
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return { success: false, message: 'Selecciona un método de pago válido.' };
  }

  const totals = calculateTotals(items, taxRate);
  const isCash = paymentMethod === 'efectivo';
  if (isCash && getChange(totals.total, cashReceived) < 0) {
    return { success: false, message: 'El efectivo recibido no cubre el total de la venta.' };
  }

  const row = await callRpc('register_sale', {
    p_sale: {
      id: generateId('VTA'),
      userId: customer?.id || '',
      customerName: customer?.name || GENERAL_CUSTOMER_NAME,
      customerPhone: customer?.phone || '',
      customerRfc: customer?.rfc || '',
      customerAddress: customer ? normalizeAddress(customer.address) : null,
      items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxRate: totals.taxRate,
      tax: totals.tax,
      total: totals.total,
      paymentMethod,
      cashReceived: isCash ? Number(cashReceived) : null,
      changeGiven: isCash ? getChange(totals.total, cashReceived) : null,
      soldBy: seller?.id || '',
      soldByName: seller?.name || '',
    },
  });

  return { success: true, sale: fromRow(row) };
}

export {
  PAYMENT_METHODS,
  PAYMENT_LABELS,
  GENERAL_CUSTOMER_NAME,
  getAll,
  getUnitPrice,
  createItem,
  calculateTotals,
  getChange,
  register,
};
