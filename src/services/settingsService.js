import { KEYS, readObject, writeObject } from './storage.js';

const DEFAULTS = {
  whatsappNumber: '',
  storeName: 'ProShine Chemicals',
  storeEmail: '',
  storePhone: '',
  storeAddress: '',
  storeCity: '',
  taxRate: 16,
  freeShippingThreshold: 1500,
};

function get() {
  return { ...DEFAULTS, ...(readObject(KEYS.SETTINGS) || {}) };
}

function save(settings) {
  const merged = {
    ...get(),
    ...settings,
    taxRate: Number(settings.taxRate) || 0,
    freeShippingThreshold: Number(settings.freeShippingThreshold) || 0,
  };
  writeObject(KEYS.SETTINGS, merged);
  return merged;
}

export { get, save };
