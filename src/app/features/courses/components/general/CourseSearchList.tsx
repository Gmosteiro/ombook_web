import { useState, useEffect } from "react";
import { useCoursesApi } from "../../hooks/useCoursesApi";
import { Course } from "../../types/types";

interface CourseSearchListProps {
    onSelect: (courseId: number) => void;
    isLoading?: boolean;
}

export default function CourseSearchList({ onSelect, isLoading }: CourseSearchListProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    const { loadCourses, isLoading: isLoadingCourses, error } = useCoursesApi();

    // Cargar cursos al montar el componente
    useEffect(() => {
        const fetchCourses = async () => {
            const data = await loadCourses('listar');
            if (data) {
                setCourses(data);
                setFilteredCourses(data);
            }
        };

        fetchCourses();
    }, []);

    // Filtrar cursos cuando cambia el término de búsqueda
    useEffect(() => {
        if (searchTerm) {
            const filtered = courses.filter(course =>
                course.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCourses(filtered);
        } else {
            setFilteredCourses(courses);
        }
    }, [searchTerm, courses]);

    const handleCourseSelect = (course: Course) => {

        if (course && course.id) {

            setSelectedCourseId(course.id);
            onSelect(course.id);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    const handleRetry = async () => {
        const data = await loadCourses('listar');
        if (data) {
            setCourses(data);
            setFilteredCourses(data);
        }
    };

    return (
        <div className="space-y-4">
            {/* Barra de búsqueda */}
            <div className="space-y-2">
                <label htmlFor="courseSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Buscar Curso
                </label>
                <input
                    id="courseSearch"
                    type="text"
                    placeholder="Buscar por nombre, código o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={isLoadingCourses}
                />
            </div>

            {/* Estado de carga */}
            {isLoadingCourses && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando cursos...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                        disabled={isLoadingCourses}
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {/* Lista de cursos */}
            {!isLoadingCourses && !error && (
                <div className="space-y-2">
                    {filteredCourses.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                            {searchTerm ? "No se encontraron cursos que coincidan con la búsqueda" : "No hay cursos disponibles"}
                        </p>
                    ) : (
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {filteredCourses.map((course) => (
                                <div
                                    key={course.id}
                                    onClick={() => !isLoading && handleCourseSelect(course)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedCourseId === course.id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {course.nombre}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Código: {course.codigo}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {course.descripcion}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                                <span>Período: {course.periodoAcademico || 'N/A'}</span>
                                                {course.fechaCreacion && (
                                                    <span>Creado: {formatDate(course.fechaCreacion)}</span>
                                                )}
                                                {course.estadoCurso && (
                                                    <span className={`px-2 py-1 rounded-full ${course.estadoCurso === 'ACTIVO'
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                                        }`}>
                                                        {course.estadoCurso}
                                                    </span>
                                                )}
                                            </div>
                                            {course.docentesAsignados && (
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    Profesores: {course.docentesAsignados.map(p => p.nombre).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Curso seleccionado */}
            {selectedCourseId && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        Curso seleccionado: {filteredCourses.find(c => c.id === selectedCourseId)?.nombre}
                    </p>
                </div>
            )}
        </div>
    );
}