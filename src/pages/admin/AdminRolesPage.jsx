import { useEffect, useState } from 'react';

import * as roleService from '../../services/roleService.js';
import * as userService from '../../services/userService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import RoleForm from '../../components/admin/RoleForm.jsx';
import RolePermissionsModal from '../../components/admin/RolePermissionsModal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Icon from '../../components/common/Icon.jsx';
import IconButton from '../../components/common/IconButton.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, data: null });
  const [permissionsRole, setPermissionsRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const { showToast } = useToast();
  const { session, refreshSession } = useAuth();

  function refreshData() {
    return Promise.all([roleService.getAll(), userService.getAll()]).then(([roleList, userList]) => {
      setRoles(roleList);
      setUsers(userList);
    });
  }

  useEffect(() => {
    refreshData();
  }, []);

  function countUsers(roleId) {
    return users.filter((user) => user.role === roleId).length;
  }

  async function handleSubmit(formData) {
    const result = modal.data
      ? await roleService.update(modal.data.id, formData)
      : await roleService.create(formData);

    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }

    await refreshData();
    setModal({ isOpen: false, data: null });
    showToast('Rol guardado con éxito.');
  }

  async function handleSavePermissions(keys) {
    await roleService.savePermissions(permissionsRole.id, keys);
    // Si se editó el rol del usuario actual, su menú se actualiza de inmediato.
    if (permissionsRole.id === session.role) {
      await refreshSession();
    }
    setPermissionsRole(null);
    showToast('Permisos actualizados.');
  }

  async function handleDelete() {
    const result = await roleService.remove(roleToDelete.id);
    if (!result.success) {
      showToast(result.message, 'error');
    } else {
      await refreshData();
      showToast(
        result.reassignedCount > 0
          ? `Rol eliminado. ${result.reassignedCount} usuario(s) pasaron a Cliente.`
          : 'Rol eliminado.'
      );
    }
    setRoleToDelete(null);
  }

  return (
    <main className="pt-20 bg-surface min-h-screen px-space-md lg:px-space-lg py-space-md">
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Configuraciones</span>
            <h1 className="font-display text-headline-lg text-on-surface tracking-tight">Roles del Sistema</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Crea roles y define a qué opciones del menú tiene acceso cada uno. El rol se asigna a los usuarios en Control de Accesos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModal({ isOpen: true, data: null })}
            className="flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-md text-label-md shadow-lg bevel-top"
          >
            <Icon name="plus" className="w-4 h-4" />
            Nuevo Rol
          </button>
        </div>

        <div className="w-full overflow-x-auto glass-panel rounded-xl shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-space-md px-space-md">Rol</th>
                <th className="py-space-md px-space-md">Descripción</th>
                <th className="py-space-md px-space-md">Usuarios</th>
                <th className="py-space-md px-space-md text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-surface-container/50 transition-colors border-t border-surface-container-highest/20">
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-title-md text-title-md text-on-surface font-semibold">{role.name}</span>
                      {role.isSystem && (
                        <span className="px-space-sm py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase font-bold">
                          Sistema
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-on-surface-variant">{role.description || '—'}</td>
                  <td className="py-space-md px-space-md">{countUsers(role.id)}</td>
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center justify-center gap-space-xs">
                      <IconButton
                        icon="lock"
                        label={`Permisos de ${role.name}`}
                        onClick={() => setPermissionsRole(role)}
                        variant="accent"
                      />
                      <IconButton
                        icon="edit"
                        label={`Editar ${role.name}`}
                        onClick={() => setModal({ isOpen: true, data: role })}
                        variant="accent"
                      />
                      <IconButton
                        icon="trash"
                        label={role.isSystem ? 'Los roles del sistema no se pueden eliminar' : `Eliminar ${role.name}`}
                        onClick={() => setRoleToDelete(role)}
                        disabled={role.isSystem}
                        variant="danger"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {roles.length === 0 && (
            <EmptyState icon="shield" title="Sin roles" message="Aún no hay roles registrados." />
          )}
        </div>
      </div>

      <RoleForm
        isOpen={modal.isOpen}
        initialData={modal.data}
        onClose={() => setModal({ isOpen: false, data: null })}
        onSubmit={handleSubmit}
      />

      <RolePermissionsModal
        isOpen={Boolean(permissionsRole)}
        role={permissionsRole}
        onClose={() => setPermissionsRole(null)}
        onSubmit={handleSavePermissions}
      />

      <ConfirmDialog
        isOpen={Boolean(roleToDelete)}
        title="Eliminar Rol"
        message={`¿Confirmas que deseas eliminar el rol "${roleToDelete?.name}"? ${
          roleToDelete && countUsers(roleToDelete.id) > 0
            ? `Los ${countUsers(roleToDelete.id)} usuario(s) con este rol pasarán a Cliente.`
            : 'Esta acción no se puede deshacer.'
        }`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setRoleToDelete(null)}
      />
    </main>
  );
}

export default AdminRolesPage;
