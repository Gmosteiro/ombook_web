import { useState } from 'react';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export const useCoursesApi = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteCourse = async (courseId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('intent', 'deleteCourse');
            formData.append('courseId', courseId);

            const response = await fetch('/app/courses', {
                method: 'POST',
                body: formData,
            });

            const result: ApiResponse<any> = await response.json();

            if (!result.success) {
                setError(result.error || 'Error al eliminar el curso');
                return false;
            }

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const loadCourses = async (queryType: 'listar' | 'byId', courseId?: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('intent', 'loadCourses');
            formData.append('queryType', queryType);
            if (courseId) {
                formData.append('courseId', courseId);
            }

            const response = await fetch('/app/courses', {
                method: 'POST',
                body: formData,
            });

            const result: ApiResponse<any> = await response.json();

            if (!result.success) {
                setError(result.error || 'Error al cargar cursos');
                return null;
            }

            return result.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const createCourse = async (courseData: any): Promise<any> => {
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('intent', 'createCourse');
            formData.append('nombre', courseData.nombre);
            formData.append('codigo', courseData.codigo);
            formData.append('descripcion', courseData.descripcion);
            formData.append('periodoAcademico', courseData.periodoAcademico);
            formData.append('profesoresResponsables', JSON.stringify(courseData.profesoresResponsables || []));

            const response = await fetch('/app/courses', {
                method: 'POST',
                body: formData,
            });

            const result: ApiResponse<any> = await response.json();

            if (!result.success) {
                setError(result.error || 'Error al crear el curso');
                return null;
            }

            return result.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        deleteCourse,
        loadCourses,
        createCourse,
        isLoading,
        error,
    };
};