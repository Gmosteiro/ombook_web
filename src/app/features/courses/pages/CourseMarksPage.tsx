import { useOutletContext, useLoaderData, LoaderFunctionArgs } from "react-router";
import { UserRole } from "~/features/auth/types";
import { Course } from "../types/types";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import TeacherMarks from "../components/marks/TeacherMarks";
import StudentMarks from "../components/marks/StudentMarks";


export async function loader({ request, params }: LoaderFunctionArgs) {
    await requireRoleLoader([UserRole.PROFESOR, UserRole.ESTUDIANTE]);
    const { getUserRole } = await import("~/services/session.server");
    const userRole = await getUserRole(request);
    let mark = null;

    // Get courseId from params (assuming route is /courses/:id/marks)
    const courseId = params.id;
    if (userRole === UserRole.ESTUDIANTE && courseId) {
        try {
            const { getMyMark } = await import("../../../routes/api.marks");
            mark = await getMyMark(courseId);
        } catch (e) {
            mark = null;
        }
    }
    return { userRole, mark };
}

type Ctx = { course: Course };

export default function CourseMarksPage() {
    const { userRole, mark } = useLoaderData<{ userRole: UserRole; mark?: any }>();
    const context = useOutletContext<Ctx>();
    const course = context?.course;

    return (
        <div className="ombook-container">
            {userRole === UserRole.ESTUDIANTE ? (
                <StudentMarks course={course} mark={mark} />
            ) : (
                <TeacherMarks course={course} />
            )}
        </div>
    );
}
