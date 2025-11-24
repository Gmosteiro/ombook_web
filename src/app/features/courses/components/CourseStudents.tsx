import { useLoaderData, useOutletContext, useSearchParams, useNavigate } from "react-router";
import { Course } from "../types/types";
import UserActionsMenu from "../../common/components/UserActionsMenu";
import type { UsuarioListaResponse } from "../../../routes/api.users.server";
import { UserRole } from "../../auth/types";
import { useState, useEffect } from "react";

type Ctx = { course: Course };

export async function loader({ params, request }: { params: { id: string }, request: Request }) {
  const { getUsuariosVinculadosByCurso } = await import("../../../routes/api.users.server");
  const { getUserRole } = await import("../../../services/session.server");

  const { id } = params;
  const url = new URL(request.url);
  const q = url.searchParams.get("search") || "";
  const rol = url.searchParams.get("rol") || "";

  const userRole = await getUserRole(request);

  try {
    const paginator = await getUsuariosVinculadosByCurso(request, Number(id), {
      q,
      rol: rol as UserRole,
      // page, size, sort...
    });
    return {
      users: paginator.content ?? [],
      userRole,
    };
  } catch (err) {
    console.error("Error fetching users:", err);
    return {
      users: [],
      userRole,
    };
  }
}

export default function CourseStudents() {
  const context = useOutletContext<Ctx>();
  const course = context?.course;

  const { users } = useLoaderData() as { users: UsuarioListaResponse[] };
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const rol = searchParams.get("rol") || "";
  const [searchInput, setSearchInput] = useState(search);

  // Sincroniza el input con la URL si cambia desde afuera
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Cuando cambian los filtros, actualiza la URL (lo que dispara el loader)
  function handleFilterChange(field: string, value: string) {
    if (field === "search") {
      setSearchInput(value);

      // Solo buscar si está vacío o tiene 3+ caracteres
      if (value === "" || value.length >= 3) {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set(field, value);
        } else {
          params.delete(field);
        }
        setSearchParams(params);
      }
      return;
    }

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
        navigate(`/courses/${course.id}/enroll`);
      },
      roles: [UserRole.PROFESOR]
    },
    {
      label: "Desmatricular usuarios",
      onClick: () => {
        navigate(`/courses/${course.id}/unenroll`);
      },
      roles: [UserRole.PROFESOR]
    },
  ];

  if (!course) {
    return <div className="text-center text-gray-500">Cargando estudiantes...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="ombook-heading ombook-heading-lg ombook-text-green">Usuarios vinculados al curso</h1>
        <UserActionsMenu options={actions} />
      </div>

      {/* Filtros */}
      <div className="ombook-card mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar por nombre o correo (mín. 3 caracteres)..."
          className="ombook-input flex-1 min-w-[220px]"
          value={searchInput}
          onChange={e => handleFilterChange("search", e.target.value)}
        />
        <select
          className="ombook-input w-auto"
          value={rol}
          onChange={e => handleFilterChange("rol", e.target.value)}
        >
          <option value="">Filtrar por tipo</option>
          <option value="ESTUDIANTE">Estudiante</option>
          <option value="PROFESOR">Profesor</option>
        </select>
      </div>

      {/* Total de resultados */}
      <div className="mb-4 text-sm ombook-text-gray">
        Total de resultados: {users.length}
      </div>

      {users.length === 0 ? (
        <div className="text-center ombook-text-gray mt-12">
          <h3 className="ombook-heading ombook-heading-md mb-2">
            No se encontraron usuarios vinculados
          </h3>
        </div>
      ) : (
        <div className="ombook-card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="ombook-bg-gray-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium ombook-text-gray uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium ombook-text-gray uppercase tracking-wider">
                  Apellido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium ombook-text-gray uppercase tracking-wider">
                  Correo Electrónico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium ombook-text-gray uppercase tracking-wider">
                  Rol
                </th>
              </tr>
            </thead>
            <tbody className="ombook-border-gray divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm ombook-text-gray">
                    {user.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm ombook-text-gray">
                    {user.apellido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm ombook-text-gray">
                    {user.correo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm ombook-text-gray">
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
