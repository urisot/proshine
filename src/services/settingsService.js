import { selectAll, updateRows } from './supabaseClient.js';

function fromRow(row) {
  return {
    whatsappNumber: row.whatsapp_number,
    storeName: row.store_name,
    storeEmail: row.store_email,
    storePhone: row.store_phone,
    storeAddress: row.store_address,
    storeCity: row.store_city,
    taxRate: Number(row.tax_rate),
    freeShippingThreshold: Number(row.free_shipping_threshold),
  };
}

async function get() {
  const [row] = await selectAll('settings', { filters: { id: 1 } });
  return fromRow(row);
}

async function save(settings) {
  const current = await get();
  const merged = { ...current, ...settings };
  const [row] = await updateRows(
    'settings',
    { id: 1 },
    {
      whatsapp_number: merged.whatsappNumber,
      store_name: merged.storeName,
      store_email: merged.storeEmail,
      store_phone: merged.storePhone,
      store_address: merged.storeAddress,
      store_city: merged.storeCity,
      tax_rate: Number(merged.taxRate) || 0,
      free_shipping_threshold: Number(merged.freeShippingThreshold) || 0,
    }
  );
  return fromRow(row);
}

export { get, save };
