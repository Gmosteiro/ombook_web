import {
    type RouteConfig,
    route,
    index,
    layout,
} from "@react-router/dev/routes";

export default [
    // Public routes
    index("./pages/Home.tsx"),
    route("login", "../features/auth/login/Login.tsx"),
    route("forgot-password", "../features/auth/forgot-password/ForgotPassword.tsx"),

    // Private routes wrapped in a layout
    layout("../features/auth/components/PrivateRoute.tsx", [
        route("dashboard", "./pages/Dashboard.tsx"),
        // Add more private routes here as needed
    ]),
] satisfies RouteConfig;
