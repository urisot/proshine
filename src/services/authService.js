import { KEYS, readList, writeList, readObject, writeObject, removeKey, generateId } from './storage.js';
import { normalizeAddress } from './addressService.js';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function findUserByEmail(email) {
  const users = readList(KEYS.USERS);
  const normalized = normalizeEmail(email);
  return users.find((user) => normalizeEmail(user.email) === normalized) || null;
}

function register({ name, phone, email, address, rfc, password }) {
  const existing = findUserByEmail(email);
  if (existing) {
    return { success: false, message: 'Ya existe una cuenta registrada con este correo electrónico.' };
  }

  const newUser = {
    id: generateId('user'),
    name: name.trim(),
    phone: phone.trim(),
    email: normalizeEmail(email),
    address: normalizeAddress(address),
    rfc: (rfc || '').trim().toUpperCase(),
    password,
    role: 'cliente',
    createdAt: new Date().toISOString(),
  };

  const users = readList(KEYS.USERS);
  users.push(newUser);
  writeList(KEYS.USERS, users);

  const session = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  writeObject(KEYS.SESSION, session);

  return { success: true, user: newUser };
}

function login({ email, password }) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return { success: false, message: 'Correo o contraseña incorrectos.' };
  }

  const session = { id: user.id, name: user.name, email: user.email, role: user.role };
  writeObject(KEYS.SESSION, session);

  return { success: true, user };
}

function logout() {
  removeKey(KEYS.SESSION);
}

function getSession() {
  return readObject(KEYS.SESSION);
}

export { register, login, logout, getSession };
