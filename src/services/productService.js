import { KEYS, readList, writeList, generateId } from './storage.js';

function getAll() {
  return readList(KEYS.PRODUCTS);
}

function getById(id) {
  return getAll().find((product) => product.id === id) || null;
}

function isSkuTaken(sku, excludeId = null) {
  const normalized = sku.trim().toLowerCase();
  return getAll().some(
    (product) => product.sku.trim().toLowerCase() === normalized && product.id !== excludeId
  );
}

function create(data) {
  if (isSkuTaken(data.sku)) {
    return { success: false, message: `El SKU "${data.sku}" ya existe en otro producto.` };
  }

  const products = getAll();
  const newProduct = {
    id: generateId('prod'),
    sku: data.sku.trim(),
    name: data.name.trim(),
    description: data.description.trim(),
    categoryId: data.categoryId,
    unit: data.unit,
    priceRetail: Number(data.priceRetail),
    priceWholesale: Number(data.priceWholesale),
    discountPercent: Number(data.discountPercent) || 0,
    stock: Number(data.stock),
    minStock: Number(data.minStock),
    isHighDemand: Boolean(data.isHighDemand),
    isOnPromo: Boolean(data.isOnPromo),
    imageUrl: (data.imageUrl || '').trim(),
  };
  products.push(newProduct);
  writeList(KEYS.PRODUCTS, products);
  return { success: true, product: newProduct };
}

function update(id, data) {
  if (isSkuTaken(data.sku, id)) {
    return { success: false, message: `El SKU "${data.sku}" ya existe en otro producto.` };
  }

  const products = getAll();
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) {
    return { success: false, message: 'Producto no encontrado.' };
  }

  products[index] = {
    ...products[index],
    sku: data.sku.trim(),
    name: data.name.trim(),
    description: data.description.trim(),
    categoryId: data.categoryId,
    unit: data.unit,
    priceRetail: Number(data.priceRetail),
    priceWholesale: Number(data.priceWholesale),
    discountPercent: Number(data.discountPercent) || 0,
    stock: Number(data.stock),
    minStock: Number(data.minStock),
    isHighDemand: Boolean(data.isHighDemand),
    isOnPromo: Boolean(data.isOnPromo),
    imageUrl: (data.imageUrl || '').trim(),
  };
  writeList(KEYS.PRODUCTS, products);
  return { success: true, product: products[index] };
}

function remove(id) {
  const products = getAll().filter((product) => product.id !== id);
  writeList(KEYS.PRODUCTS, products);
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
