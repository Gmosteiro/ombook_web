import { useNavigate, useLoaderData, useSearchParams } from "react-router";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { UserRole, UserStatus } from "../../auth/types";
import { getUsers, PaginatorResponseUsuarioListaResponse, UsuarioListaResponse } from "../../../routes/api.users";
import UserActionsMenu from "../../common/components/UserActionsMenu";
import { getUserRole } from "../../../services/session.server";

export const loader = async (args: any) => {
  await requireRoleLoader([UserRole.ADMINISTRADOR])(args);

  const url = new URL(args.request.url);
  const q = url.searchParams.get("search") || undefined;
  const rol = url.searchParams.get("rol") as UserRole | undefined;
  const estado = url.searchParams.get("estado") as UserStatus | undefined;
  const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined;
  const size = url.searchParams.get("size") ? Number(url.searchParams.get("size")) : undefined;

  const users = await getUsers(args.request, { q, rol, estado, page, size });
  const userRole = await getUserRole(args.request);

  return { userRole, users, filters: { search: q || "", rol: rol || "", estado: estado || "" }, page: page || 1 };
};

export function meta() {
  return [
    { title: `Ombook | Usuarios` }
  ];
}


export default function UsersPage() {
  const { users, filters, page } = useLoaderData() as {
    users: PaginatorResponseUsuarioListaResponse;
    filters: { search: string; rol: string; estado: string };
    page: number;
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handlers para filtros
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Resetear a la primera página si cambian los filtros
    params.set("page", "0");
    setSearchParams(params);
  };

  // Handler para paginación
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const allUsers: UsuarioListaResponse[] = users.content ?? [];
  const totalPages = users.totalPages || 1;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>
        <UserActionsMenu
          options={[
            {
              label: "Crear Usuario",
              onClick: () => navigate('/users/create'),
              roles: [UserRole.ADMINISTRADOR]
            },
          ]}
        />
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-8 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar por nombre, email o cédula..."
          className="flex-1 border border-gray-200 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-gray-700 bg-gray-50 min-w-[220px]"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg py-2 px-4 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          value={filters.rol}
          onChange={(e) => handleFilterChange("rol", e.target.value)}
        >
          <option value="">Filtrar por rol</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="PROFESOR">Profesor</option>
          <option value="ESTUDIANTE">Estudiante</option>
        </select>
        <select
          className="border border-gray-200 rounded-lg py-2 px-4 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          value={filters.estado}
          onChange={(e) => handleFilterChange("estado", e.target.value)}
        >
          <option value="">Filtrar por estado</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
      </div>

      {allUsers.length > 0 && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Total de resultados: {users.totalElements ?? allUsers.length}
        </div>
      )}

      {allUsers.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No se encontraron usuarios
          </h3>
        </div>
      ) : (
        <>
          {/* Tabla de usuarios */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apellido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo Electrónico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.correo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.rol}
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
          <div className="flex justify-between items-center mt-8 text-sm text-gray-600">
            <p>Mostrando página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium shadow-sm transition hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </button>
              <button
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium shadow-sm transition hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
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