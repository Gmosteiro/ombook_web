import { useNavigate, useLoaderData, useSearchParams } from "react-router";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { UserRole } from "../../auth/types";
import { getCursos, PaginatorResponseCursoListadoResponse, CourseStatus, CursoListadoResponse } from "../../../routes/api.courses";
import UserActionsMenu from "../../common/components/UserActionsMenu";
import { FilterBar } from "../components/general/FilterBar";
import { CourseCard } from "../components/general/CourseCard";
import { Pagination } from "../components/general/Pagination";

export const loader = async (args: any) => {
  await requireRoleLoader([UserRole.ADMINISTRADOR, UserRole.PROFESOR, UserRole.ESTUDIANTE])(args);

  const url = new URL(args.request.url);
  const q = url.searchParams.get("search") || undefined;
  const estado = url.searchParams.get("status") as CourseStatus || undefined;
  const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 0;
  const size = url.searchParams.get("size") ? Number(url.searchParams.get("size")) : 9;

  const cursos = await getCursos(args.request, { q, estado, page, size });

  return {
    cursos,
    filters: { search: q || "", status: estado || "" },
    page: page,
    size: size,
  };
};

export default function CoursesPage() {
  const { cursos, filters, page /*, size*/ } = useLoaderData() as {
    cursos: PaginatorResponseCursoListadoResponse;
    filters: { search: string; status: string };
    page: number;
    size: number;
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
    params.set("page", "0");
    setSearchParams(params);
  };

  // Handler para paginación
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
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
            { label: "Crear Curso", onClick: () => navigate('/courses/create') },
            { label: "Eliminar Masivo", onClick: () => navigate('/courses/delete-bulk') }
          ]}
        />
      </div>

      <FilterBar
        filters={filters}
        setFilters={(newFilters) => {
          handleFilterChange("search", newFilters.search);
          handleFilterChange("status", newFilters.status);
        }}
      />

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
          {cursos.totalElements === 0 && (
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
                onDeleted={() => { /* Opcional: recargar o actualizar */ }}
              />
            ))}
          </div>
          <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}


