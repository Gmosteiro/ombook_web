import { ActionFunctionArgs, useOutletContext } from "react-router";
import { UserRole } from "~/features/auth/types";
import { Course } from "../types/types";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";

export const loader = requireRoleLoader([UserRole.PROFESOR, UserRole.ESTUDIANTE]);

export async function action({ request }: ActionFunctionArgs): Promise<any> {
    return {};
}

type Ctx = { course: Course };

export default function CourseMarksPage() {
    const context = useOutletContext<Ctx>();
    const course = context?.course;


    return (
        <div className="ombook-container">
            <h1>TESTTTT</h1>
        </div>
    );
}