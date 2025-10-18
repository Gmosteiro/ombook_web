import React from "react";
import { Course } from "../api/coursesService";

export const CourseCard = ({ course }: { course: Course }) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
    <img src={course.image} alt={course.title} className="w-full h-48 object-cover rounded-t-xl" />
    <div className="p-4">
      <h3 className="font-semibold text-lg">{course.title}</h3>
      <p className="text-gray-500 text-sm">{course.teacher}</p>
    </div>
  </div>
);
