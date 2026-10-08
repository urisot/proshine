import { selectAll, insertRow, updateRows, deleteRows } from './supabaseClient.js';
import { generateId } from './idService.js';
import { normalizeAddress } from './addressService.js';

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    rfc: row.rfc,
    password: row.password,
    role: row.role,
    createdAt: row.created_at,
  };
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeRfc(rfc) {
  return (rfc || '').trim().toUpperCase();
}

async function getAll() {
  const rows = await selectAll('users', { order: 'created_at.asc' });
  return rows.map(fromRow);
}

async function isEmailTaken(email, excludeId = null) {
  const normalized = normalizeEmail(email);
  const users = await getAll();
  return users.some((user) => normalizeEmail(user.email) === normalized && user.id !== excludeId);
}

async function create(data) {
  if (await isEmailTaken(data.email)) {
    return { success: false, message: `El correo "${data.email}" ya está registrado.` };
  }

  const row = await insertRow('users', {
    id: generateId('user'),
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    phone: data.phone.trim(),
    address: normalizeAddress(data.address),
    rfc: normalizeRfc(data.rfc),
    password: data.password,
    role: data.role,
  });
  return { success: true, user: fromRow(row) };
}

async function update(id, data) {
  if (await isEmailTaken(data.email, id)) {
    return { success: false, message: `El correo "${data.email}" ya está registrado en otra cuenta.` };
  }

  const patch = {
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    phone: data.phone.trim(),
    address: normalizeAddress(data.address),
    rfc: normalizeRfc(data.rfc),
    role: data.role,
  };
  if (data.password) {
    patch.password = data.password;
  }

  const [row] = await updateRows('users', { id }, patch);
  if (!row) {
    return { success: false, message: 'Usuario no encontrado.' };
  }
  return { success: true, user: fromRow(row) };
}

async function remove(id) {
  const users = await getAll();
  const target = users.find((user) => user.id === id);

  if (target?.role === 'admin') {
    const adminCount = users.filter((user) => user.role === 'admin').length;
    if (adminCount <= 1) {
      return { success: false, message: 'No puedes eliminar al último administrador del sistema.' };
    }
  }

  await deleteRows('users', { id });
  return { success: true };
}

export { getAll, create, update, remove, isEmailTaken };
