import {
    type RouteConfig,
    route,
    index,
    layout,
} from "@react-router/dev/routes";

export default [
    // Public landing page
    index("./pages/Landing.tsx"), // Página pública en "/"
    route("login", "../features/auth/components/Login.tsx"),
    route("forgot-password", "../features/auth/components/ForgotPassword.tsx"),

    // Private routes wrapped in a layout
    layout("../features/auth/components/PrivateRoute.tsx", [
        route("home", "./pages/Home.tsx"), // Home privado en "/home"
        route("cours", "./pages/cours.tsx"), // Cursos en "/cours"
        route("por-trabajar", "./pages/por-trabajar.tsx"), // Página por trabajar
        // Add more private routes here as needed
    ]),
] satisfies RouteConfig;
