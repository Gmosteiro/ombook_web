import { useState, useEffect } from "react";
import { Link } from "react-router";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { UserRole } from "../../auth/types";
import { useUsers } from "../hooks/useUsers";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR]);

interface User {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  cedula: string;
  rol: string;
  estado: string;
  fechaCreacion?: string;
}

interface Filters {
  search: string;
  rol: string;
  estado: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    rol: '',
    estado: ''
  });
  const [page, setPage] = useState(1);
  const usersPerPage = 15;

  const { users: loadedUsers, isLoading: loading, error, loadUsers } = useUsers();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers({ type: 'listar' });
  }, []);

  // Mapear usuarios cuando se cargan
  useEffect(() => {
    if (loadedUsers && Array.isArray(loadedUsers)) {
      const mappedUsers = (loadedUsers as any[]).map((usuario: any) => ({
        id: usuario.id?.toString() || '',
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        correo: usuario.correo || '',
        cedula: usuario.cedula || '',
        rol: usuario.rol || '',
        estado: usuario.estado || 'ACTIVO',
        fechaCreacion: usuario.fechaCreacion
      }));
      setUsers(mappedUsers);
    }
  }, [loadedUsers]);

  // Filtrar usuarios cuando cambien los filtros o los usuarios
  useEffect(() => {
    let filtered = users.filter(user => {
      const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
      const matchesSearch = !filters.search ||
        fullName.includes(filters.search.toLowerCase()) ||
        user.correo.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.cedula.toLowerCase().includes(filters.search.toLowerCase());

      const matchesRole = !filters.rol || user.rol === filters.rol;
      const matchesStatus = !filters.estado || user.estado === filters.estado;

      return matchesSearch && matchesRole && matchesStatus;
    });

    setFilteredUsers(filtered);
    setPage(1); // Reset page when filters change
  }, [users, filters]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (page - 1) * usersPerPage;
  const paginated = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Error al cargar usuarios
          </h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>
        <div className="space-x-4">
          <Link
            to="/users/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Crear Usuario
          </Link>
          <Link
            to="/users/delete"
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Eliminar Usuarios
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, email o cédula..."
          className="flex-1 border rounded-xl p-2 px-4"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="border rounded-xl p-2"
          value={filters.rol}
          onChange={(e) => setFilters({ ...filters, rol: e.target.value })}
        >
          <option value="">Filtrar por rol</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="PROFESOR">Profesor</option>
          <option value="ESTUDIANTE">Estudiante</option>
        </select>
        <select
          className="border rounded-xl p-2"
          value={filters.estado}
          onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
        >
          <option value="">Filtrar por estado</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
      </div>

      {/* Total de resultados */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Total de resultados: {filteredUsers.length}
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {users.length === 0
              ? 'Aún no hay usuarios creados en el sistema.'
              : 'No se encontraron usuarios con los criterios seleccionados.'
            }
          </p>
          {users.length === 0 && (
            <Link
              to="/users/create"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Crear primer usuario
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Tabla de usuarios */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Apellido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Correo Electrónico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {paginated.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.correo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                        onClick={() => console.log("Ver usuario", user.id)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-2 text-gray-700 dark:text-gray-300">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}