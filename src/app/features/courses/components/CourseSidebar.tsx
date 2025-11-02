import { Link, useLocation, useParams } from "react-router";
import { Course } from "../types/types";

interface Props {
  course: Course;
}

export default function CourseSidebar({ course }: Props) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const base = `/courses/${id}`;

  const links = [
    { label: "General", path: `${base}/general` },
    { label: "Materiales", path: `${base}/materials` },
    { label: "Foro", path: `${base}/forums` },
    { label: "Anuncios", path: `${base}/announcements` },
    { label: "Estudiantes Matriculados", path: `${base}/students` },
  ];

  // visibilidad para Gestión de Matrículas: sólo ADMIN/PROF (leer variable global explicada abajo)
  const userRole = (typeof window !== "undefined" && (window as any).__APP_USER_ROLE) as string | undefined;
  const canManageEnrollments = userRole === "ADMINISTRADOR" || userRole === "PROFESOR";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {course.nombre}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{course.codigo}</p>
      </div>

      <nav className="mt-4 flex flex-col space-y-1 px-3">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === link.path
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {link.label}
          </Link>
        ))}

        {canManageEnrollments && (
          <Link
            to={`${base}/enrollment`} // si quieres otra ruta, cámbiala y agrégala en routes.ts
            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === `${base}/enrollment`
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Gestión de Matrículas
          </Link>
        )}
      </nav>
    </aside>
  );
}
