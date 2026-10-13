import { useEffect, useState } from 'react';
import * as orderLogService from '../../services/orderLogService.js';
import { STATUS_LABELS, formatStatusDate } from '../../services/orderService.js';
import Modal from './Modal.jsx';
import EmptyState from './EmptyState.jsx';

const ROLE_LABELS = {
  admin: 'Administrador',
  cliente: 'Cliente',
  sistema: 'Sistema',
};

// Bitácora de estatus de un pedido; la ven tanto el cliente como el administrador.
function OrderLogModal({ order, onClose }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!order) {
      return;
    }
    setIsLoading(true);
    setHasError(false);
    orderLogService
      .getByOrder(order.id)
      .then(setEntries)
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, [order]);

  return (
    <Modal
      isOpen={Boolean(order)}
      title="Historial de Estatus"
      subtitle={order ? `Pedido ${order.folio || order.id}` : ''}
      icon="history"
      onClose={onClose}
      maxWidthClass="max-w-xl"
    >
      {isLoading && <p className="font-body-md text-body-md text-on-surface-variant">Cargando historial...</p>}

      {!isLoading && hasError && (
        <p className="font-body-md text-body-md text-error">No se pudo cargar el historial. Intenta de nuevo.</p>
      )}

      {!isLoading && !hasError && entries.length === 0 && (
        <EmptyState
          icon="history"
          title="Sin movimientos"
          message="Este pedido aún no tiene cambios de estatus registrados."
        />
      )}

      {!isLoading && !hasError && entries.length > 0 && (
        <ol className="flex flex-col gap-space-sm">
          {entries.map((entry) => (
            <li key={entry.id} className="p-space-sm rounded-lg bg-surface-container-high flex flex-col gap-1">
              <span className="font-label-md text-label-md text-on-surface">
                {entry.previousStatus
                  ? `${STATUS_LABELS[entry.previousStatus]} → ${STATUS_LABELS[entry.newStatus]}`
                  : `Pedido creado (${STATUS_LABELS[entry.newStatus]})`}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {formatStatusDate(entry.changedAt)}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {entry.changedByName || 'Sin nombre'} • {ROLE_LABELS[entry.changedByRole] || 'Sin rol'}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}

export default OrderLogModal;
