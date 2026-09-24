import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';

const UNITS = ['Porrón 20 L', 'Galón 3.78 L', 'Litro 1 L', 'Tambo 200 L', 'Pieza Unitaria'];

const EMPTY_FORM = {
  sku: '',
  name: '',
  description: '',
  categoryId: '',
  unit: UNITS[0],
  priceRetail: '',
  priceWholesale: '',
  discountPercent: '',
  stock: '',
  minStock: '',
  isHighDemand: false,
  isOnPromo: false,
  imageUrl: '',
};

function ProductForm({ isOpen, initialData, categories, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData });
    } else {
      setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id || '' });
    }
  }, [initialData, isOpen, categories]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? 'Editar Producto' : 'Nuevo Producto'}
      subtitle="Completa los campos técnicos y comerciales del catálogo"
      icon="flask"
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="md:col-span-2 flex flex-col gap-1">
            <label htmlFor="form-name" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Nombre Comercial del Producto
            </label>
            <input
              id="form-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="form-sku" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Código SKU
            </label>
            <input
              id="form-sku"
              name="sku"
              type="text"
              required
              value={form.sku}
              onChange={handleChange}
              placeholder="PS-DEG-01"
              className="w-full px-space-md py-space-sm rounded-lg bg-surface text-secondary font-bold focus:outline-none focus:bg-surface-container-high"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="form-desc" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            Descripción
          </label>
          <textarea
            id="form-desc"
            name="description"
            rows={2}
            value={form.description}
            onChange={handleChange}
            className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high"
          />
        </div>

        <div className="flex items-start gap-space-md">
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="form-image" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              URL de Imagen del Producto
            </label>
            <input
              id="form-image"
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/foto-producto.jpg"
              className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high"
            />
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Pega la dirección de una imagen pública. Se muestra en el catálogo.
            </span>
          </div>
          <div className="w-24 h-24 rounded-lg bg-surface-container-lowest flex items-center justify-center overflow-hidden shrink-0">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
            ) : (
              <Icon name="flask" className="w-8 h-8 text-outline" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1">
            <label htmlFor="form-category" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Categoría Vinculada
            </label>
            <select
              id="form-category"
              name="categoryId"
              required
              value={form.categoryId}
              onChange={handleChange}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high cursor-pointer"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="form-unit" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Presentación / Envase
            </label>
            <select
              id="form-unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high cursor-pointer"
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md bg-surface-container-low p-space-md rounded-lg">
          <div className="flex flex-col gap-1">
            <label htmlFor="form-price-regular" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Precio Menudeo ($)
            </label>
            <input
              id="form-price-regular"
              name="priceRetail"
              type="number"
              step="0.01"
              required
              value={form.priceRetail}
              onChange={handleChange}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="form-price-wholesale" className="font-label-sm text-label-sm text-secondary uppercase">
              Precio Mayoreo ($)
            </label>
            <input
              id="form-price-wholesale"
              name="priceWholesale"
              type="number"
              step="0.01"
              required
              value={form.priceWholesale}
              onChange={handleChange}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface text-secondary font-bold focus:outline-none focus:bg-surface-container-high"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="form-discount" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              % Descuento Oferta
            </label>
            <input
              id="form-discount"
              name="discountPercent"
              type="number"
              min="0"
              max="100"
              value={form.discountPercent}
              onChange={handleChange}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1">
            <label htmlFor="form-stock" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Stock Actual
            </label>
            <input
              id="form-stock"
              name="stock"
              type="number"
              required
              value={form.stock}
              onChange={handleChange}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="form-min-stock" className="font-label-sm text-label-sm text-error uppercase">
              Nivel Mínimo Alerta (Stock Crítico)
            </label>
            <input
              id="form-min-stock"
              name="minStock"
              type="number"
              required
              value={form.minStock}
              onChange={handleChange}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container-high p-space-md rounded-lg">
          <label className="flex items-center gap-space-sm cursor-pointer select-none">
            <input type="checkbox" name="isOnPromo" checked={form.isOnPromo} onChange={handleChange} className="w-4 h-4 rounded" />
            <span className="font-title-md text-title-md text-on-surface">Destacar en Promociones</span>
          </label>
          <label className="flex items-center gap-space-sm cursor-pointer select-none">
            <input type="checkbox" name="isHighDemand" checked={form.isHighDemand} onChange={handleChange} className="w-4 h-4 rounded" />
            <span className="font-title-md text-title-md text-on-surface">Producto de Alta Demanda</span>
          </label>
        </div>

        {/* sticky mantiene las acciones visibles aunque el formulario sea largo. */}
        <div className="sticky bottom-0 flex flex-col sm:flex-row items-center justify-end gap-space-sm py-space-md bg-surface-container border-t border-surface-container-high">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-space-lg py-space-sm rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-lg text-label-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-lg text-label-lg shadow-lg bevel-top"
          >
            <Icon name="check" className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductForm;
