import type { components } from "../../../../types/openapi";

// Utilidad para hacer campos obligatorios
type RequiredCourseFields = "id" | "nombre" | "codigo" | "descripcion" | "periodoAcademico";
type CourseOpenApi = components["schemas"]["CursoListadoResponse"];

// Tipo base para un curso (usa el generado por OpenAPI)
export type Course = Omit<CourseOpenApi, RequiredCourseFields> & {
    [K in RequiredCourseFields]: NonNullable<CourseOpenApi[K]>;
};

// Para crear un curso (usa el generado por OpenAPI)
export type CreateCourseData = components["schemas"]["CursoCreateRequest"];

// Para usuario/profesor (usa el generado por OpenAPI)
export type Usuario = components["schemas"]["Usuario"];
export type ProfesorResponsable = components["schemas"]["DocenteResumen"];

// Respuesta de creación de curso (auxiliar)
export interface CreateCourseResponse {
    success: boolean;
    message?: string;
    error?: string;
    data?: Course;
}

// Respuesta de eliminación de curso (auxiliar)
export interface DeleteCourseResponse {
    success: boolean;
    message?: string;
    error?: string;
}

// Respuesta de importación masiva (auxiliar)
export interface ImportCoursesResponse {
    success: boolean;
    message?: string;
    error?: string;
    data?: components["schemas"]["ResumenCargaMasiva"];
    errorDetails?: Array<{ linea: number; motivo: string }>;
}

// Para actualizar curso (puedes usar Partial si necesitas)
export type UpdateCourseData = Partial<CreateCourseData> & { id: number };

export interface UpdateCourseResponse {
    success: boolean;
    message?: string;
    error?: string;
}