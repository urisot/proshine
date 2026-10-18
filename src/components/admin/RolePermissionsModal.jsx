import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import { MENU } from '../../services/menuCatalog.js';
import * as roleService from '../../services/roleService.js';

// Opciones que se pueden asignar (las exclusivas del admin no aparecen).
function getAssignableChildren(group) {
  return (group.children || []).filter((child) => !child.adminOnly);
}

const GROUPS = MENU.filter((group) => !group.children || getAssignableChildren(group).length > 0);

function RolePermissionsModal({ isOpen, role, onClose, onSubmit }) {
  const [selected, setSelected] = useState([]);
  const isAdminRole = role?.id === roleService.ADMIN_ROLE;

  useEffect(() => {
    if (isOpen && role) {
      roleService.getPermissions(role.id).then(setSelected);
    }
  }, [isOpen, role]);

  function isChecked(key) {
    return selected.includes(key);
  }

  // Marcar el padre marca todos sus hijos; desmarcarlo los quita.
  function toggleGroup(group) {
    const childKeys = getAssignableChildren(group).map((child) => child.key);
    const keys = [group.key, ...childKeys];
    setSelected((current) =>
      isChecked(group.key) ? current.filter((key) => !keys.includes(key)) : [...new Set([...current, ...keys])]
    );
  }

  // Marcar un hijo activa el padre; al quitar el último hijo el padre también se quita.
  function toggleChild(group, child) {
    setSelected((current) => {
      if (!current.includes(child.key)) {
        return [...new Set([...current, child.key, group.key])];
      }
      const remaining = current.filter((key) => key !== child.key);
      const hasOtherChildren = getAssignableChildren(group).some((item) => remaining.includes(item.key));
      return hasOtherChildren ? remaining : remaining.filter((key) => key !== group.key);
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(selected);
  }

  return (
    <Modal
      isOpen={isOpen}
      title={`Permisos de "${role?.name || ''}"`}
      subtitle="Opciones del menú a las que tiene acceso este rol"
      icon="lock"
      onClose={onClose}
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        {isAdminRole && (
          <p className="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface-variant">
            <Icon name="shield" className="w-4 h-4 shrink-0 text-secondary" />
            El administrador siempre tiene acceso a todas las opciones, incluidas Control de Accesos y Roles del Sistema.
          </p>
        )}

        <ul className="flex flex-col gap-space-sm">
          {GROUPS.map((group) => (
            <li key={group.key} className="p-space-sm rounded-lg bg-surface-container-low">
              <label className="flex items-center gap-space-sm cursor-pointer font-title-md text-title-md text-on-surface font-semibold">
                <input
                  type="checkbox"
                  checked={isChecked(group.key)}
                  disabled={isAdminRole}
                  onChange={() => toggleGroup(group)}
                  className="w-4 h-4 accent-primary-container"
                />
                <Icon name={group.icon} className="w-4 h-4 text-secondary" />
                {group.label}
              </label>
              {group.children && (
                <ul className="flex flex-col gap-space-xs mt-space-xs ml-space-lg pl-space-sm border-l border-surface-container-highest">
                  {getAssignableChildren(group).map((child) => (
                    <li key={child.key}>
                      <label className="flex items-center gap-space-sm cursor-pointer font-body-md text-body-md text-on-surface">
                        <input
                          type="checkbox"
                          checked={isChecked(child.key)}
                          disabled={isAdminRole}
                          onChange={() => toggleChild(group, child)}
                          className="w-4 h-4 accent-primary-container"
                        />
                        {child.label}
                        {!child.to && (
                          <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant uppercase">
                            Próximamente
                          </span>
                        )}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-space-sm pt-space-sm">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors"
          >
            {isAdminRole ? 'Cerrar' : 'Cancelar'}
          </button>
          {!isAdminRole && (
            <button
              type="submit"
              className="w-full sm:w-auto px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-md text-label-md shadow-lg bevel-top"
            >
              Guardar Permisos
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default RolePermissionsModal;
