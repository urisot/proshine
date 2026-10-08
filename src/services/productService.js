import { selectAll, insertRow, updateRows, deleteRows } from './supabaseClient.js';
import { generateId } from './idService.js';

function fromRow(row) {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    categoryId: row.category_id,
    unit: row.unit,
    priceRetail: Number(row.price_retail),
    priceWholesale: Number(row.price_wholesale),
    discountPercent: Number(row.discount_percent),
    stock: Number(row.stock),
    minStock: Number(row.min_stock),
    isHighDemand: row.is_high_demand,
    isOnPromo: row.is_on_promo,
    imageUrl: row.image_url,
  };
}

function toRow(data) {
  return {
    sku: data.sku.trim(),
    name: data.name.trim(),
    description: data.description.trim(),
    category_id: data.categoryId,
    unit: data.unit,
    price_retail: Number(data.priceRetail),
    price_wholesale: Number(data.priceWholesale),
    discount_percent: Number(data.discountPercent) || 0,
    stock: Number(data.stock),
    min_stock: Number(data.minStock),
    is_high_demand: Boolean(data.isHighDemand),
    is_on_promo: Boolean(data.isOnPromo),
    image_url: (data.imageUrl || '').trim(),
  };
}

async function getAll() {
  const rows = await selectAll('products', { order: 'name.asc' });
  return rows.map(fromRow);
}

async function getById(id) {
  const rows = await selectAll('products', { filters: { id } });
  return rows[0] ? fromRow(rows[0]) : null;
}

async function isSkuTaken(sku, excludeId = null) {
  const normalized = sku.trim().toLowerCase();
  const products = await getAll();
  return products.some(
    (product) => product.sku.trim().toLowerCase() === normalized && product.id !== excludeId
  );
}

async function create(data) {
  if (await isSkuTaken(data.sku)) {
    return { success: false, message: `El SKU "${data.sku}" ya existe en otro producto.` };
  }

  const row = await insertRow('products', { id: generateId('prod'), ...toRow(data) });
  return { success: true, product: fromRow(row) };
}

async function update(id, data) {
  if (await isSkuTaken(data.sku, id)) {
    return { success: false, message: `El SKU "${data.sku}" ya existe en otro producto.` };
  }

  const [row] = await updateRows('products', { id }, toRow(data));
  if (!row) {
    return { success: false, message: 'Producto no encontrado.' };
  }
  return { success: true, product: fromRow(row) };
}

async function remove(id) {
  await deleteRows('products', { id });
}

function getStockLevel(product) {
  if (product.stock <= product.minStock / 2) {
    return 'Crítico';
  }
  if (product.stock <= product.minStock) {
    return 'Bajo';
  }
  return 'Óptimo';
}

export { getAll, getById, create, update, remove, isSkuTaken, getStockLevel };
