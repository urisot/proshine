import { selectAll, insertRow } from './supabaseClient.js';

function fromRow(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    changedBy: row.changed_by,
    changedByName: row.changed_by_name,
    changedByRole: row.changed_by_role,
    changedAt: row.changed_at,
  };
}

async function getByOrder(orderId) {
  const rows = await selectAll('order_log', { filters: { order_id: orderId }, order: 'changed_at.desc' });
  return rows.map(fromRow);
}

async function add({ orderId, previousStatus, newStatus, changedBy, changedByName, changedByRole }) {
  const row = await insertRow('order_log', {
    order_id: orderId,
    previous_status: previousStatus,
    new_status: newStatus,
    changed_by: changedBy,
    changed_by_name: changedByName,
    changed_by_role: changedByRole,
  });
  return fromRow(row);
}

export { fromRow, getByOrder, add };
