import { Link, useLocation, useParams } from "react-router";
import { Course } from "../types/types";
import {
  HomeIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  UsersIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

interface Props {
  course: Course;
}

const iconClasses = "w-5 h-5 mr-3";

export default function CourseSidebar({ course }: Props) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const base = `/courses/${id}`;

  const links = [
    { label: "General", path: `${base}/general`, icon: <HomeIcon className={iconClasses} /> },
    { label: "Materiales", path: `${base}/materials`, icon: <FolderIcon className={iconClasses} /> },
    { label: "Foro", path: `${base}/forums`, icon: <ChatBubbleLeftRightIcon className={iconClasses} /> },
    { label: "Anuncios", path: `${base}/announcements`, icon: <MegaphoneIcon className={iconClasses} /> },
    { label: "Usuarios", path: `${base}/students`, icon: <UsersIcon className={iconClasses} /> },
  ];

  // visibilidad para Gestión de Matrículas: sólo ADMIN/PROF
  const userRole = (typeof window !== "undefined" && (window as any).__APP_USER_ROLE) as string | undefined;
  const canManageEnrollments = userRole === "ADMINISTRADOR" || userRole === "PROFESOR";

  return (
    <aside className="w-64 bg-white border-r border-gray-200  flex flex-col mr-8 rounded-xl shadow">
      <div className="p-5 border-b border-gray-200 rounded-t-xl">
        <h2 className="text-lg font-semibold text-gray-900">
          {course.nombre}
        </h2>
        <p className="text-sm text-gray-500">{course.codigo}</p>
      </div>
      <nav className="flex-1 mt-4 flex flex-col space-y-1 px-3">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${location.pathname === link.path
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"}
            `}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
        {canManageEnrollments && (
          <Link
            to={`${base}/enrollment`}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-2
              ${location.pathname === `${base}/enrollment`
                ? "bg-blue-100 text-blue-700"
                : "text-blue-700 hover:bg-blue-50"}
            `}
          >
            <UserPlusIcon className={iconClasses} />
            <span className="font-semibold">Gestión de Matrículas</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}
