import {
    type RouteConfig,
    route,
    index,
    layout,
} from "@react-router/dev/routes";


const FEATURES = "../features";

export default [
    // Public landing page
    index(`${FEATURES}/common/pages/Landing.tsx`), // Página pública en "/"
    route("login", `${FEATURES}/auth/components/Login.tsx`),
    route("forgot-password", `${FEATURES}/auth/components/ForgotPassword.tsx`),

    // Private routes wrapped in a layout
    layout(`${FEATURES}/auth/components/PrivateRoute.tsx`, [
        route("home", `${FEATURES}/common/pages/Home.tsx`), // Home privado en "/home"
        route("usuarios/alta", `${FEATURES}/users/pages/UserCreatePage.tsx`),
    ]),
] satisfies RouteConfig;

