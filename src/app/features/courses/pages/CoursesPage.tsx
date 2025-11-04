import { useState, useEffect } from "react";
import { FilterBar } from "../components/general/FilterBar";
import { CourseCard } from "../components/general/CourseCard";
import { Pagination } from "../components/general/Pagination";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { UserRole } from "../../auth/types";
import { Course } from "../types/types";
import { useCoursesApi } from "../hooks/useCoursesApi";
import UserActionsMenu from "../../common/components/UserActionsMenu";
import { useNavigate } from "react-router";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR, UserRole.PROFESOR, UserRole.ESTUDIANTE]);

export interface Filters {
  search: string;
  status: string;
  teacher: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    teacher: '',
  });
  const [page, setPage] = useState(1);
  const coursesPerPage = 9;

  const { loadCourses, isLoading: loading, error } = useCoursesApi();
  const navigate = useNavigate();

  // Cargar cursos al montar el componente
  useEffect(() => {
    const fetchCourses = async () => {
      const cursos = await loadCourses('listar');
      if (cursos) {
        setCourses(cursos);
      }
    };

    fetchCourses();
  }, []);

  // Filtrar cursos cuando cambien los filtros o los cursos
  useEffect(() => {

    if (filters.search.trim() === '' && filters.status === '') {
      setFilteredCourses(courses);
      return;
    }

    let filtered = courses.filter(course => {
      const matchesSearch = !filters.search ||
        course.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.codigo.toLowerCase().includes(filters.search.toLowerCase())

      const matchesStatus = !filters.status || course.estadoCurso === filters.status;

      return matchesSearch && matchesStatus;
    });

    setFilteredCourses(filtered);
    setPage(1); // Reset page when filters change
  }, [courses, filters]);

  // Función para eliminar curso de la lista local
  const handleCourseDeleted = (courseId: number) => {
    setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
  };

  // Calcular paginación
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (page - 1) * coursesPerPage;
  const paginated = filteredCourses.slice(startIndex, startIndex + coursesPerPage);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando cursos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Error al cargar cursos
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
        <h1 className="text-2xl font-semibold">Cursos</h1>
        <UserActionsMenu
          options={[
            { label: "Crear Curso", onClick: () => navigate('/courses/create') },
            { label: "Eliminar Masivo", onClick: () => navigate('/courses/delete-bulk') }
          ]}
        />
      </div>

      <FilterBar filters={filters} setFilters={setFilters} />

      {filteredCourses.length === 0 ? (
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
            {courses.length === 0
              ? 'Aún no hay cursos creados en el sistema.'
              : 'No se encontraron cursos con los criterios seleccionados.'
            }
          </p>
          {courses.length === 0 && (
            <button
              onClick={() => window.location.href = '/courses/create'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Crear primer curso
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onDeleted={() => handleCourseDeleted(course.id)}
              />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

    </div>
  );
}


