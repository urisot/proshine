import { useState } from 'react';
import Icon from '../common/Icon.jsx';

function ProductCard({ product, categoryName, onAddToCart, onOpenDetail }) {
  const [imageFailed, setImageFailed] = useState(false);

  const finalPrice = product.discountPercent
    ? product.priceRetail - (product.priceRetail * product.discountPercent) / 100
    : product.priceRetail;

  const isOutOfStock = product.stock === 0;

  function handleAdd(event) {
    event.preventDefault();
    event.stopPropagation();
    onAddToCart(product, 1, finalPrice);
  }

  return (
    <article
      onClick={() => onOpenDetail(product)}
      className="group relative flex flex-col glass-panel rounded-xl overflow-hidden lift-hover glow-hover cursor-pointer"
    >
      <div className="relative w-full h-36 sm:h-52 bg-surface-container-lowest overflow-hidden">
        {product.imageUrl && !imageFailed ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">
            <Icon name="flask" className="w-12 h-12" strokeWidth={1.2} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent" />

        <div className="absolute top-space-xs left-space-xs flex flex-col gap-1">
          {product.isOnPromo && product.discountPercent > 0 && (
            <span className="px-space-xs sm:px-space-sm py-0.5 rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase font-bold shadow-md bevel-top">
              -{product.discountPercent}%
            </span>
          )}
          {product.isHighDemand && (
            <span className="px-space-xs sm:px-space-sm py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm uppercase font-bold shadow-md bevel-top">
              Top
            </span>
          )}
        </div>

        <span className="absolute top-space-xs right-space-xs px-space-xs sm:px-space-sm py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md text-on-surface font-label-sm text-label-sm">
          {product.unit}
        </span>

        <span className="hidden sm:flex absolute bottom-space-sm right-space-sm items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md font-label-sm text-label-sm opacity-0 group-hover:opacity-100 transition-opacity text-secondary">
          Ver detalle <Icon name="chevronRight" className="w-3 h-3" />
        </span>
      </div>

      <div className="p-space-sm sm:p-space-md flex flex-col flex-1 justify-between gap-space-sm">
        <div>
          <div className="flex items-center justify-between gap-space-xs font-label-sm text-label-sm uppercase mb-1">
            <span className="text-on-surface-variant truncate">{categoryName}</span>
            <span className={`hidden sm:flex items-center gap-1 whitespace-nowrap ${isOutOfStock ? 'text-error' : 'text-secondary'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-error' : 'bg-secondary-container'}`} />
              {isOutOfStock ? 'Agotado' : `${product.stock} disp.`}
            </span>
          </div>
          <h3 className="font-title-md text-title-md text-on-surface font-bold group-hover:text-secondary transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="hidden sm:block font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* En 2 columnas angostas el precio y el botón se apilan; desde sm van lado a lado. */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-space-xs sm:gap-space-sm pt-space-xs">
          <div className="flex flex-col min-w-0">
            <span className="hidden sm:inline font-label-sm text-label-sm text-on-surface-variant">Precio Unitario</span>
            <div className="flex items-baseline gap-space-xs flex-wrap">
              <span className="font-display text-title-lg sm:text-headline-sm text-secondary font-bold">
                ${finalPrice.toFixed(2)}
              </span>
              {product.discountPercent > 0 && (
                <span className="font-body-sm text-body-sm text-outline line-through">
                  ${product.priceRetail.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-sm sm:px-space-md py-space-sm rounded-xl bg-primary-container hover:bg-inverse-primary disabled:bg-surface-container-high disabled:text-outline disabled:cursor-not-allowed text-on-primary-container font-label-md text-label-md transition-all bevel-top shrink-0"
          >
            <Icon name="cart" className="w-4 h-4" />
            {isOutOfStock ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
