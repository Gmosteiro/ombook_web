import { useOutletContext } from "react-router";
import { Course } from "../types/types";

type Ctx = { course: Course };

export default function CourseStudents() {
  const { course } = useOutletContext<Ctx>();

  // Ejemplo: course puede tener un arreglo estudiantes (si no, muestra mensaje)
  const students = (course as any).estudiantes || [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Estudiantes Matriculados</h1>

      {students.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No hay estudiantes registrados (mock)</p>
      ) : (
        <ul className="space-y-2">
          {students.map((s: any) => (
            <li key={s.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="font-medium">{s.nombre}</div>
              <div className="text-sm text-gray-500">{s.documento}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
