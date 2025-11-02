import { useLoaderData, useOutletContext, useSearchParams } from "react-router";
import { Course, UsuarioVinculado } from "../types/types";
import { apiFetch } from "../../auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";
import UserActionsMenu from "../../common/components/UserActionsMenu";

type Ctx = { course: Course };

export async function loader({ params, request }: { params: { id: string }, request: Request }) {
  const { id } = params;
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const rol = url.searchParams.get("rol") || "";

  try {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (rol) query.append("rol", rol);

    const res = await apiFetch(`/cursos/usuarios-vinculados/${id}?${query.toString()}`, {
      method: 'GET',
      secure: true,
      jwtToken: await getValidJWTToken(request)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const users: UsuarioVinculado[] = await res.json();
    return users;
  } catch (err) {
    console.error("Error fetching users:", err);
    return [];
  }
}

export default function CourseStudents() {
  const context = useOutletContext<Ctx>();
  const course = context?.course;
  const users = useLoaderData() as UsuarioVinculado[];

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const rol = searchParams.get("rol") || "";

  // Cuando cambian los filtros, actualiza la URL (lo que dispara el loader)
  function handleFilterChange(field: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(field, value);
    } else {
      params.delete(field);
    }
    setSearchParams(params);
  }

  // Acciones para el menú
  const actions = [
    {
      label: "Matricular usuarios",
      onClick: () => {
        // Aquí puedes abrir un modal, navegar o lo que necesites
        alert("Matricular usuarios");
      },
    },
    {
      label: "Desmatricular usuarios",
      onClick: () => {
        // Aquí puedes abrir un modal, navegar o lo que necesites
        alert("Desmatricular usuarios");
      },
    },
  ];

  if (!course) {
    return <div className="text-center text-gray-500">Cargando estudiantes...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Usuarios vinculados al curso</h1>
        <UserActionsMenu options={actions} />
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          className="flex-1 border border-gray-200 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-gray-700 bg-gray-50 min-w-[220px]"
          value={search}
          onChange={e => handleFilterChange("search", e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg py-2 px-4 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          value={rol}
          onChange={e => handleFilterChange("rol", e.target.value)}
        >
          <option value="">Filtrar por tipo</option>
          <option value="ESTUDIANTE">Estudiante</option>
          <option value="PROFESOR">Profesor</option>
        </select>
      </div>

      {/* Total de resultados */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Total de resultados: {users.length}
      </div>

      {users.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No se encontraron usuarios vinculados
          </h3>
        </div>
      ) : (
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
