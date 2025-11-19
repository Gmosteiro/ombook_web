import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

const routes: RouteConfig = [
    // Home 
    index("./features/common/pages/Home.tsx"),

    // Auth
    route("/login", "./features/auth/components/Login.tsx"),
    route("/logout", "./features/auth/components/Logout.tsx"),
    route("/forgot-password", "./features/auth/components/ForgotPassword.tsx"),
    route("/password-reset", "./features/auth/components/ResetPassword.tsx"),

    // Courses
    route("/courses", "./features/courses/pages/CoursesPage.tsx"),
    route("/courses/create", "./features/courses/pages/CourseCreatePage.tsx"),
    route("/courses/delete-bulk", "./features/courses/pages/CourseDeletePage.tsx"),

    // Course Detail
    route("/courses/:id", "./features/courses/pages/CourseDetail.Page.tsx", [
        route("general", "./features/courses/components/general/CourseGeneral.tsx"),
        route("tasks", "./features/courses/components/CourseMaterials.tsx"),
        route("forums", "./features/courses/components/CourseForums.tsx"),
        route("announcements", "./features/courses/components/CourseAnnouncements.tsx"),
        route("students", "./features/courses/components/CourseStudents.tsx"),
        route("enroll", "./features/courses/pages/CourseEnrollPage.tsx"),
        route("unenroll", "./features/courses/pages/CourseUnenrollPage.tsx"),

    ]),

    // Users
    route("/users", "./features/users/pages/UsersPage.tsx"),
    route("/users/create", "./features/users/pages/UserCreatePage.tsx"),


    route("/profile", "./features/users/pages/ProfilePage.tsx"),
    route("/profile/change-password", "./features/users/pages/ChangePassword.tsx"),

    // API Routes
    route("/csv/import", "./routes/api-csv-import.ts"),
    route("/app/users", "./routes/api.users.ts"),
    route("/app/courses", "./routes/api.courses.ts"),
    route("/api/auth", "./routes/api.auth.ts"),

    // Not Found
    route("*", './features/common/pages/NotFound.tsx'),
];

export default routes;