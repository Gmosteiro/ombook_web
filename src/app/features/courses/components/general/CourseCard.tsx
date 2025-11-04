import { useState } from "react";
import ConfirmationDialog from "../../../common/components/ui/ConfirmationDialog";
import { useCoursesApi } from "../../hooks/useCoursesApi";
import { Course } from "../../types/types";
import { useNavigate } from "react-router";

interface CourseCardProps {
  course: Course;
  onDeleted?: () => void;
}

export const CourseCard = ({ course, onDeleted }: CourseCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteCourse, isLoading: isDeleting, error } = useCoursesApi();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const success = await deleteCourse(course.id);

    if (success) {
      setShowDeleteDialog(false);
      onDeleted?.();
    } else {
      console.error("Error al eliminar el curso:", error);
    }
  };

  const getStatusColor = (status: string | undefined) => {
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


  const getRandomImageUrl = () => {
    const images = [
      "https://cdn.computerhoy.com/sites/navi.axelspringer.es/public/media/image/2018/11/cursos-online.jpg?tf=3840x",
      "https://vilmanunez.com/wp-content/uploads/2016/03/herramientas-y-recursos-para-crear-curso-online.png",
      "https://maxmultimedia.com.uy/wp-content/uploads/2025/10/curso-intensivo-de-informatica.jpg",
    ];
    return images[Math.floor(Math.random() * images.length)];
  }


  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">

        <img
          src={getRandomImageUrl()} //TODO
          alt={course.nombre}
          className="w-full h-48 object-cover rounded-t-xl"
        />

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {course.nombre}
            </h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                course.estadoCurso
              )}`}
            >
              {course.estadoCurso}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span className="font-medium">Código:</span> {course.codigo}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span className="font-medium">Período:</span> {course.periodoAcademico}
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span className="font-medium">Profesores:</span> {course.docentesAsignados ? course.docentesAsignados.map(p => p.nombre).join(', ') : 'N/A'}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            <span className="font-medium">Descripcion:</span> {course.descripcion}

          </p>

          {/* Mostrar error si hay */}
          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
              onClick={() => navigate(`/courses/${course.id}/general`)}
            >
              Ver Detalles
            </button>
            <button
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting || course.estadoCurso === "ELIMINADO"}
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
              "{course.nombre}"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Código: {course.codigo}
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
