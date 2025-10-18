export interface Course {
  id: number;
  title: string;
  teacher: string;
  status: string;
  period: string;
  image: string;
  isPublic: boolean;
}

const allCourses: Course[] = [
  { id: 1, title: "Desarrollo de Aplicaciones Web", teacher: "Ana Gómez", status: "Activo", period: "2024-1", image: "https://source.unsplash.com/600x400/?code", isPublic: true },
  { id: 2, title: "Bases de Datos Avanzadas", teacher: "Juan Pérez", status: "Activo", period: "2024-1", image: "https://source.unsplash.com/600x400/?database", isPublic: false },
  { id: 3, title: "Inteligencia Artificial", teacher: "Carlos Ruiz", status: "Archivado", period: "2023-2", image: "https://source.unsplash.com/600x400/?ai", isPublic: true },
  { id: 4, title: "Marketing Digital", teacher: "Laura Torres", status: "Activo", period: "2024-1", image: "https://source.unsplash.com/600x400/?marketing", isPublic: true },
  { id: 5, title: "Programación en Python", teacher: "Miguel Hernandez", status: "Activo", period: "2024-2", image: "https://source.unsplash.com/600x400/?python", isPublic: false },
  { id: 6, title: "Gestión de Proyectos", teacher: "Sofía Rodríguez", status: "Archivado", period: "2023-2", image: "https://source.unsplash.com/600x400/?project", isPublic: true }
];

export const getCoursesByRole = (role: string, userName: string): Course[] => {
  switch (role) {
    case "Administrador":
      return allCourses;
    case "Profesor":
      return allCourses.filter(c => c.teacher === userName);
    case "Estudiante":
      return allCourses.filter(c => c.isPublic);
    default:
      return [];
  }
};
