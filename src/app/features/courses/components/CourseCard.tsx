import { useState } from "react";
import ConfirmationDialog from "../../common/components/ui/ConfirmationDialog";
import { useCoursesApi } from "../hooks/useCoursesApi";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  teacher: string;
  period: string;
  status: string;
  image: string;
  createdAt?: string;
}

interface CourseCardProps {
  course: Course;
  onDeleted?: () => void;
}

export const CourseCard = ({ course, onDeleted }: CourseCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteCourse, isLoading: isDeleting, error } = useCoursesApi();

  const handleDelete = async () => {
    const success = await deleteCourse(course.id);

    if (success) {
      console.log(`Curso eliminado: ${course.title}`);
      setShowDeleteDialog(false);
      onDeleted?.();
    } else {
      console.error("Error al eliminar el curso:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "INACTIVO":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "ELIMINADO":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {course.title}
            </h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                course.status
              )}`}
            >
              {course.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span className="font-medium">Código:</span> {course.code}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span className="font-medium">Período:</span> {course.period}
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span className="font-medium">Profesores:</span> {course.teacher}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Mostrar error si hay */}
          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={() => console.log("Ver curso", course.id)}
            >
              Ver Detalles
            </button>
            <button
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting || course.status === "ELIMINADO"}
            >
              {isDeleting ? "..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        title="Eliminar Curso"
        message={
          <div className="text-center">
            <p className="mb-2">
              ¿Estás seguro de que deseas eliminar el curso?
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              "{course.title}"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Código: {course.code}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
};
