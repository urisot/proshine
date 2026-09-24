import { useMemo, useState } from 'react';
import * as productService from '../../services/productService.js';
import * as categoryService from '../../services/categoryService.js';
import { useToast } from '../../context/ToastContext.jsx';
import ProductsTable from '../../components/admin/ProductsTable.jsx';
import CategoriesGrid from '../../components/admin/CategoriesGrid.jsx';
import ProductForm from '../../components/admin/ProductForm.jsx';
import CategoryForm from '../../components/admin/CategoryForm.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Icon from '../../components/common/Icon.jsx';
import DataToolbar from '../../components/admin/DataToolbar.jsx';
import * as bulkDataService from '../../services/bulkDataService.js';

function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState(() => productService.getAll());
  const [categories, setCategories] = useState(() => categoryService.getAll());
  const { showToast } = useToast();

  const [productModal, setProductModal] = useState({ isOpen: false, data: null });
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, data: null });
  const [productToDelete, setProductToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categoryNameById = useMemo(() => {
    const map = {};
    categories.forEach((category) => {
      map[category.id] = category.name;
    });
    return map;
  }, [categories]);

  const productCountByCategory = useMemo(() => {
    const counts = {};
    products.forEach((product) => {
      counts[product.categoryId] = (counts[product.categoryId] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticalCount = products.filter((product) => productService.getStockLevel(product) === 'Crítico').length;

  function refreshAll() {
    setProducts(productService.getAll());
    setCategories(categoryService.getAll());
  }

  function handleProductSubmit(formData) {
    const result = productModal.data
      ? productService.update(productModal.data.id, formData)
      : productService.create(formData);

    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }

    setProducts(productService.getAll());
    setProductModal({ isOpen: false, data: null });
    showToast('Producto guardado con éxito.');
  }

  function handleProductDelete() {
    productService.remove(productToDelete.id);
    setProducts(productService.getAll());
    setProductToDelete(null);
    showToast('Producto eliminado.');
  }

  function handleCategorySubmit(formData) {
    if (categoryModal.data) {
      categoryService.update(categoryModal.data.id, formData);
    } else {
      categoryService.create(formData);
    }
    setCategories(categoryService.getAll());
    setCategoryModal({ isOpen: false, data: null });
    showToast('Categoría guardada con éxito.');
  }

  function handleCategoryDelete() {
    categoryService.remove(categoryToDelete.id);
    setCategories(categoryService.getAll());
    setCategoryToDelete(null);
    showToast('Categoría eliminada.');
  }

  return (
    <main className="lg:pl-72 pt-20 bg-surface min-h-screen px-space-md lg:px-space-lg py-space-md pb-space-xl">
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
              Catálogo Maestro • Planta Central
            </span>
            <h1 className="font-display text-headline-lg text-on-surface tracking-tight">
              Gestión de Inventario y Catálogo
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Control de formulaciones químicas, stock y categorización industrial.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-space-sm">
            {[
              { label: 'SKUs', value: products.length, tone: 'text-secondary' },
              { label: 'Crítico', value: criticalCount, tone: 'text-error' },
              { label: 'Categorías', value: categories.length, tone: 'text-primary' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col p-space-sm glass-panel rounded-xl shadow-md">
                <span className={`font-label-sm text-label-sm uppercase ${stat.tone}`}>{stat.label}</span>
                <span className={`font-display text-headline-sm mt-0.5 ${stat.tone}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 glass-panel p-1 rounded-xl w-fit">
          {[
            { key: 'products', label: 'Inventario de Productos', icon: 'box' },
            { key: 'categories', label: 'Gestor de Categorías', icon: 'tag' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg font-label-lg text-label-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-container text-on-primary-container shadow-md bevel-top'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'products' ? (
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md glass-panel p-space-md rounded-xl shadow-md">
              <div className="relative w-full sm:w-80 flex items-center">
                <Icon name="search" className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por SKU o nombre..."
                  className="w-full pl-10 pr-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high transition"
                />
              </div>
              <div className="flex flex-wrap items-center gap-space-xs">
                <DataToolbar
                  entityLabel="Productos"
                  columns={bulkDataService.PRODUCT_COLUMNS}
                  onExport={() => bulkDataService.exportProducts(products, categoryNameById)}
                  onDownloadTemplate={bulkDataService.downloadProductsTemplate}
                  onImport={bulkDataService.importProducts}
                  onImported={refreshAll}
                />
                <button
                  type="button"
                  onClick={() => setProductModal({ isOpen: true, data: null })}
                  className="flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-md text-label-md shadow-lg bevel-top"
                >
                  <Icon name="plus" className="w-4 h-4" />
                  Nuevo Producto
                </button>
              </div>
            </div>

            <ProductsTable
              products={filteredProducts}
              categoryNameById={categoryNameById}
              onEdit={(product) => setProductModal({ isOpen: true, data: product })}
              onDelete={setProductToDelete}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-wrap items-center justify-end gap-space-xs glass-panel p-space-md rounded-xl shadow-md">
              <DataToolbar
                entityLabel="Categorías"
                columns={bulkDataService.CATEGORY_COLUMNS}
                onExport={() => bulkDataService.exportCategories(categories, productCountByCategory)}
                onDownloadTemplate={bulkDataService.downloadCategoriesTemplate}
                onImport={bulkDataService.importCategories}
                onImported={refreshAll}
              />
              <button
                type="button"
                onClick={() => setCategoryModal({ isOpen: true, data: null })}
                className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-md text-label-md shadow-lg bevel-top"
              >
                <Icon name="plus" className="w-4 h-4" />
                Nueva Categoría
              </button>
            </div>
            <CategoriesGrid
              categories={categories}
              productCountByCategory={productCountByCategory}
              onEdit={(category) => setCategoryModal({ isOpen: true, data: category })}
              onDelete={setCategoryToDelete}
            />
          </div>
        )}
      </div>

      <ProductForm
        isOpen={productModal.isOpen}
        initialData={productModal.data}
        categories={categories}
        onClose={() => setProductModal({ isOpen: false, data: null })}
        onSubmit={handleProductSubmit}
      />

      <CategoryForm
        isOpen={categoryModal.isOpen}
        initialData={categoryModal.data}
        onClose={() => setCategoryModal({ isOpen: false, data: null })}
        onSubmit={handleCategorySubmit}
      />

      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        title="Eliminar Producto"
        message={`¿Confirmas que deseas eliminar "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleProductDelete}
        onCancel={() => setProductToDelete(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        title="Eliminar Categoría"
        message={`¿Confirmas que deseas eliminar "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleCategoryDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </main>
  );
}

export default AdminProductsPage;
