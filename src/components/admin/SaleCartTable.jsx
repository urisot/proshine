import Icon from '../common/Icon.jsx';

function SaleCartTable({ items, onChangeQuantity, onRemove }) {
  return (
    <div className="rounded-xl bg-surface-container-low overflow-hidden shadow-sm">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[70rem]">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <th className="py-space-sm px-space-md">Producto</th>
              <th className="py-space-sm px-space-sm">Presentación</th>
              <th className="py-space-sm px-space-sm text-center">Cantidad</th>
              <th className="py-space-sm px-space-sm text-right">P. Unitario</th>
              <th className="py-space-sm px-space-sm text-center">Desc %</th>
              <th className="py-space-sm px-space-md text-right">Subtotal</th>
              <th className="py-space-sm px-space-xs text-center">
                <span className="sr-only">Quitar</span>
              </th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm">
            {items.map((item, index) => (
              <tr
                key={item.productId}
                className={`${
                  index % 2 === 0 ? 'bg-surface-container-low hover:bg-surface-container' : 'bg-surface-container hover:bg-surface-container-high'
                } transition-colors`}
              >
                <td className="py-space-md px-space-md">
                  <div className="flex items-start gap-space-sm">
                    <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0 mt-0.5">
                      <Icon name="flask" className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-title-md text-title-md text-on-surface leading-snug">{item.name}</span>
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">SKU: {item.sku}</span>
                    </div>
                  </div>
                </td>
                <td className="py-space-md px-space-sm align-top">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">{item.unit}</span>
                </td>
                <td className="py-space-md px-space-sm align-top text-center">
                  <div className="inline-flex items-center rounded-lg bg-surface-container-highest p-0.5">
                    <button
                      type="button"
                      onClick={() => onChangeQuantity(item.productId, item.quantity - 1)}
                      aria-label={`Restar una unidad de ${item.name}`}
                      className="w-8 h-8 rounded flex items-center justify-center text-on-surface hover:bg-surface-bright"
                    >
                      <Icon name="minus" className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-title-md text-title-md text-secondary">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onChangeQuantity(item.productId, item.quantity + 1)}
                      aria-label={`Sumar una unidad de ${item.name}`}
                      className="w-8 h-8 rounded flex items-center justify-center text-on-surface hover:bg-surface-bright"
                    >
                      <Icon name="plus" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="py-space-md px-space-sm align-top text-right text-on-surface">
                  ${item.listPrice.toFixed(2)}
                </td>
                <td className="py-space-md px-space-sm align-top text-center">
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm text-secondary">
                    {item.discountPercent}%
                  </span>
                </td>
                <td className="py-space-md px-space-md align-top text-right font-display text-headline-sm text-on-surface">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </td>
                <td className="py-space-md px-space-xs align-top text-center">
                  <button
                    type="button"
                    onClick={() => onRemove(item.productId)}
                    aria-label={`Quitar ${item.name}`}
                    className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="close" className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="py-space-xl text-center text-on-surface-variant font-label-md text-label-md">
                  No hay productos en la venta. Escanea un código, teclea un SKU o usa F2.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SaleCartTable;
