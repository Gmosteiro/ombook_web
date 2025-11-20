import { useOutletContext, useLoaderData, LoaderFunctionArgs } from "react-router";
import { useState } from "react";
import { Course, CreatePaginaRequest, PaginaTematica as PaginaTematicaType } from "../../types/types";
import { PaginaTematica } from "../PaginaTematica";
import { getValidJWTToken, getUserRole } from "~/services/session.server";
import { apiFetch } from "../../../auth/utils/methods";
import { usePaginasTematicas } from "../../hooks/usePaginasTematicas";


export async function loader({ params, request }: LoaderFunctionArgs) {
  const { id } = params;
  try {
    const jwtToken = await getValidJWTToken(request);
    const userRole = await getUserRole(request);

    const res = await apiFetch(`/cursos/${id}/paginas`, {
      method: 'GET',
      secure: true,
      jwtToken
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const paginas: PaginaTematicaType[] = await res.json();

    const paginasConRecursos = await Promise.all(
      paginas.map(async (pagina) => {
        const recursosRes = await apiFetch(`/cursos/${id}/recursos?ownerRecurso=PAGINA&ownerId=${pagina.id}`, {
          method: 'GET',
          secure: true,
          jwtToken
        });
        let recursos = [];
        if (recursosRes.ok) {
          recursos = await recursosRes.json();
        }
        return { ...pagina, recursos };
      })
    );

    const paginasOrdenadas = paginasConRecursos.sort((a, b) => a.id - b.id);

    return {
      paginas: paginasOrdenadas,
      jwtToken,
      isProfesor: userRole === 'PROFESOR'
    };
  } catch (err) {
    console.error("Error fetching pages or resources:", err);
    return {
      paginas: [],
      jwtToken: '',
      isProfesor: false
    };
  }
}

type Ctx = { course: Course };

export default function CourseGeneral() {
  const context = useOutletContext<Ctx>();
  const course = context?.course;
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPage, setNewPage] = useState<Partial<CreatePaginaRequest>>({
    titulo: "",
    descripcion: "",
    fechaProgramada: ""
  });

  const loaderData = useLoaderData() as {
    paginas: PaginaTematicaType[];
    jwtToken: string;
    isProfesor: boolean;
  };
  const paginas = loaderData?.paginas || [];
  const jwtToken = loaderData?.jwtToken || '';
  const isProfesor = loaderData?.isProfesor || false;

  const {
    createPagina,
    uploadRecurso,
    deleteRecurso,
    getRecursoUrl
  } = usePaginasTematicas(course?.id || 0);

  if (!course) {
    return <div className="text-center text-gray-500">Cargando información del curso...</div>;
  }

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course.id || !newPage.titulo || !newPage.descripcion) return;

    const fechaProgramada = newPage.fechaProgramada
      ? new Date(newPage.fechaProgramada).toISOString().slice(0, 19)
      : null;

    try {
      await createPagina({
        titulo: newPage.titulo!,
        descripcion: newPage.descripcion!,
        fechaProgramada: fechaProgramada
      }, jwtToken);
      setNewPage({ titulo: "", descripcion: "", fechaProgramada: "" });
      setShowNewPage(false);
      window.location.reload(); // Recargar la página para obtener los datos actualizados
    } catch (err) {
      console.error("Error al crear página:", err);
    }
  };

  const handleUploadRecurso = async (paginaId: number, nombre: string, file: File) => {
    try {
      await uploadRecurso(paginaId, nombre, file, jwtToken);
      window.location.reload(); // Recargar la página para obtener los datos actualizados
    } catch (err) {
      console.error("Error al subir recurso:", err);
    }
  };

  const handleDeleteRecurso = async (paginaId: number, recursoId: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este recurso?")) return;

    try {
      await deleteRecurso(paginaId, recursoId, jwtToken);
      window.location.reload(); // Recargar la página para obtener los datos actualizados
    } catch (err) {
      console.error("Error al eliminar recurso:", err);
    }
  };

  const handleDownloadRecurso = async (recursoId: number) => {
    try {
      const url = await getRecursoUrl(recursoId, jwtToken);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error("Error al obtener URL de descarga:", err);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-semibold mb-4">Información General</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <span className="font-medium">Descripción:</span> {course.descripcion}
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          <span className="font-medium">Período:</span> {course.periodoAcademico}
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          <span className="font-medium">Profesores:</span>{" "}
          {course.docentesAsignados?.map(p => p.nombre).join(", ") || "N/A"}
        </p>
      </div>

      {/* Secciones del curso */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Páginas del Curso</h2>
          {isProfesor && (
            <button
              onClick={() => setShowNewPage(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Página
            </button>
          )}
        </div>

        {showNewPage && (
          <form onSubmit={handleCreatePage} className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  name="titulo"
                  id="titulo"
                  value={newPage.titulo}
                  onChange={e => setNewPage(prev => ({ ...prev, titulo: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  id="descripcion"
                  value={newPage.descripcion}
                  onChange={e => setNewPage(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="fechaProgramada" className="block text-sm font-medium text-gray-700">
                  Fecha Programada
                </label>
                <input
                  type="datetime-local"
                  name="fechaProgramada"
                  id="fechaProgramada"
                  value={newPage.fechaProgramada || ''}
                  onChange={e => setNewPage(prev => ({ ...prev, fechaProgramada: e.target.value || null }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewPage(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Crear Página
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Lista de páginas */}
        <div className="space-y-4">
          {paginas.map(pagina => (
            <PaginaTematica
              key={pagina.id}
              pagina={pagina}
              cursoId={course.id}
              jwtToken={jwtToken}
              onUploadRecurso={(nombre, file) => handleUploadRecurso(pagina.id, nombre, file)}
              onDeleteRecurso={(recursoId) => handleDeleteRecurso(pagina.id, recursoId)}
              onDownloadRecurso={handleDownloadRecurso}
              isProfesor={isProfesor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
