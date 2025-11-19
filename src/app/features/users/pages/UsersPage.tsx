import { useNavigate, useLoaderData, useSearchParams, useFetcher } from "react-router";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { UserRole, UserStatus } from "../../auth/types";
import { getUsers, PaginatorResponseUsuarioListaResponse, UsuarioListaResponse, UsuarioDetalleResponse } from "../../../routes/api.users";
import UserActionsMenu from "../../common/components/UserActionsMenu";
import { getUserRole } from "../../../services/session.server";
import { useState, useEffect } from "react";
import UserDetailModal from "../components/UserDetailModal";
import { Pagination } from "../../courses/components/general/Pagination";

export const loader = async (args: any) => {
  await requireRoleLoader([UserRole.ADMINISTRADOR])(args);

  const url = new URL(args.request.url);
  const searchParam = url.searchParams.get("search") || undefined;
  const rol = url.searchParams.get("rol") as UserRole | undefined;
  const estado = url.searchParams.get("estado") as UserStatus | undefined;
  const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined;
  const size = url.searchParams.get("size") ? Number(url.searchParams.get("size")) : undefined;

  // Solo aplicar búsqueda si tiene 3 o más caracteres
  const q = searchParam && searchParam.length >= 3 ? searchParam : undefined;

  const users = await getUsers(args.request, { q, rol, estado, page, size });
  const userRole = await getUserRole(args.request);

  // Convertir page de 0-indexed (API) a 1-indexed (UI)
  const currentPage = page !== undefined ? page + 1 : 1;

  return { userRole, users, filters: { search: searchParam || "", rol: rol || "", estado: estado || "" }, page: currentPage };
};

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const userId = formData.get("userId") as string;

  if (intent === "getUserDetail" && userId) {
    const { getUserById } = await import("../../../routes/api.users");
    try {
      const user = await getUserById(request, Number(userId));
      return { user };
    } catch (error: any) {
      return { error: error.message || "Error al obtener usuario" };
    }
  }

  return { error: "Intent no reconocido" };
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
  const [searchInput, setSearchInput] = useState(filters.search);
  const fetcher = useFetcher<{ user?: UsuarioDetalleResponse; error?: string }>();
  const [selectedUser, setSelectedUser] = useState<UsuarioDetalleResponse | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Cuando el fetcher devuelve datos del usuario, abrir el modal
  useEffect(() => {
    if (fetcher.data?.user) {
      setSelectedUser(fetcher.data.user);
      setShowModal(true);
    }
  }, [fetcher.data]);

  // Sincronizar el input con los filtros externos
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Handlers para filtros
  const handleFilterChange = (key: string, value: string) => {
    if (key === "search") {
      setSearchInput(value);

      // Solo buscar si está vacío o tiene 3+ caracteres
      if (value === "" || value.length >= 3) {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
        params.set("page", "0");
        setSearchParams(params);
      }
      return;
    }

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
    // Convertir de 1-indexed (UI) a 0-indexed (API)
    params.set("page", (newPage - 1).toString());
    setSearchParams(params);
  };

  // Handler para ver detalles de usuario
  const handleViewUser = (userId: number) => {
    const formData = new FormData();
    formData.append("intent", "getUserDetail");
    formData.append("userId", userId.toString());
    fetcher.submit(formData, { method: "POST" });
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
          placeholder="Buscar por nombre, email o cédula (mín. 3 caracteres)..."
          className="flex-1 border border-gray-200 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-gray-700 bg-gray-50 min-w-[220px]"
          value={searchInput}
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
                        onClick={() => handleViewUser(user.id!)}
                        disabled={fetcher.state === "submitting"}
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
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Modal de detalles de usuario */}
      <UserDetailModal
        open={showModal}
        user={selectedUser}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}