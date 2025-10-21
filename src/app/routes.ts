import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

const routes: RouteConfig = [
    index("./features/common/pages/Home.tsx"),
    route("/login", "./features/auth/components/Login.tsx"),
    route("/logout", "./features/auth/components/Logout.tsx"),
    route("/courses", "./features/courses/pages/CoursesPage.tsx"),
    route("/users/create", "./features/users/pages/UserCreatePage.tsx"),

    // Cambiar temporalmente la ruta para evitar /api/
    route("/csv/import", "./routes/api-csv-import.ts"),

    route("*", './features/common/pages/NotFound.tsx'),
];

export default routes;