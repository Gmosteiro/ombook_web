import type { Course } from "../types/types";

interface CourseTaskSubmissionsProps {
  course: Course;
  tareaId: string;
}

export default function CourseTaskSubmissions({ course, tareaId }: CourseTaskSubmissionsProps) {

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-700 dark:text-slate-300 min-h-screen p-4">
      <main className="w-full max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">

          {/* HEADER */}
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {course?.nombre || course?.id} — Tarea {tareaId}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-medium px-3 py-1 rounded-full">
                <span className="material-icons text-base">check</span>
                Hecho
              </span>

              <div className="text-slate-500 dark:text-slate-400">
                <p>
                  <span className="font-semibold">Apertura:</span> miércoles, 8 de octubre de 2025, 00:00
                </p>
                <p>
                  <span className="font-semibold">Cierre:</span> lunes, 13 de octubre de 2025, 23:59
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="p-6 md:p-8">
            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button className="w-full sm:w-auto flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors">
                <span className="material-icons text-lg">edit</span>
                Editar entrega
              </button>

              <button className="w-full sm:w-auto flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors">
                <span className="material-icons text-lg">delete</span>
                Borrar entrega
              </button>
            </div>

            {/* STATE TITLE */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Estado de la entrega
            </h2>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">

                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-1/3 sm:w-1/4">
                      Grupo
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                      Grupo 1
                    </td>
                  </tr>

                  <tr className="bg-green-50 dark:bg-green-900/20">
                    <td className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                      Estado de la entrega
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-800 dark:text-green-300">
                      Enviado para calificar
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                      Estado de la calificación
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                      Sin calificar
                    </td>
                  </tr>

                  <tr className="bg-green-50 dark:bg-green-900/20">
                    <td className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                      Tiempo restante
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-800 dark:text-green-300">
                      La tarea fue enviada 1 día 2 horas antes de la fecha límite
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                      Última modificación
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                      domingo, 12 de octubre de 2025, 21:05
                    </td>
                  </tr>

                  {/* FILES */}
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 align-top pt-4">
                      Archivos enviados
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-3">
                        <li>
                          <a
                            href="#"
                            className="flex items-center gap-3 text-blue-600 dark:text-primary hover:underline"
                          >
                            <img
                              className="w-6 h-6 flex-shrink-0"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8n_vOBHb8h0Xau_dCyxCz6czwBGH1V0JCjRrfYbJ45k7SF5rnOPdTWAM3I5DESKHkc_Sx57eF559g4szpMg7WGsD4gXuwZb-dgH4b0UwjO64vQQ0Ls7yapeXrYPK4dyS02X4vd-OMyDf1xIJ1lJUaBuCvLTAYeKrGiyqxEm6hFwU8wEu0M9on-mi0x9lrXa7T5Btkhpxuno5zTyQ6Q4Dty-t5-wCyNFuVwPGKH2nQ5SYgiF8CVwgmUHpzyRPL53ZWpDKgGnQxJJo"
                              alt=""
                            />
                            <span className="truncate">
                              Documento de Arquitectura de Software.docx
                              <span className="ml-2 text-slate-500 dark:text-slate-400 text-xs">
                                12 de octubre de 2025, 21:05
                              </span>
                            </span>
                          </a>
                        </li>

                        <li>
                          <a
                            href="#"
                            className="flex items-center gap-3 text-blue-600 dark:text-primary hover:underline"
                          >
                            <img
                              className="w-6 h-6 flex-shrink-0"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdeQhTIauZPNb0MV7bMuc-jFZFCCtj81S9VHbrtQd7snRGVwE75JhBwQty_AydXQNPU35Jn94UcfyXD8GOa9pcLiHUds1Tm-lp5veFywZ7b4Y5u68_yZg6oOxnyF5Do7B_RXaPvWZUKrdEn3swmrYvyOqSQ9hDT0RHvtG4oHKQ9hy9ttgSXM7i3Bdeyjpl5ukFcafXREefxfgRNfUUbDZvBcEOpETq8i_BI8M3FNMfIOrDjuU-Nbe-qMmLlsvtXU8Ffdf_BrAX274"
                              alt=""
                            />
                            <span className="truncate">
                              Documento de Arquitectura de Software.pdf
                              <span className="ml-2 text-slate-500 dark:text-slate-400 text-xs">
                                12 de octubre de 2025, 21:05
                              </span>
                            </span>
                          </a>
                        </li>
                      </ul>
                    </td>
                  </tr>

                  {/* COMMENTS */}
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                      Comentarios de la entrega
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href="#"
                        className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-primary hover:underline"
                      >
                        <span className="material-icons text-xl">play_arrow</span>
                        Comentarios (0)
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
