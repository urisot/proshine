import { getStockLevel } from '../../services/productService.js';
import Icon from '../common/Icon.jsx';
import IconButton from '../common/IconButton.jsx';
import EmptyState from '../common/EmptyState.jsx';

const STOCK_STYLES = {
  Óptimo: { text: 'text-secondary', bar: 'bg-secondary-container' },
  Bajo: { text: 'text-on-surface-variant', bar: 'bg-outline' },
  Crítico: { text: 'text-error', bar: 'bg-error' },
};

function ProductsTable({ products, categoryNameById, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="glass-panel rounded-xl">
        <EmptyState
          icon="box"
          title="Sin productos"
          message="No hay productos que coincidan con la búsqueda. Crea uno nuevo o ajusta el filtro."
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto glass-panel rounded-xl shadow-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
            <th className="py-space-md px-space-md">Producto</th>
            <th className="py-space-md px-space-md">Categoría</th>
            <th className="py-space-md px-space-md">Presentación</th>
            <th className="py-space-md px-space-md text-right">Menudeo</th>
            <th className="py-space-md px-space-md text-right">Mayoreo</th>
            <th className="py-space-md px-space-md">Stock</th>
            <th className="py-space-md px-space-md text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="font-body-md text-body-md text-on-surface">
          {products.map((product) => {
            const stockLevel = getStockLevel(product);
            const style = STOCK_STYLES[stockLevel];
            const stockPercent = Math.min(100, Math.round((product.stock / Math.max(product.minStock * 5, 1)) * 100));

            return (
              <tr key={product.id} className="hover:bg-surface-container/50 transition-colors border-t border-surface-container-highest/20">
                <td className="py-space-sm px-space-md">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden flex items-center justify-center shrink-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="flask" className="w-5 h-5 text-outline" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-title-md text-title-md text-on-surface font-semibold truncate">{product.name}</span>
                      <span className="font-label-sm text-label-sm text-secondary font-bold">{product.sku}</span>
                    </div>
                  </div>
                </td>
                <td className="py-space-sm px-space-md">
                  <span className="px-space-sm py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm whitespace-nowrap">
                    {categoryNameById[product.categoryId] || 'Sin categoría'}
                  </span>
                </td>
                <td className="py-space-sm px-space-md text-on-surface-variant whitespace-nowrap">{product.unit}</td>
                <td className="py-space-sm px-space-md text-right font-semibold whitespace-nowrap">
                  ${product.priceRetail.toFixed(2)}
                </td>
                <td className="py-space-sm px-space-md text-right text-secondary font-semibold whitespace-nowrap">
                  ${product.priceWholesale.toFixed(2)}
                </td>
                <td className="py-space-sm px-space-md">
                  <div className="flex flex-col gap-1 w-28">
                    <div className="flex justify-between items-center font-label-sm text-label-sm">
                      <span className={`font-bold ${style.text}`}>{product.stock}</span>
                      <span className={`uppercase ${style.text}`}>{stockLevel}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div className={`${style.bar} h-full rounded-full transition-all`} style={{ width: `${stockPercent}%` }} />
                    </div>
                  </div>
                </td>
                <td className="py-space-sm px-space-md">
                  <div className="flex items-center justify-center gap-space-xs">
                    <IconButton icon="edit" label={`Editar ${product.name}`} onClick={() => onEdit(product)} variant="accent" />
                    <IconButton icon="trash" label={`Eliminar ${product.name}`} onClick={() => onDelete(product)} variant="danger" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ProductsTable;
