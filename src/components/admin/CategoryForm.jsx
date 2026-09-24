import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';

const SECTORS = ['Hogar', 'Hoteles', 'Escuelas', 'Empresas', 'Industria'];

const EMPTY_FORM = { name: '', sector: 'Hogar', description: '' };

function CategoryForm({ isOpen, initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm(initialData ? { name: initialData.name, sector: initialData.sector, description: initialData.description } : EMPTY_FORM);
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
      title={initialData ? 'Editar Categoría' : 'Nueva Categoría'}
      icon="tag"
      onClose={onClose}
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <div className="flex flex-col gap-1">
          <label htmlFor="cat-name" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            Nombre de Categoría
          </label>
          <input
            id="cat-name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="cat-sector" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            Sector Destinado
          </label>
          <select
            id="cat-sector"
            name="sector"
            value={form.sector}
            onChange={handleChange}
            className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high cursor-pointer"
          >
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="cat-desc" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            Descripción
          </label>
          <textarea
            id="cat-desc"
            name="description"
            rows={2}
            value={form.description}
            onChange={handleChange}
            className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high"
          />
        </div>
        <div className="sticky bottom-0 flex flex-col sm:flex-row items-center justify-end gap-space-sm py-space-md bg-surface-container border-t border-surface-container-high">
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
            Guardar Categoría
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CategoryForm;
