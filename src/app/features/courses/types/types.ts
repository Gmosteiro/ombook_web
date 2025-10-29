// Tipos basados en la API OpenAPI
export interface CreateCourseData {
    nombre: string;
    codigo: string;
    descripcion: string;
    periodoAcademico: string;
    profesoresResponsables?: ProfesorResponsable[];
}

export interface ProfesorResponsable {
    id?: number;
    nombreCompleto?: string;
}

export interface CreateCourseResponse {
    success: boolean;
    message?: string;
    error?: string;
    data?: Course;
}

// Tipos para eliminar curso (no está en la API, mantengo el existente)
export interface DeleteCourseResponse {
    success: boolean;
    message?: string;
    error?: string;
}

// Tipos para importación masiva de cursos
export interface ImportCoursesResponse {
    success: boolean;
    message?: string;
    error?: string;
    data?: {
        total: number;
        correctos: number;
        errores: number;
        detalleErrores?: Array<{ linea: number; motivo: string }>;
    };
    errorDetails?: Array<{ linea: number; motivo: string }>;
}

// Tipo base para un curso (basado en la API)
export interface Course {
    id?: number;
    nombre: string;
    codigo: string;
    descripcion: string;
    periodoAcademico: string;
    fechaCreacion?: string;
    estadoCurso?: "ACTIVO" | "INACTIVO" | "ELIMINADO";
    idAdministrador?: number;
    profesoresResponsables?: Usuario[];
}

export interface Usuario {
    id?: number;
    nombre: string;
    apellido: string;
    cedula: string;
    correo: string;
    contrasenaHash: string;
    estado?: "ACTIVO" | "INACTIVO" | "BLOQUEADO";
    fotoPerfilUrl?: string;
    fechaNacimiento?: string;
    fechaCreacion?: string;
    ultimoLogin?: string;
    intentosFallidos?: number;
    rol?: "ADMINISTRADOR" | "PROFESOR" | "ESTUDIANTE";
}

// Tipos para actualizar curso
export interface UpdateCourseData extends Partial<CreateCourseData> {
    id: number;
}

export interface UpdateCourseResponse {
    success: boolean;
    message?: string;
    error?: string;
}