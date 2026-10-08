import { selectAll, insertRow, updateRows, deleteRows } from './supabaseClient.js';
import { generateId } from './idService.js';

async function getAll() {
  return selectAll('categories', { order: 'name.asc' });
}

async function getById(id) {
  const [category] = await selectAll('categories', { filters: { id } });
  return category || null;
}

async function create({ name, sector, description }) {
  return insertRow('categories', {
    id: generateId('cat'),
    name: name.trim(),
    sector,
    description: description.trim(),
  });
}

async function update(id, { name, sector, description }) {
  const [updated] = await updateRows(
    'categories',
    { id },
    { name: name.trim(), sector, description: description.trim() }
  );
  return updated || null;
}

async function remove(id) {
  await deleteRows('categories', { id });
}

export { getAll, getById, create, update, remove };
