import { useState, useEffect } from "react";
import { Course } from "../types/types";
import { API_URL } from "../../common/utils/Utils";

interface CourseSearchListProps {
    onSelect: (courseId: string) => void;
    isLoading?: boolean;
}

export default function CourseSearchList({ onSelect, isLoading }: CourseSearchListProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar cursos al montar el componente
    useEffect(() => {
        loadCourses();
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

    const loadCourses = async () => {
        setIsLoadingCourses(true);
        setError(null);

        try {
            // Nota: Necesitarás implementar el endpoint para listar cursos
            // Por ahora, usaré un endpoint genérico
            const response = await fetch(`${API_URL}/cursos`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    // 'Authorization': `Bearer ${jwtToken}`, // Descomentar si se requiere autenticación
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setCourses(data);
            setFilteredCourses(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar cursos");
            console.error("Error loading courses:", err);
        } finally {
            setIsLoadingCourses(false);
        }
    };

    const handleCourseSelect = (course: Course) => {
        setSelectedCourseId(course.id);
        onSelect(course.id);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES');
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
                        onClick={loadCourses}
                        className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
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
                                    onClick={() => handleCourseSelect(course)}
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
                                                <span>Inicio: {formatDate(course.fechaInicio)}</span>
                                                <span>Fin: {formatDate(course.fechaFin)}</span>
                                                <span className={`px-2 py-1 rounded-full ${course.activo
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                                    }`}>
                                                    {course.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>
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