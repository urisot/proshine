import Icon from '../common/Icon.jsx';
import IconButton from '../common/IconButton.jsx';
import EmptyState from '../common/EmptyState.jsx';

const SECTOR_ICONS = {
  Hogar: 'home',
  Hoteles: 'hotel',
  Escuelas: 'school',
  Empresas: 'building',
  Industria: 'factory',
};

function CategoriesGrid({ categories, productCountByCategory, onEdit, onDelete }) {
  if (categories.length === 0) {
    return (
      <div className="glass-panel rounded-xl">
        <EmptyState icon="tag" title="Sin categorías" message="Crea la primera categoría para organizar tu catálogo." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md stagger">
      {categories.map((category) => (
        <article key={category.id} className="flex flex-col justify-between p-space-md glass-panel rounded-xl shadow-md lift-hover glow-hover">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <span className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary bevel-top shrink-0">
                <Icon name={SECTOR_ICONS[category.sector] || 'tag'} />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-title-md text-title-md text-on-surface font-bold truncate">{category.name}</span>
                <span className="font-label-sm text-label-sm text-secondary uppercase">Sector {category.sector}</span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <IconButton icon="edit" label={`Editar ${category.name}`} onClick={() => onEdit(category)} variant="accent" />
              <IconButton icon="trash" label={`Eliminar ${category.name}`} onClick={() => onDelete(category)} variant="danger" />
            </div>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant my-space-md">{category.description}</p>

          <div className="flex items-center justify-between bg-surface-container-low/70 px-space-md py-space-xs rounded-lg">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Productos Asociados</span>
            <span className="font-display text-headline-sm text-primary">{productCountByCategory[category.id] || 0}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export default CategoriesGrid;
