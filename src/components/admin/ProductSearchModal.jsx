import { useEffect, useRef, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import { getStockLevel } from '../../services/productService.js';
import { getUnitPrice } from '../../services/saleService.js';

const PILL_ACTIVE = 'bg-primary-container text-on-primary-container';
const PILL_IDLE = 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant';

function matchesStock(product, stockFilter) {
  if (stockFilter === 'inmediato') {
    return product.stock > 50;
  }
  if (stockFilter === 'bajo') {
    return getStockLevel(product) !== 'Óptimo';
  }
  return true;
}

function ProductSearchModal({ isOpen, products, categories, onClose, onAdd }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryId, setCategoryId] = useState('todas');
  const [stockFilter, setStockFilter] = useState('todos');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const term = searchTerm.trim().toLowerCase();
  const results = products.filter((product) => {
    const matchesText =
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      (product.description || '').toLowerCase().includes(term);
    const matchesCategory = categoryId === 'todas' || product.categoryId === categoryId;
    return matchesText && matchesCategory && matchesStock(product, stockFilter);
  });

  return (
    <Modal
      isOpen={isOpen}
      title="Búsqueda Avanzada de Productos [F2]"
      subtitle="Filtra por nombre, SKU, categoría y disponibilidad en almacén."
      icon="filter"
      onClose={onClose}
      maxWidthClass="max-w-5xl"
      footer={
        <div className="flex items-center justify-between gap-space-sm">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Presiona [ESC] para cerrar la búsqueda.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>
      }
    >
      <div className="relative flex items-center">
        <Icon name="search" className="absolute left-4 w-5 h-5 text-secondary pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por nombre, SKU o descripción..."
          className="w-full pl-12 pr-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary-container"
        />
      </div>

      <div className="flex flex-wrap items-center gap-space-xs">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mr-1">Categoría:</span>
        <button
          type="button"
          onClick={() => setCategoryId('todas')}
          className={`px-space-md py-1 rounded-full font-label-sm text-label-sm font-semibold transition-all ${
            categoryId === 'todas' ? PILL_ACTIVE : PILL_IDLE
          }`}
        >
          Todas
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategoryId(category.id)}
            className={`px-space-md py-1 rounded-full font-label-sm text-label-sm font-semibold transition-all ${
              categoryId === category.id ? PILL_ACTIVE : PILL_IDLE
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1 sm:w-72">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Disponibilidad en almacén:</span>
        <select
          value={stockFilter}
          onChange={(event) => setStockFilter(event.target.value)}
          className="w-full px-space-md py-space-xs rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary-container cursor-pointer"
        >
          <option value="todos">Todo el inventario</option>
          <option value="inmediato">Entrega inmediata (más de 50 uds)</option>
          <option value="bajo">Stock bajo o crítico</option>
        </select>
      </label>

      <div className="rounded-lg bg-surface-container-lowest overflow-hidden">
        <div className="overflow-auto w-full max-h-72">
          <table className="w-full text-left border-collapse min-w-[65rem]">
            <thead className="sticky top-0 bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase">
              <tr>
                <th className="py-space-xs px-space-md">SKU</th>
                <th className="py-space-xs px-space-md">Producto</th>
                <th className="py-space-xs px-space-sm">Presentación</th>
                <th className="py-space-xs px-space-sm text-right">Stock</th>
                <th className="py-space-xs px-space-md text-right">Precio</th>
                <th className="py-space-xs px-space-md text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {results.map((product) => (
                <tr key={product.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-space-sm px-space-md font-label-sm text-label-sm text-secondary font-bold">{product.sku}</td>
                  <td className="py-space-sm px-space-md text-on-surface font-semibold">{product.name}</td>
                  <td className="py-space-sm px-space-sm text-on-surface">{product.unit}</td>
                  <td
                    className={`py-space-sm px-space-sm text-right font-semibold ${
                      product.stock > 0 ? 'text-secondary' : 'text-error'
                    }`}
                  >
                    {product.stock} uds
                  </td>
                  <td className="py-space-sm px-space-md text-right text-on-surface font-bold">
                    ${getUnitPrice(product).toFixed(2)}
                  </td>
                  <td className="py-space-sm px-space-md text-center">
                    <button
                      type="button"
                      onClick={() => onAdd(product)}
                      disabled={product.stock <= 0}
                      className="px-space-sm py-1 rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold hover:bg-secondary-container hover:text-on-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      + Agregar
                    </button>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-space-lg text-center text-on-surface-variant">
                    No hay productos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

export default ProductSearchModal;
