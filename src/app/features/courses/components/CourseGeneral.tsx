import { useOutletContext } from "react-router";
import { Course } from "../types/types";

type Ctx = { course: Course };

export default function CourseGeneral() {
  const { course } = useOutletContext<Ctx>();

  return (
    <div>
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
  );
}
