import type { components } from "../../../../types/openapi";
import type { UsuarioListaResponse } from "../../../routes/api.users.server";

// Utilidad para hacer campos obligatorios
type RequiredCourseFields = "id" | "nombre" | "codigo" | "descripcion" | "periodoAcademico";
type CourseOpenApi = components["schemas"]["CursoListadoResponse"];

// Tipo base para un curso (usa el generado por OpenAPI)
export type Course = Omit<CourseOpenApi, RequiredCourseFields> & {
  [K in RequiredCourseFields]: NonNullable<CourseOpenApi[K]>;
};

// Interfaces para páginas temáticas
export interface PaginaTematica {
  id: number;
  titulo: string;
  descripcion: string;
  fechaProgramada: string;
  fechaCreacion: string;
  cursoId: number;
  creadorId: number;
  recursos?: Recurso[];
}

export interface CreatePaginaRequest {
  cursoId: number;
  titulo: string;
  descripcion: string;
  fechaProgramada?: string | null;
}

// Interfaces para recursos
export interface Recurso {
  id: number;
  nombreOriginal: string;
  ownerRecurso: "PAGINA" | "TAREA" | "ENTREGA";
  ownerId: number;
  contentType: string;
  sizeBytes: number;
  fechaSubida: string;
  subidoPorUsuarioId: number;
}

export interface RecursoUrlResponse {
  url: string;
  expiraEnSegundos: number;
}

export interface CreateRecursoRequest {
  ownerRecurso: "PAGINA" | "TAREA" | "ENTREGA";
  ownerId: number;
  nombre: string;
  archivo: File;
}

// Para crear un curso (usa el generado por OpenAPI)
export type CreateCourseData = components["schemas"]["CursoCreateRequest"];

// Para usuario/profesor (usa el generado por OpenAPI)
export type Usuario = components["schemas"]["Usuario"];
export type ProfesorResponsable = components["schemas"]["DocenteResumen"];

export type UsuarioVinculado = components["schemas"]["UsuarioVinculadoResponse"];

// Respuesta de creación de curso (auxiliar)
export interface CreateCourseResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: Course;
}

export type ImportMarksData = {
  csvFile: File;
  cursoId: number;
};

export type EnrollMasivaUserData = {
  csvFile: File;
  cursoId: number;
};

export type EnrollUserData = {
  estudianteId: number;
  cursoId: number;
};

export type EnrollUserResponse = {
  success?: boolean;
  error?: string;
  estudiantes?: UsuarioListaResponse[];
};

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

// Interfaces para tareas
export interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  fechaCreacion?: string;
  visibilidad?: string;
  cursoId?: number;
  creador?: number; // user id
}