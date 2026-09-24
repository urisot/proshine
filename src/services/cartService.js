import { KEYS, readObject, writeObject } from './storage.js';

// Los carritos se guardan por usuario: { "<userId>": [items], "invitado": [items] }.
// Así, al cerrar sesión el carrito no se pierde y se recupera al volver a entrar.
const GUEST_KEY = 'invitado';

function readAllCarts() {
  const stored = readObject(KEYS.CARTS);
  return stored && typeof stored === 'object' ? stored : {};
}

function getOwnerKey(userId) {
  return userId || GUEST_KEY;
}

function getCart(userId) {
  const cart = readAllCarts()[getOwnerKey(userId)];
  return Array.isArray(cart) ? cart : [];
}

function saveCart(userId, items) {
  const carts = readAllCarts();
  carts[getOwnerKey(userId)] = items;
  writeObject(KEYS.CARTS, carts);
}

function clearCart(userId) {
  saveCart(userId, []);
}

// Al iniciar sesión, lo que el visitante juntó sin cuenta se suma a su carrito guardado.
function mergeGuestCartInto(userId) {
  const guestItems = getCart(null);
  if (guestItems.length === 0) {
    return getCart(userId);
  }

  const merged = [...getCart(userId)];
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

  saveCart(userId, merged);
  clearCart(null);
  return merged;
}

export { getCart, saveCart, clearCart, mergeGuestCartInto };
