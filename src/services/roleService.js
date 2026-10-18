import { selectAll, insertRow, updateRows, deleteRows } from './supabaseClient.js';
import { getAssignableKeys, normalizePermissions } from './menuCatalog.js';

const ADMIN_ROLE = 'admin';
const DEFAULT_ROLE = 'cliente';

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isSystem: row.is_system,
    createdAt: row.created_at,
  };
}

// La clave del rol se genera una vez desde el nombre y no cambia aunque se renombre.
function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getAll() {
  const rows = await selectAll('roles', { order: 'created_at.asc' });
  return rows.map(fromRow);
}

// El admin siempre tiene todas las opciones; sus exclusivas se resuelven en hasPermission.
async function getPermissions(roleId) {
  if (roleId === ADMIN_ROLE) {
    return getAssignableKeys();
  }
  const rows = await selectAll('role_permissions', { filters: { role_id: roleId } });
  return rows.map((row) => row.permission_key);
}

async function savePermissions(roleId, keys) {
  await deleteRows('role_permissions', { role_id: roleId });
  for (const key of normalizePermissions(keys)) {
    await insertRow('role_permissions', { role_id: roleId, permission_key: key });
  }
}

async function isNameTaken(name, excludeId = null) {
  const normalized = name.trim().toLowerCase();
  const roles = await getAll();
  return roles.some((role) => role.name.trim().toLowerCase() === normalized && role.id !== excludeId);
}

async function create(data) {
  const name = data.name.trim();
  const id = slugify(name);
  if (!id) {
    return { success: false, message: 'El nombre del rol no es válido.' };
  }
  if (await isNameTaken(name)) {
    return { success: false, message: `Ya existe un rol llamado "${name}".` };
  }
  const roles = await getAll();
  if (roles.some((role) => role.id === id)) {
    return { success: false, message: `Ya existe un rol con la clave "${id}".` };
  }

  const row = await insertRow('roles', { id, name, description: data.description.trim(), is_system: false });
  return { success: true, role: fromRow(row) };
}

async function update(id, data) {
  const name = data.name.trim();
  if (await isNameTaken(name, id)) {
    return { success: false, message: `Ya existe un rol llamado "${name}".` };
  }
  const [row] = await updateRows('roles', { id }, { name, description: data.description.trim() });
  if (!row) {
    return { success: false, message: 'Rol no encontrado.' };
  }
  return { success: true, role: fromRow(row) };
}

// Los usuarios con el rol eliminado pasan a "cliente". admin y cliente no se pueden eliminar.
async function remove(id) {
  const roles = await getAll();
  const target = roles.find((role) => role.id === id);
  if (!target) {
    return { success: false, message: 'Rol no encontrado.' };
  }
  if (target.isSystem) {
    return { success: false, message: `El rol "${target.name}" es del sistema y no se puede eliminar.` };
  }

  const reassigned = await updateRows('users', { role: id }, { role: DEFAULT_ROLE });
  await deleteRows('roles', { id });
  return { success: true, reassignedCount: reassigned.length };
}

export { ADMIN_ROLE, getAll, getPermissions, savePermissions, create, update, remove };
