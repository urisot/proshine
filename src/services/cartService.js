import { selectAll, insertRow, updateRows } from './supabaseClient.js';

// Los carritos se guardan por usuario en Supabase: owner_key = userId o "invitado".
// Así, al cerrar sesión el carrito no se pierde y se recupera al volver a entrar.
const GUEST_KEY = 'invitado';

function getOwnerKey(userId) {
  return userId || GUEST_KEY;
}

async function getCart(userId) {
  const rows = await selectAll('carts', { filters: { owner_key: getOwnerKey(userId) } });
  return rows[0]?.items || [];
}

async function saveCart(userId, items) {
  const ownerKey = getOwnerKey(userId);
  const [updated] = await updateRows('carts', { owner_key: ownerKey }, { items, updated_at: new Date().toISOString() });
  if (!updated) {
    await insertRow('carts', { owner_key: ownerKey, items });
  }
}

async function clearCart(userId) {
  await saveCart(userId, []);
}

// Al iniciar sesión, lo que el visitante juntó sin cuenta se suma a su carrito guardado.
async function mergeGuestCartInto(userId) {
  const guestItems = await getCart(null);
  if (guestItems.length === 0) {
    return getCart(userId);
  }

  const merged = [...(await getCart(userId))];
  guestItems.forEach((guestItem) => {
    const existingIndex = merged.findIndex(
      (item) => item.productId === guestItem.productId && item.unit === guestItem.unit
    );
    if (existingIndex === -1) {
      merged.push(guestItem);
      return;
    }
    merged[existingIndex] = {
      ...merged[existingIndex],
      quantity: merged[existingIndex].quantity + guestItem.quantity,
    };
  });

  await saveCart(userId, merged);
  await clearCart(null);
  return merged;
}

export { getCart, saveCart, clearCart, mergeGuestCartInto };
