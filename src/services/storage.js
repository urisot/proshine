const KEYS = {
  USERS: 'proshine_users',
  SESSION: 'proshine_session',
  CATEGORIES: 'proshine_categories',
  PRODUCTS: 'proshine_products',
  ORDERS: 'proshine_orders',
  SETTINGS: 'proshine_settings',
  SEED_VERSION: 'proshine_seed_version',
  CARTS: 'proshine_carts',
};

function readList(key) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function readObject(key) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function writeObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeKey(key) {
  localStorage.removeItem(key);
}

function generateId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${random}`;
}

export { KEYS, readList, writeList, readObject, writeObject, removeKey, generateId };
