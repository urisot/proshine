// Cliente mínimo para la API REST de Supabase (PostgREST), sin dependencias externas.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function buildQuery(filters) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([column, value]) => {
    params.append(column, `eq.${value}`);
  });
  return params.toString();
}

async function request(path, { method = 'GET', body, headers = {}, query = '' } = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}${query ? `?${query}` : ''}`;
  const response = await fetch(url, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Error de Supabase (${response.status}) en ${path}.`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function selectAll(table, { select = '*', filters, order } = {}) {
  const params = new URLSearchParams();
  params.set('select', select);
  Object.entries(filters || {}).forEach(([column, value]) => {
    params.append(column, `eq.${value}`);
  });
  if (order) {
    params.set('order', order);
  }
  return request(table, { query: params.toString() });
}

async function insertRow(table, row) {
  const [created] = await request(table, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: row,
  });
  return created;
}

async function updateRows(table, filters, patch) {
  const rows = await request(table, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    query: buildQuery(filters),
    body: patch,
  });
  return rows;
}

function deleteRows(table, filters) {
  return request(table, { method: 'DELETE', query: buildQuery(filters) });
}

export { selectAll, insertRow, updateRows, deleteRows };
