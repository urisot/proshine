import { selectAll, insertRow } from './supabaseClient.js';
import { readSession, writeSession, clearSession } from './storage.js';
import { generateId } from './idService.js';
import { normalizeAddress } from './addressService.js';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function findUserByEmail(email) {
  const rows = await selectAll('users', { filters: { email: normalizeEmail(email) } });
  return rows[0] || null;
}

async function register({ name, phone, email, address, rfc, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    return { success: false, message: 'Ya existe una cuenta registrada con este correo electrónico.' };
  }

  const row = await insertRow('users', {
    id: generateId('user'),
    name: name.trim(),
    phone: phone.trim(),
    email: normalizeEmail(email),
    address: normalizeAddress(address),
    rfc: (rfc || '').trim().toUpperCase(),
    password,
    role: 'cliente',
  });

  const session = { id: row.id, name: row.name, email: row.email, role: row.role };
  writeSession(session);

  return { success: true, user: row };
}

async function login({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user || user.password !== password) {
    return { success: false, message: 'Correo o contraseña incorrectos.' };
  }

  const session = { id: user.id, name: user.name, email: user.email, role: user.role };
  writeSession(session);

  return { success: true, user };
}

function logout() {
  clearSession();
}

function getSession() {
  return readSession();
}

export { register, login, logout, getSession };
