import { useState, useEffect } from "react";
import ConfirmationDialog from "../../../common/components/ui/ConfirmationDialog";
import { useNavigate, useFetcher, useLoaderData } from "react-router";
import { CursoListadoResponse } from "../../../../routes/api.courses.server";
import { UserRole } from "../../../auth/types"; // Asegúrate de importar esto

interface CourseCardProps {
  course: CursoListadoResponse;
  onDeleted?: () => void;
}

export const CourseCard = ({ course, onDeleted }: CourseCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fetcher = useFetcher();
  const isDeleting = fetcher.state === "submitting";
  const error = fetcher.data?.error;
  const navigate = useNavigate();

  // Obtiene el rol del loader de la ruta
  const { userRole } = useLoaderData() as { userRole: UserRole };

  const handleDelete = () => {
    fetcher.submit(
      (() => {
        const formData = new FormData();
        formData.append("courseId", String(course.id));
        return formData;
      })(),
      { method: "post", action: "/courses" }
    );
  };

  // Efecto para cerrar el diálogo y notificar al padre si fue exitoso
  useEffect(() => {
    if (fetcher.data?.success) {
      setShowDeleteDialog(false);
      onDeleted?.();
    }
  }, [fetcher.data, onDeleted]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "ACTIVO":
        return "ombook-badge-green";
      case "INACTIVO":
        return "bg-yellow-100 text-yellow-800";
      case "ELIMINADO":
        return "ombook-badge-brown";
      default:
        return "bg-gray-100 ombook-text-gray";
    }
  };

  return (
    <>
      <div className="ombook-card p-0 overflow-hidden">

        <img
          src={course?.imagenUrl}
          alt={course.nombre}
          className="w-full h-48 object-cover"
        />

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="ombook-heading ombook-heading-sm ombook-text-gray">
              {course.nombre}
            </h3>
            <span className={`ombook-badge ${getStatusColor(course.estadoCurso)}`}>
              {course.estadoCurso}
            </span>
          </div>

          <p className="text-sm ombook-text-gray mb-1">
            <span className="font-medium">Código:</span> {course.codigo}
          </p>

          <p className="text-sm ombook-text-gray mb-2">
            <span className="font-medium">Período:</span> {course.periodoAcademico}
          </p>

          <p className="text-sm ombook-text-gray mb-3">
            <span className="font-medium">Profesores:</span> {course.docentesAsignados ? course.docentesAsignados.map(p => p.nombre).join(', ') : 'N/A'}
          </p>

          <p className="text-sm ombook-text-gray mb-4 line-clamp-2">
            <span className="font-medium">Descripcion:</span> {course.descripcion}

          </p>

          {error && (
            <div className="mb-3 text-sm bg-red-50 p-2 rounded text-red-600">
              {error}
            </div>
          )}

          {course.estadoCurso !== "ELIMINADO" && (
            <div className="flex gap-2">
              <button
                className="flex-1 ombook-btn ombook-btn-primary text-sm"
                onClick={() => navigate(`/courses/${course.id}/general`)}
              >
                Ver Detalles
              </button>

              {userRole === UserRole.ADMINISTRADOR && (
                <button
                  className="ombook-btn ombook-btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "..." : "Eliminar"}
                </button>
              )}
            </div>
          )}
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
