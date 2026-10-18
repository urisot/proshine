import { selectAll, insertRow } from './supabaseClient.js';
import { readSession, writeSession, clearSession } from './storage.js';
import { generateId } from './idService.js';
import { normalizeAddress } from './addressService.js';
import * as roleService from './roleService.js';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

// La sesión incluye las opciones de menú del rol para proteger rutas sin consultar cada vez.
async function buildSession(user) {
  const permissions = await roleService.getPermissions(user.role);
  return { id: user.id, name: user.name, email: user.email, role: user.role, permissions };
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

  const session = await buildSession(row);
  writeSession(session);

  return { success: true, user: row, session };
}

async function login({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user || user.password !== password) {
    return { success: false, message: 'Correo o contraseña incorrectos.' };
  }

  const session = await buildSession(user);
  writeSession(session);

  return { success: true, user, session };
}

// Vuelve a leer rol y permisos del usuario, por si un administrador los cambió con la sesión abierta.
async function refreshSession() {
  const current = readSession();
  if (!current) {
    return null;
  }
  const rows = await selectAll('users', { filters: { id: current.id } });
  if (!rows[0]) {
    clearSession();
    return null;
  }
  const session = await buildSession(rows[0]);
  writeSession(session);
  return session;
}

function logout() {
  clearSession();
}

function getSession() {
  return readSession();
}

export { register, login, logout, getSession, refreshSession };
