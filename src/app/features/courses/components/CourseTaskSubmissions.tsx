import { useLoaderData, useOutletContext, useParams, Link } from "react-router";
import { useState } from "react";
import type { Course, EntregaDetalle } from "../types/types";
import { API_URL, formatDateDisplay } from "../../common/utils/Utils";
import type { UsuarioDetalleResponse } from "../../../routes/api.users.server";

export async function loader({
  params,
  request
}: {
  params: { id: string; taskId: string; entregaId: string };
  request: Request;
}) {
  const { getValidJWTToken, getUserRole } = await import("~/services/session.server");
  const { apiFetch } = await import("~/features/auth/utils/methods");
  const { getUserById } = await import("~/routes/api.users.server");

  const cursoId = params.id;
  const tareaId = params.taskId;
  const entregaId = params.entregaId;

  const jwtToken = await getValidJWTToken(request);
  const userRole = await getUserRole(request);
  try {

    const endpoint = `/cursos/${cursoId}/tareas/${tareaId}/entregas/${entregaId}`;
    const res = await apiFetch(
      endpoint,
      {
        method: "GET",
        secure: true,
        jwtToken
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const submission: EntregaDetalle = await res.json();

    let student: UsuarioDetalleResponse | null = null;
    if (submission.estudianteId) {
      try {
        student = await getUserById(request, submission.estudianteId);
      } catch (studentErr) {
        console.error("Error fetching student details:", studentErr);
      }
    }

    let downloadUrl: string | null = null;
    if (submission.recursoId) {
      try {
        const downloadRes = await apiFetch(
          `/cursos/${cursoId}/recursos/${submission.recursoId}/descargar-url`,
          {
            method: "GET",
            secure: true,
            jwtToken
          }
        );
        if (downloadRes.ok) {
          const downloadData = await downloadRes.json();
          downloadUrl = downloadData.url;
        } else {
          console.error("Error fetching download URL:", downloadRes.status);
        }
      } catch (downloadErr) {
        console.error("Error fetching download URL:", downloadErr);
      }
    }

    return new Response(
      JSON.stringify({
        submission,
        student,
        downloadUrl,
        userRole,
        jwtToken
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );

  } catch (err) {
    console.error("Error fetching submission detail:", err);

    return new Response(
      JSON.stringify({
        submission: null,
        student: null,
        downloadUrl: null,
        userRole: null,
        jwtToken: null
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  }
}

export default function CourseTaskSubmissions() {
  const { submission, student, downloadUrl, userRole, jwtToken } = useLoaderData() as { submission: EntregaDetalle | null; student: UsuarioDetalleResponse | null; downloadUrl: string | null; userRole: string | null; jwtToken: string | null };
  const { course } = useOutletContext<{ course: Course }>();
  const params = useParams<{ id: string; taskId: string; entregaId: string }>();
  const entregaId = params.entregaId;
  const cursoId = params.id;
  const tareaId = params.taskId;

  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [calificacion, setCalificacion] = useState('');
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      alert("URL de descarga no disponible");
    }
  };

  const handleGradeSubmission = async () => {
    if (!jwtToken || !submission) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/cursos/${cursoId}/tareas/${tareaId}/entregas/${entregaId}/corregir`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          calificacion: parseFloat(calificacion),
          comentario,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      window.location.reload();

      setIsGradingModalOpen(false);
      setCalificacion('');
      setComentario('');
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Error al calificar la entrega');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!submission) {
    return (
      <div className="font-display bg-background-light dark:bg-background-dark text-slate-700 dark:text-slate-300 min-h-screen p-4">
        <main className="w-full max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-red-600 dark:text-red-400">Error al cargar la entrega. Verifica que la URL sea correcta.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-700 dark:text-slate-300 min-h-screen p-4">
      <main className="w-full max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">

          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {course?.nombre || course?.id} — Detalle de la Entrega
              </h1>
              <Link
                to={`/courses/${cursoId}/tasks`}
                className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a las Tareas
              </Link>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Información del Estudiante
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Nombre del Estudiante:</span>
                    <p className="text-slate-800 dark:text-slate-200">
                      {student ? `${student.nombre} ${student.apellido}` : `ID: ${submission.estudianteId}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Detalles de la Entrega
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Fecha de Envío:</span>
                    <p className="text-slate-800 dark:text-slate-200">
                      {submission.fechaEnvio
                        ? formatDateDisplay(submission.fechaEnvio)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Estado:</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${submission.estado === 'ENVIADA'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                      {submission.estado}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Calificación:</span>
                    <p className="text-slate-800 dark:text-slate-200">
                      {submission.calificacion !== null && submission.calificacion !== undefined
                        ? `${submission.calificacion}/12`
                        : "Sin calificar"}
                    </p>
                  </div>
                  {userRole === 'PROFESOR' && (
                    <div className="mt-4">
                      <button
                        onClick={() => setIsGradingModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Calificar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Comentario
                </h3>
                <p className="text-slate-800 dark:text-slate-200">
                  {submission.comentario || "Sin comentario"}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Archivo Adjunto
                </h3>
                {submission.nombreArchivo ? (
                  <div className="flex items-center space-x-3">
                    <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <button
                        onClick={handleDownload}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline"
                      >
                        {submission.nombreArchivo}
                      </button>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Haz clic para descargar el archivo</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No hay archivo adjunto</p>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>

      {isGradingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Calificar Entrega
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Calificación (0-12)
                </label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  step="1"
                  value={calificacion}
                  onChange={(e) => setCalificacion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Ej: 8.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Comentario
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  rows={4}
                  placeholder="Comentario sobre la entrega..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsGradingModalOpen(false)}
                className="px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleGradeSubmission}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting || !calificacion.trim()}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
