import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getAll as getAllProducts } from '../services/productService.js';
import { getAll as getAllCategories } from '../services/categoryService.js';
import { get as getSettings } from '../services/settingsService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductCard from '../components/catalog/ProductCard.jsx';
import ProductDetailModal from '../components/catalog/ProductDetailModal.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Logo from '../components/common/Logo.jsx';
import Icon from '../components/common/Icon.jsx';

const SECTORS = [
  { key: 'Hogar', icon: 'home', caption: 'Desinfección y Cuidado' },
  { key: 'Hoteles', icon: 'hotel', caption: 'Blancos y Aromatización' },
  { key: 'Escuelas', icon: 'school', caption: 'Sanitización Segura' },
  { key: 'Empresas', icon: 'building', caption: 'Corporativo y Pisos' },
  { key: 'Industria', icon: 'factory', caption: 'Desengrase de Maquinaria' },
];

function CatalogPage() {
  const [products] = useState(() => getAllProducts());
  const [categories] = useState(() => getAllCategories());
  const [settings] = useState(() => getSettings());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [sortBy, setSortBy] = useState('demanda');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  const { openCart } = useOutletContext();
  const { isAuthenticated, isAdmin } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const categoryById = useMemo(() => {
    const map = {};
    categories.forEach((category) => {
      map[category.id] = category;
    });
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();

    let result = products.filter((product) => {
      const category = categoryById[product.categoryId];
      const matchesSearch =
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
      const matchesSector = !sectorFilter || category?.sector === sectorFilter;
      const matchesStock = !onlyInStock || product.stock > 0;
      const matchesPromo = !onlyPromo || product.isOnPromo;
      return matchesSearch && matchesCategory && matchesSector && matchesStock && matchesPromo;
    });

    if (sortBy === 'menor-precio') {
      result = [...result].sort((a, b) => a.priceRetail - b.priceRetail);
    } else if (sortBy === 'mayor-precio') {
      result = [...result].sort((a, b) => b.priceRetail - a.priceRetail);
    } else if (sortBy === 'nombre') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    } else {
      result = [...result].sort((a, b) => Number(b.isHighDemand) - Number(a.isHighDemand));
    }

    return result;
  }, [products, categoryById, searchTerm, categoryFilter, sectorFilter, sortBy, onlyInStock, onlyPromo]);

  const hasActiveFilters = Boolean(searchTerm || categoryFilter || sectorFilter || onlyInStock || onlyPromo);

  function resetFilters(event) {
    event.preventDefault();
    setSearchTerm('');
    setCategoryFilter('');
    setSectorFilter('');
    setSortBy('demanda');
    setOnlyInStock(false);
    setOnlyPromo(false);
  }

  function handleAddToCart(product, quantity, unitPrice) {
    if (!isAuthenticated) {
      showToast('Inicia sesión para agregar productos al carrito.', 'error');
      navigate('/acceso');
      return;
    }
    if (isAdmin) {
      showToast('Las cuentas administrativas no realizan compras.', 'error');
      return;
    }
    addItem(product, product.unit, quantity, unitPrice);
    showToast(`${product.name} agregado al carrito.`);
    openCart();
  }

  return (
    <div className="w-full pt-20 bg-surface min-h-screen">
      <section className="relative overflow-hidden bg-surface-container-lowest pb-space-lg px-margin-mobile sm:px-margin">
        {/* Banner de fondo: bg-contain muestra el logotipo completo; la máscara lo funde con el lienzo. */}
        <div
          className="absolute inset-x-0 top-0 h-[22rem] sm:h-[30rem] bg-no-repeat bg-contain bg-top opacity-50 pointer-events-none"
          style={{
            backgroundImage: 'url(/logoProShine.jpeg)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.45) 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.45) 70%, transparent 100%)',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[22rem] sm:h-[30rem] bg-gradient-to-b from-surface-container-lowest/30 via-transparent to-surface-container-lowest pointer-events-none" />

        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />

        {/* Deja ver el banner completo antes de que empiece el contenido. */}
        <div className="h-[16rem] sm:h-[24rem]" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center gap-space-md animate-fade-up">
          <span className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high/80 backdrop-blur-sm font-label-sm text-label-sm text-secondary tracking-widest uppercase bevel-top">
            <Icon name="sparkle" className="w-3.5 h-3.5" />
            Distribución Industrial y Doméstica
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-sm w-full max-w-4xl pt-space-xs stagger">
            {SECTORS.map((sector) => {
              const isActive = sectorFilter === sector.key;
              return (
                <button
                  key={sector.key}
                  type="button"
                  onClick={() => setSectorFilter(isActive ? '' : sector.key)}
                  className={`group flex flex-col items-center p-space-md rounded-xl text-center lift-hover glow-hover border ${
                    isActive
                      ? 'glass-panel-strong border-secondary/40 shadow-[0_0_2rem_-0.6rem_rgba(0,210,253,0.5)]'
                      : 'glass-panel'
                  }`}
                >
                  <span
                    className={`w-11 h-11 rounded-lg flex items-center justify-center mb-space-xs transition-colors ${
                      isActive ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-lowest text-secondary'
                    }`}
                  >
                    <Icon name={sector.icon} />
                  </span>
                  <span className={`font-label-lg text-label-lg ${isActive ? 'text-secondary' : 'text-on-surface'}`}>
                    {sector.key}
                  </span>
                  <span className="hidden sm:block font-body-sm text-body-sm text-on-surface-variant">{sector.caption}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sticky top-20 z-30 w-full px-margin-mobile sm:px-margin py-space-md glass-panel border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-space-md">
          <div className="relative flex-1 w-full flex items-center bg-surface-container-lowest/80 rounded-xl px-space-md py-space-xs">
            <Icon name="search" className="w-5 h-5 text-secondary mr-space-sm shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar cloro concentrado, amonio cuaternario, mopas..."
              className="w-full bg-transparent text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none py-space-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
                aria-label="Limpiar búsqueda"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-space-xs w-full lg:w-auto">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full sm:w-auto bg-surface-container-highest text-on-surface font-label-md text-label-md px-space-md py-2.5 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="">Todas las Familias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full sm:w-auto bg-surface-container-highest text-on-surface font-label-md text-label-md px-space-md py-2.5 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="demanda">Ordenar: Mayor Demanda</option>
              <option value="menor-precio">Menor Precio</option>
              <option value="mayor-precio">Mayor Precio</option>
              <option value="nombre">Nombre (A-Z)</option>
            </select>
          </div>
        </div>
      </section>
      <br>
      </br>
  

      <section className="w-full px-margin-mobile sm:px-margin pb-space-xl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-space-lg items-start">
          <aside className="w-full lg:w-72 lg:sticky lg:top-[11rem] flex-shrink-0 flex flex-col gap-space-md glass-panel p-space-md rounded-xl">
            <div className="flex items-center justify-between gap-space-sm pb-space-sm hairline">
              {/* En móvil el encabezado colapsa los filtros para no empujar la rejilla. */}
              <button
                type="button"
                onClick={() => setAreFiltersOpen((current) => !current)}
                className="flex flex-1 items-center gap-space-xs font-title-md text-title-md text-on-surface lg:cursor-default"
              >
                <Icon name="filter" className="w-4 h-4 text-secondary" />
                Filtrar Catálogo
                <Icon
                  name="chevronRight"
                  className={`lg:hidden w-4 h-4 ml-auto text-on-surface-variant transition-transform ${
                    areFiltersOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {hasActiveFilters && (
                <button type="button" onClick={resetFilters} className="font-label-sm text-label-sm text-secondary hover:text-on-surface uppercase shrink-0">
                  Limpiar
                </button>
              )}
            </div>

            <div className={`${areFiltersOpen ? 'flex' : 'hidden'} lg:flex flex-col gap-space-md`}>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">Disponibilidad</span>
              <label className="flex items-center gap-space-xs cursor-pointer font-body-sm text-body-sm text-on-surface">
                <input type="checkbox" checked={onlyInStock} onChange={(event) => setOnlyInStock(event.target.checked)} className="rounded accent-[#0070f3]" />
                En existencia inmediata
              </label>
              <label className="flex items-center gap-space-xs cursor-pointer font-body-sm text-body-sm text-on-surface">
                <input type="checkbox" checked={onlyPromo} onChange={(event) => setOnlyPromo(event.target.checked)} className="rounded accent-[#0070f3]" />
                Con descuento activo
              </label>
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">Sector de Aplicación</span>
              <div className="flex flex-wrap gap-1">
                {SECTORS.map((sector) => (
                  <button
                    key={sector.key}
                    type="button"
                    onClick={() => setSectorFilter(sectorFilter === sector.key ? '' : sector.key)}
                    className={`px-space-sm py-1 rounded font-body-sm text-body-sm transition-colors ${
                      sectorFilter === sector.key
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {sector.key}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">Familia de Producto</span>
              <div className="flex flex-col gap-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryFilter(categoryFilter === category.id ? '' : category.id)}
                    className={`text-left px-space-sm py-1 rounded font-body-sm text-body-sm transition-colors ${
                      categoryFilter === category.id
                        ? 'bg-primary-container text-on-primary-container'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-space-sm p-space-md rounded-xl bg-surface-container/60 flex flex-col gap-space-xs">
              <span className="font-title-md text-title-md text-on-surface">¿Requieres volumen industrial?</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Atendemos licitaciones y pedidos masivos con precio mayorista.
              </p>
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                  'Hola ProShine, solicito cotización para volumen industrial.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-space-xs inline-flex items-center justify-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-secondary font-label-md text-label-md transition-colors"
              >
                <Icon name="chat" className="w-4 h-4" />
                Solicitar Cotización
              </a>
            </div>
            </div>
          </aside>

          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md glass-panel px-space-md py-space-sm rounded-xl">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Mostrando <strong className="text-on-surface font-label-md text-label-md">{filteredProducts.length} productos</strong> en catálogo activo
              </span>
              <span className="flex items-center gap-space-xs font-label-sm text-label-sm text-secondary uppercase">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Precios en MXN + IVA
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-space-sm sm:gap-space-md stagger">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={categoryById[product.categoryId]?.name}
                    onAddToCart={handleAddToCart}
                    onOpenDetail={setDetailProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-xl">
                <EmptyState
                  icon="search"
                  title="Sin resultados"
                  message="No encontramos productos con los filtros seleccionados. Prueba ajustando la búsqueda o limpiando los filtros."
                  action={
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-space-xs px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-md bevel-top"
                    >
                      Limpiar Filtros
                    </button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="w-full bg-surface-container-lowest px-margin-mobile sm:px-margin py-space-lg">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            <div className="flex flex-col gap-space-sm">
              <Logo className="h-16" />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Formulación y distribución de químicos de limpieza, desinfección y surfactantes con cumplimiento normativo.
              </p>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-lg text-label-lg text-on-surface uppercase">Sectores Atendidos</span>
              {SECTORS.map((sector) => (
                <span key={sector.key} className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                  <Icon name={sector.icon} className="w-4 h-4 text-secondary" />
                  {sector.key} — {sector.caption}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-lg text-label-lg text-on-surface uppercase">Contacto Directo</span>
              <span className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <Icon name="phone" className="w-4 h-4 text-secondary" /> {settings.storePhone}
              </span>
              <span className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <Icon name="mail" className="w-4 h-4 text-secondary" /> {settings.storeEmail}
              </span>
              <span className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <Icon name="pin" className="w-4 h-4 text-secondary" /> {settings.storeAddress}
              </span>
            </div>
          </div>
          <div className="pt-space-md hairline border-b-0 border-t border-surface-container-high">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              © {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.
            </span>
          </div>
        </div>
      </footer>

      <ProductDetailModal
        product={detailProduct}
        categoryName={detailProduct ? categoryById[detailProduct.categoryId]?.name : ''}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

export default CatalogPage;
