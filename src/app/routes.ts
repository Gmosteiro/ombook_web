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
    route("forgot-password", "../features/auth/forgot-password/ForgotPassword.tsx"),

    // Private routes wrapped in a layout
    layout("../features/auth/components/PrivateRoute.tsx", [
        route("home", "./pages/Home.tsx"), // Home privado en "/home"
        // Add more private routes here as needed
    ]),
] satisfies RouteConfig;
