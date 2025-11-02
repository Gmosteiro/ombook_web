import { useLoaderData, useOutletContext } from "react-router-dom";
import { Course, UsuarioVinculado } from "../types/types";
import { apiFetch } from "../../auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";

type Ctx = { course: Course };

export async function loader({ params, request }: { params: { id: string }, request: Request }) {
  const { id } = params;
  try {
    const res = await apiFetch(`/cursos/usuarios-vinculados/${id}`, {
      method: 'GET',
      secure: true,
      jwtToken: await getValidJWTToken(request)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const users: UsuarioVinculado[] = await res.json();

    // console.log("Fetched users:", users);
    return users;
  } catch (err) {
    console.error("Error fetching users:", err);
    return [];
  }
}

export default function CourseStudents() {
  const context = useOutletContext<Ctx>();
  const course = context?.course;
  const users = useLoaderData() as UsuarioVinculado[];

  if (!course) {
    return <div className="text-center text-gray-500">Cargando estudiantes...</div>;
  }

  // Filtrar solo estudiantes
  const students = users.filter(u => u.rol === "ESTUDIANTE");

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Estudiantes Matriculados</h1>
      {students.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No hay estudiantes registrados</p>
      ) : (
        <ul className="space-y-2">
          {students.map((s) => (
            <li key={s.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="font-medium">{s.nombre} {s.apellido}</div>
              <div className="text-sm text-gray-500">{s.correo}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
