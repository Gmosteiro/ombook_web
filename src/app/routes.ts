import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

const routes: RouteConfig = [
    // Home 
    index("./features/common/pages/Home.tsx"),

    // Auth
    route("/login", "./features/auth/components/Login.tsx"),
    route("/logout", "./features/auth/components/Logout.tsx"),

    // Courses
    route("/courses", "./features/courses/pages/CoursesPage.tsx"),

    // Users
    route("/users/create", "./features/users/pages/UserCreatePage.tsx"),


    // API Routes
    route("/csv/import", "./routes/api-csv-import.ts"),


    // Not Found
    route("*", './features/common/pages/NotFound.tsx'),
];

export default routes;