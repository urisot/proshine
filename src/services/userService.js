import { KEYS, readList, writeList, generateId } from './storage.js';
import { normalizeAddress } from './addressService.js';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeRfc(rfc) {
  return (rfc || '').trim().toUpperCase();
}

function getAll() {
  return readList(KEYS.USERS);
}

function isEmailTaken(email, excludeId = null) {
  const normalized = normalizeEmail(email);
  return getAll().some((user) => normalizeEmail(user.email) === normalized && user.id !== excludeId);
}

function create(data) {
  if (isEmailTaken(data.email)) {
    return { success: false, message: `El correo "${data.email}" ya está registrado.` };
  }

  const users = getAll();
  const newUser = {
    id: generateId('user'),
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    phone: data.phone.trim(),
    address: normalizeAddress(data.address),
    rfc: normalizeRfc(data.rfc),
    password: data.password,
    role: data.role,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeList(KEYS.USERS, users);
  return { success: true, user: newUser };
}

function update(id, data) {
  if (isEmailTaken(data.email, id)) {
    return { success: false, message: `El correo "${data.email}" ya está registrado en otra cuenta.` };
  }

  const users = getAll();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) {
    return { success: false, message: 'Usuario no encontrado.' };
  }

  users[index] = {
    ...users[index],
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    phone: data.phone.trim(),
    address: normalizeAddress(data.address),
    rfc: normalizeRfc(data.rfc),
    role: data.role,
    password: data.password ? data.password : users[index].password,
  };
  writeList(KEYS.USERS, users);
  return { success: true, user: users[index] };
}

function remove(id) {
  const users = getAll();
  const target = users.find((user) => user.id === id);

  if (target?.role === 'admin') {
    const adminCount = users.filter((user) => user.role === 'admin').length;
    if (adminCount <= 1) {
      return { success: false, message: 'No puedes eliminar al último administrador del sistema.' };
    }
  }

  writeList(KEYS.USERS, users.filter((user) => user.id !== id));
  return { success: true };
}

export { getAll, create, update, remove, isEmailTaken };
