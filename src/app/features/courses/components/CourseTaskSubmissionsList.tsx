import { useLoaderData, useOutletContext, Link, useParams } from "react-router";
import { useState } from "react";
import type { Course, Entrega } from "../types/types";

export async function loader({
  params,
  request
}: {
  params: { id: string; taskId: string };
  request: Request;
}) {
  const { getValidJWTToken } = await import("~/services/session.server");
  const { apiFetch } = await import("~/features/auth/utils/methods");

  const cursoId = params.id;
  const tareaId = params.taskId;

  try {
    const jwtToken = await getValidJWTToken(request);

    const res = await apiFetch(
      `/cursos/${cursoId}/tareas/${tareaId}/entregas`,
      {
        method: "GET",
        secure: true,
        jwtToken
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const submissions = await res.json();

    return {
      submissions
    };

  } catch (err) {
    console.error("Error fetching submissions:", err);

    return {
      submissions: []
    };
  }
}
// const handleDownloadSubmission = async (tareaId: number, entrega: Entrega) => {
//     if (cursoId) return;
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/cursos/${course.id}/tareas/${tareaId}/entregas/estudiantes/${entrega.estudianteId}/archivo`, {
//         headers: {
//           'Authorization': `Bearer ${jwtToken}`,
//         },
//       });
//       if (response.ok) {
//         const data = await response.json();
//         if (data.url) window.open(data.url, '_blank');
//       } else {
//         console.error('Error getting submission download url:', response.statusText);
//       }
//     } catch (err) {
//       console.error('Error getting submission download url:', err);
//     }
//   }; me puede servir despues
export default function CourseTaskSubmissionsList() {
  const { submissions } = useLoaderData() as { submissions: Entrega[] };
  const { course } = useOutletContext<{ course: Course }>();
  const params = useParams<{ id: string; taskId: string }>();
  const tareaId = params.taskId;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSubmissions = submissions.filter(submission => {
    const fullName = `${submission.nombre} ${submission.apellido}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-700 dark:text-slate-300 min-h-screen p-4">
      <main className="w-full max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">

          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {course?.nombre || course?.id} — Entregas de la Tarea {tareaId}
            </h1>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Buscar por nombre o apellido"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                aria-label="Filtrar por estado de entrega"
              >
                <option value="all">Todos los estados</option>
                <option value="ENVIADA">ENVIADA</option>
                <option value="CORREGIDA">CORREGIDA</option>
              </select>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Estudiante</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Fecha de Envío</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Calificación</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                        {submission.nombre} {submission.apellido}
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                        {submission.fechaEnvio ? new Date(submission.fechaEnvio).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-800 dark:text-green-300">
                        {submission.estado}
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                        {submission.calificacion ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`${submission.id}`} className="ombook-text-blue text-sm">Ver Detalles</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSubmissions.length === 0 && (
                <div className="text-gray-500 text-center py-4">No hay entregas.</div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}