import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';

const EMPTY_FORM = { name: '', description: '' };

const INPUT_CLASS = 'w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high';

function RoleForm({ isOpen, initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm(initialData ? { name: initialData.name, description: initialData.description } : EMPTY_FORM);
  }, [initialData, isOpen]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? 'Editar Rol' : 'Nuevo Rol'}
      subtitle="Nombre y descripción del rol"
      icon="shield"
      onClose={onClose}
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <div className="flex flex-col gap-1">
          <label htmlFor="role-name" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            Nombre del Rol
          </label>
          <input id="role-name" name="name" type="text" required value={form.name} onChange={handleChange} className={INPUT_CLASS} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="role-description" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            Descripción
          </label>
          <textarea
            id="role-description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-space-sm pt-space-sm">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-md text-label-md shadow-lg bevel-top"
          >
            Guardar Rol
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default RoleForm;
