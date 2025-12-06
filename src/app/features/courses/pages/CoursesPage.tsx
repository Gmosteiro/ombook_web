import { useNavigate, useLoaderData, useSearchParams } from "react-router";
import { useRevalidator } from "react-router";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { UserRole } from "../../auth/types";
import { PaginatorResponseCursoListadoResponse, CourseStatus, CursoListadoResponse } from "../../../routes/api.courses.server";
import { UsuarioListaResponse } from "../../../routes/api.users.server";
import UserActionsMenu from "../../common/components/UserActionsMenu";
import { FilterBar, Filters } from "../components/general/FilterBar";
import { CourseCard } from "../components/general/CourseCard";
import { Pagination } from "../components/general/Pagination";
import { useState } from "react";

export const loader = async (args: any) => {
  await requireRoleLoader([UserRole.ADMINISTRADOR, UserRole.PROFESOR, UserRole.ESTUDIANTE])(args);

  const { getCursos } = await import("../../../routes/api.courses.server");
  const { getProfesores } = await import("../../../routes/api.users.server");
  const { getUserRole } = await import("../../../services/session.server");

  const url = new URL(args.request.url);
  const searchParam = url.searchParams.get("search") || undefined;
  const estado = url.searchParams.get("status") as CourseStatus || undefined;
  const teacher = url.searchParams.get("teacher") || undefined;
  const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 0;
  const size = url.searchParams.get("size") ? Number(url.searchParams.get("size")) : 9;

  // Solo aplicar búsqueda si tiene 3 o más caracteres
  const q = searchParam && searchParam.length >= 3 ? searchParam : undefined;

  const userRole = await getUserRole(args.request);

  let profesores: UsuarioListaResponse[] = [];
  let showTeacherFilter = true;

  if (userRole === UserRole.ADMINISTRADOR) {
    profesores = await getProfesores(args.request);
    showTeacherFilter = true;
  } else {
    showTeacherFilter = false;
  }

  const sort = url.searchParams.getAll("sort");
  const cursos = await getCursos(args.request, { q, estado, profesorId: teacher ? Number(teacher) : undefined, page, size, sort });

  // Convertir page de 0-indexed (API) a 1-indexed (UI)
  const currentPage = page + 1;

  return {
    cursos,
    profesores,
    showTeacherFilter,
    filters: { search: searchParam || "", status: estado || "", teacher: teacher || "" },
    page: currentPage,
    size,
    userRole,
  };
};

export const action = async ({ request }: { request: Request }) => {
  const { deleteCurso } = await import("../../../routes/api.courses.server");

  const formData = await request.formData();
  const courseId = formData.get("courseId");
  if (!courseId) return null;

  try {
    await deleteCurso(request, Number(courseId));
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Error al eliminar el curso" };
  }
};

export function meta() {
  return [
    { title: "Ombook | Cursos" }
  ];
}

export default function CoursesPage() {
  const { cursos, profesores, filters, page, showTeacherFilter, userRole } = useLoaderData() as {
    cursos: PaginatorResponseCursoListadoResponse;
    profesores: UsuarioListaResponse[];
    filters: Filters;
    page: number;
    size: number;
    showTeacherFilter: boolean;
    userRole: UserRole;
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [order, setOrder] = useState(searchParams.get("sort") || "fechaCreacion,desc");
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const setFilters = (newFilters: Filters) => {
    const params = new URLSearchParams(searchParams);

    // Solo aplicar búsqueda si tiene 3+ caracteres o está vacío
    if (newFilters.search === "" || newFilters.search.length >= 3) {
      if (newFilters.search) {
        params.set("search", newFilters.search);
      } else {
        params.delete("search");
      }
    }

    if (newFilters.status) {
      params.set("status", newFilters.status);
    } else {
      params.delete("status");
    }

    if (newFilters.teacher) {
      params.set("teacher", newFilters.teacher);
    } else {
      params.delete("teacher");
    }

    params.set("page", "0");
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    // Convertir de 1-indexed (UI) a 0-indexed (API)
    params.set("page", (newPage - 1).toString());
    setSearchParams(params);
  };

  const allCourses: CursoListadoResponse[] = cursos.content ?? [];
  const totalPages = cursos.totalPages || 1;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Cursos</h1>
        <UserActionsMenu
          options={[
            { label: "Crear Curso", onClick: () => navigate('/courses/create'), roles: [UserRole.ADMINISTRADOR] },
            { label: "Eliminar Masivo", onClick: () => navigate('/courses/delete-bulk'), roles: [UserRole.ADMINISTRADOR] }
          ]}
        />
      </div>

      <div className="flex gap-4 mb-4 items-center">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          teachers={profesores}
          showTeacherFilter={showTeacherFilter}
          order={order}
          setOrder={(value) => {
            const params = new URLSearchParams(searchParams);
            params.set("sort", value);
            params.set("page", "0");
            setSearchParams(params);
            setOrder(value);
          }}
        />
      </div>

      {allCourses.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No se encontraron cursos
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {cursos.totalElements === 0
              ? 'Aún no hay cursos creados en el sistema.'
              : 'No se encontraron cursos con los criterios seleccionados.'
            }
          </p>
          {cursos.totalElements === 0 && userRole === UserRole.ADMINISTRADOR && (
            <button
              onClick={() => navigate('/courses/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Crear primer curso
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onDeleted={() => revalidator.revalidate()}
              />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}


