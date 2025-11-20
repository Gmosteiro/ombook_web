import { useOutletContext } from "react-router";
import type { Course } from "../types/types";
import { useParams } from "react-router";

export default function CourseTaskSubmissions() {
  const context = useOutletContext<{ course: Course }>();
  const course = context?.course;
  const params = useParams();
  const tareaId = params.tareaId;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Detalles de entregas</h2>
      <div className="bg-white rounded-md shadow p-4">
        <p className="text-sm text-gray-700">Placeholder: Aquí se mostrará la lista de estudiantes y sus entregas para la tarea.</p>
        <p className="mt-3 text-xs text-gray-500">Curso: {course?.nombre || course?.id} • Tarea ID: {tareaId}</p>
      </div>
    </div>
  );
}
