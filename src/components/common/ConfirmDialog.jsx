import Modal from './Modal.jsx';

function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Confirmar', onConfirm, onCancel }) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      icon="alert"
      onClose={onCancel}
      maxWidthClass="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-space-sm">
          <button
            type="button"
            className="px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-space-lg py-space-sm rounded-lg bg-error-container text-on-error-container font-label-md text-label-md shadow-md bevel-top"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="font-body-md text-body-md text-on-surface-variant">{message}</p>
    </Modal>
  );
}

export default ConfirmDialog;
