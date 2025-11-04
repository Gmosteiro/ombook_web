import { Outlet } from "react-router";
import { Course } from "../../types/types";

interface Props {
  course: Course;
}

export default function CourseContentLayout({ course }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800 dark:text-gray-100 min-h-[60vh]">
      {/* pasamos course al outlet via context */}
      <Outlet context={{ course }} />
    </div>
  );
}
