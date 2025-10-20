"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Course, getCoursesByRole } from "../api/coursesService";

interface CoursesContextProps {
  courses: Course[];
  loading: boolean;
}

const CoursesContext = createContext<CoursesContextProps>({
  courses: [],
  loading: true
});

export const CoursesProvider = ({ children }: { children: React.ReactNode }) => {

  const fakeUser = { name: "Ana Gómez", role: "Administrador" };
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fakeUser) {
      const data = getCoursesByRole(fakeUser.role, fakeUser.name);
      setCourses(data);
      setLoading(false);
    }
  }, [fakeUser]);

  return (
    <CoursesContext.Provider value={{ courses, loading }}>
      {children}
    </CoursesContext.Provider>
  );
};

export const useCoursesContext = () => useContext(CoursesContext);
