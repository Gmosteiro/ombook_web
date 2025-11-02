import { useEffect, useState } from "react";
import { useParams } from "react-router";
import CourseSidebar from "../components/CourseSidebar";
import CourseContentLayout from "../components/CourseContentLayout";
import { Course } from "../types/types";
import { API_URL } from "~/features/common/utils/Utils";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de curso inválido");
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        // intento a API real
        const res = await fetch(`${API_URL}/courses/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.warn("Error al obtener curso desde API, usando mock. Detalle:", err);
        // Fallback: mock local para desarrollo / pruebas
        const mock: Course = {
          id: id,
          nombre: `Curso ${id}`,
          codigo: `C-${id}`,
          descripcion: "Descripción de ejemplo (mock)",
          periodoAcademico: "2025 - 1",
          estadoCurso: "ACTIVO",
          docentesAsignados: [{ id: "d1", nombre: "Dra. Ejemplo" }],
          // añade otros campos que tu type Course requiera...
        } as Course;
        setCourse(mock);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Cargando curso...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!course) {
    return <div className="p-6 text-center text-gray-500">Curso no encontrado.</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CourseSidebar course={course} />
      <main className="flex-1 p-6">
        <CourseContentLayout course={course} />
      </main>
    </div>
  );
}
