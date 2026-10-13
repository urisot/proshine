import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import * as orderService from '../../services/orderService.js';

// Lista de clientes a avisar por WhatsApp tras un cambio de estatus (uno o varios pedidos).
// El administrador envía cada mensaje manualmente; se marca como enviado al abrir el enlace.
function StatusNotificationModal({ notifications, onClose }) {
  const [sentIds, setSentIds] = useState([]);
  const isOpen = notifications.length > 0;

  useEffect(() => {
    setSentIds([]);
  }, [notifications]);

  function markAsSent(orderId) {
    setSentIds((current) => [...current, orderId]);
  }

  const pendingCount = notifications.length - sentIds.length;

  return (
    <Modal
      isOpen={isOpen}
      title="Notificar a los clientes"
      subtitle={`${sentIds.length} de ${notifications.length} avisos enviados`}
      icon="chat"
      onClose={onClose}
      maxWidthClass="max-w-xl"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-space-lg py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg transition-colors"
          >
            {pendingCount > 0 ? 'Ahora no' : 'Listo'}
          </button>
        </div>
      }
    >
      <p className="font-body-md text-body-md text-on-surface-variant">
        Avisa a cada cliente por WhatsApp. El mensaje incluye el nuevo estatus y la fecha del cambio.
      </p>
      <ul className="flex flex-col gap-space-xs">
        {notifications.map(({ order, log }) => {
          const isSent = sentIds.includes(order.id);
          return (
            <li
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm p-space-sm rounded-lg bg-surface-container-high"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-title-md text-title-md text-on-surface truncate">{order.customerName}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {order.folio || order.id} • {orderService.STATUS_LABELS[log.newStatus]} •{' '}
                  {orderService.formatStatusDate(log.changedAt)}
                </span>
              </div>
              {!order.customerPhone && (
                <span className="font-label-sm text-label-sm text-outline uppercase">Sin teléfono</span>
              )}
              {order.customerPhone && isSent && (
                <span className="inline-flex items-center gap-1.5 font-label-md text-label-md text-secondary">
                  <Icon name="check" className="w-4 h-4" />
                  Enviado
                </span>
              )}
              {order.customerPhone && !isSent && (
                <a
                  href={orderService.getCustomerStatusLink(order, log)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markAsSent(order.id)}
                  className="shrink-0 flex items-center justify-center gap-space-xs px-space-md py-space-xs rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-md text-label-md shadow-lg bevel-top"
                >
                  <Icon name="chat" className="w-4 h-4" />
                  Enviar WhatsApp
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

export default StatusNotificationModal;
