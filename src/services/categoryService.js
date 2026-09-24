import { KEYS, readList, writeList, generateId } from './storage.js';

function getAll() {
  return readList(KEYS.CATEGORIES);
}

function getById(id) {
  return getAll().find((category) => category.id === id) || null;
}

function create({ name, sector, description }) {
  const categories = getAll();
  const newCategory = {
    id: generateId('cat'),
    name: name.trim(),
    sector,
    description: description.trim(),
  };
  categories.push(newCategory);
  writeList(KEYS.CATEGORIES, categories);
  return newCategory;
}

function update(id, { name, sector, description }) {
  const categories = getAll();
  const index = categories.findIndex((category) => category.id === id);
  if (index === -1) {
    return null;
  }
  categories[index] = { ...categories[index], name: name.trim(), sector, description: description.trim() };
  writeList(KEYS.CATEGORIES, categories);
  return categories[index];
}

function remove(id) {
  const categories = getAll().filter((category) => category.id !== id);
  writeList(KEYS.CATEGORIES, categories);
}

export { getAll, getById, create, update, remove };
