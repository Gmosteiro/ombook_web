import { useOutletContext, useLoaderData, type LoaderFunctionArgs, type ActionFunctionArgs, useFetcher } from "react-router";
import { useState, useEffect } from "react";
import { Course, CreatePaginaRequest } from "../../types/types";
import { PaginaTematica } from "../PaginaTematica";
import {
  getPaginasTematicas,
  createPaginaTematica,
  updatePaginaTematica,
  uploadRecursoPagina,
  deleteRecursoPagina,
  getRecursoUrl,
} from "~/routes/api.paginasTematicas";


export async function loader({ params, request }: LoaderFunctionArgs) {
  const { getUserRole } = await import("~/services/session.server");
  const cursoId = parseInt(params.id || '0');

  if (!cursoId) {
    throw new Error("Course ID is required");
  }

  try {
    const userRole = await getUserRole(request);
    const paginas = await getPaginasTematicas(request, cursoId);

    return {
      paginas,
      isProfesor: userRole === 'PROFESOR'
    };
  } catch (err) {
    console.error("Error in loader:", err);
    return {
      paginas: [],
      isProfesor: false
    };
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { redirect } = await import("react-router");
  const cursoId = parseInt(params.id || '0');
  if (!cursoId) {
    throw new Error("Course ID is required");
  }

  const formData = await request.formData();
  const _action = formData.get("_action") as string;

  try {
    switch (_action) {
      case "createPagina": {
        const titulo = formData.get("titulo") as string;
        const descripcion = formData.get("descripcion") as string;
        const fechaProgramada = formData.get("fechaProgramada") as string;

        await createPaginaTematica(request, cursoId, {
          titulo,
          contenido: descripcion,
          fechaProgramada: fechaProgramada || null,
        });

        return redirect(`/courses/${cursoId}/general`);
      }

      case "updatePagina": {
        const paginaId = parseInt(formData.get("paginaId") as string);
        const titulo = formData.get("titulo") as string;
        const fechaProgramada = formData.get("fechaProgramada") as string;

        await updatePaginaTematica(request, cursoId, paginaId, {
          titulo,
          fechaProgramada: fechaProgramada || null,
        });

        return redirect(`/courses/${cursoId}/general`);
      }

      case "uploadRecurso": {
        const paginaId = parseInt(formData.get("paginaId") as string);
        const nombre = formData.get("nombre") as string;
        const archivo = formData.get("archivo") as File;

        await uploadRecursoPagina(request, cursoId, paginaId, nombre, archivo);
        return redirect(`/courses/${cursoId}/general`);
      }

      case "deleteRecurso": {
        const recursoId = parseInt(formData.get("recursoId") as string);

        await deleteRecursoPagina(request, cursoId, recursoId);
        return redirect(`/courses/${cursoId}/general`);
      }

      case "downloadRecurso": {
        const recursoId = parseInt(formData.get("recursoId") as string);

        const url = await getRecursoUrl(request, cursoId, recursoId);
        return { url };
      }

      default:
        return { error: "Unknown action" };
    }
  } catch (error) {
    console.error("Error in action with: " + _action, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

type Ctx = { course: Course };

export default function CourseGeneral() {
  const context = useOutletContext<Ctx>();
  const course = context?.course;
  const fetcher = useFetcher();
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPage] = useState<Partial<CreatePaginaRequest>>({
    titulo: "",
    descripcion: "",
    fechaProgramada: ""
  });

  const { paginas, isProfesor } = useLoaderData<typeof loader>();

  if (!course) {
    return <div className="text-center text-gray-500">Cargando información del curso...</div>;
  }

  const handleUploadRecurso = async (paginaId: number, nombre: string, file: File) => {
    if (!course?.id) return;

    const formData = new FormData();
    formData.append('_action', 'uploadRecurso');
    formData.append('paginaId', paginaId.toString());
    formData.append('nombre', nombre);
    formData.append('archivo', file);

    try {
      await fetch(`/courses/${course.id}/general`, {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.error('Error uploading recurso:', err);
    }
  };

  const handleDeleteRecurso = async (recursoId: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este recurso?")) return;
    if (!course?.id) return;

    const formData = new FormData();
    formData.append('_action', 'deleteRecurso');
    formData.append('recursoId', recursoId.toString());

    try {
      await fetch(`/courses/${course.id}/general`, {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.error('Error deleting recurso:', err);
    }
  };

  const handleDownloadRecurso = async (recursoId: number) => {
    if (!course?.id) return;

    const formData = new FormData();
    formData.append('_action', 'downloadRecurso');
    formData.append('recursoId', recursoId.toString());

    fetcher.submit(formData, {
      method: 'POST',
      action: `/courses/${course.id}/general`,
    });
  };

  // Abrir URL cuando fetcher devuelva el resultado
  useEffect(() => {
    if (fetcher.data?.url) {
      window.open(fetcher.data.url, '_blank');
    }
  }, [fetcher.data]);

  const handleUpdatePagina = async (paginaId: number, updatedData: { titulo: string; fechaProgramada: string | null }) => {
    if (!course?.id) return;

    const formData = new FormData();
    formData.append('_action', 'updatePagina');
    formData.append('paginaId', paginaId.toString());
    formData.append('titulo', updatedData.titulo);
    formData.append('fechaProgramada', updatedData.fechaProgramada || '');

    try {
      await fetch(`/courses/${course.id}/general`, {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.error('Error updating pagina:', err);
      throw err;
    }
  };

  return (
    <div>
      <div className="ombook-card mb-8">
        <h1 className="ombook-heading ombook-heading-lg ombook-text-green mb-4">Información General</h1>
        <p className="ombook-text-gray mb-4">
          <span className="font-medium">Descripción:</span> {course.descripcion}
        </p>
        <p className="ombook-text-gray mb-2">
          <span className="font-medium">Período:</span> {course.periodoAcademico}
        </p>
        <p className="ombook-text-gray mb-2">
          <span className="font-medium">Profesores:</span>{" "}
          {course.docentesAsignados?.map(p => p.nombre).join(", ") || "N/A"}
        </p>
      </div>

      {/* Secciones del curso */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="ombook-heading ombook-heading-md ombook-text-brown">Páginas del Curso</h2>
          {isProfesor && (
            <button
              onClick={() => setShowNewPage(true)}
              className="ombook-btn ombook-btn-primary"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Página
            </button>
          )}
        </div>

        {showNewPage && (
          <form method="post" className="ombook-card mb-6">
            <input type="hidden" name="_action" value="createPagina" />
            <div className="space-y-4">
              <div>
                <label htmlFor="titulo" className="ombook-label">
                  Título
                </label>
                <input
                  type="text"
                  name="titulo"
                  id="titulo"
                  defaultValue={newPage.titulo}
                  className="ombook-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="descripcion" className="ombook-label">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  id="descripcion"
                  defaultValue={newPage.descripcion}
                  rows={4}
                  className="ombook-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="fechaProgramada" className="ombook-label">
                  Fecha Programada
                </label>
                <input
                  type="datetime-local"
                  name="fechaProgramada"
                  id="fechaProgramada"
                  defaultValue={newPage.fechaProgramada || ''}
                  className="ombook-input"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewPage(false)}
                  className="ombook-btn ombook-btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="ombook-btn ombook-btn-primary"
                >
                  Crear Página
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {paginas.map(pagina => (
            <PaginaTematica
              key={pagina.id}
              pagina={pagina}
              onUploadRecurso={(nombre, file) => handleUploadRecurso(pagina.id, nombre, file)}
              onDeleteRecurso={handleDeleteRecurso}
              onDownloadRecurso={handleDownloadRecurso}
              onUpdatePagina={handleUpdatePagina}
              isProfesor={isProfesor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
