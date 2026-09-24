import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';

function ProductDetailModal({ product, categoryName, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setImageFailed(false);
  }, [product]);

  if (!product) {
    return null;
  }

  const finalPrice = product.discountPercent
    ? product.priceRetail - (product.priceRetail * product.discountPercent) / 100
    : product.priceRetail;

  const isOutOfStock = product.stock === 0;

  function handleSubmit(event) {
    event.preventDefault();
    onAddToCart(product, quantity, finalPrice);
    onClose();
  }

  return (
    <Modal
      isOpen={Boolean(product)}
      title={product.name}
      subtitle={`${categoryName} • SKU ${product.sku}`}
      icon="flask"
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-surface-container-lowest">
          {product.imageUrl && !imageFailed ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-outline">
              <Icon name="flask" className="w-16 h-16" strokeWidth={1.2} />
            </div>
          )}
          <div className="absolute top-space-sm left-space-sm flex flex-col gap-1">
            {product.isOnPromo && product.discountPercent > 0 && (
              <span className="px-space-sm py-0.5 rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase font-bold bevel-top">
                -{product.discountPercent}% Oferta
              </span>
            )}
            {product.isHighDemand && (
              <span className="px-space-sm py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm uppercase font-bold bevel-top">
                Más Vendido
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-sm">
          <p className="font-body-md text-body-md text-on-surface-variant">{product.description}</p>

          <dl className="grid grid-cols-2 gap-space-xs">
            <div className="flex flex-col p-space-sm rounded-lg bg-surface-container">
              <dt className="font-label-sm text-label-sm text-on-surface-variant uppercase">Presentación</dt>
              <dd className="font-title-md text-title-md text-on-surface">{product.unit}</dd>
            </div>
            <div className="flex flex-col p-space-sm rounded-lg bg-surface-container">
              <dt className="font-label-sm text-label-sm text-on-surface-variant uppercase">Existencia</dt>
              <dd className={`font-title-md text-title-md ${isOutOfStock ? 'text-error' : 'text-secondary'}`}>
                {isOutOfStock ? 'Agotado' : `${product.stock} unidades`}
              </dd>
            </div>
            <div className="flex flex-col p-space-sm rounded-lg bg-surface-container">
              <dt className="font-label-sm text-label-sm text-on-surface-variant uppercase">Precio Menudeo</dt>
              <dd className="font-title-md text-title-md text-on-surface">${product.priceRetail.toFixed(2)}</dd>
            </div>
            <div className="flex flex-col p-space-sm rounded-lg bg-surface-container">
              <dt className="font-label-sm text-label-sm text-secondary uppercase">Precio Mayoreo</dt>
              <dd className="font-title-md text-title-md text-secondary">${product.priceWholesale.toFixed(2)}</dd>
            </div>
          </dl>

          <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-high bevel-top">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Precio Final</span>
              <span className="font-display text-headline-md text-secondary font-bold">${finalPrice.toFixed(2)} MXN</span>
            </div>
            <label className="flex flex-col items-end gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Cantidad</span>
              <div className="flex items-center rounded-lg bg-surface-container overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="w-11 h-11 flex items-center justify-center text-title-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                  className="w-14 h-11 bg-transparent text-on-surface text-center outline-none"
                  aria-label="Cantidad"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="w-11 h-11 flex items-center justify-center text-title-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isOutOfStock}
            className="sticky bottom-0 w-full flex items-center justify-center gap-space-xs py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container disabled:from-surface-container-high disabled:to-surface-container-high disabled:text-outline text-on-primary-container font-label-lg text-label-lg shadow-lg bevel-top hover:brightness-110 transition"
          >
            <Icon name="cart" className="w-5 h-5" />
            {isOutOfStock ? 'Producto Agotado' : `Agregar ${quantity} al Carrito`}
          </button>
        </form>
      </div>
    </Modal>
  );
}

export default ProductDetailModal;
