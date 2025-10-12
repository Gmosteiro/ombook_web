import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    // Rutas públicas (solo para no autenticados)
    route("/login", "./routes/login.tsx"),
    route("/forgot-password", "./routes/forgot-password.tsx"),

    // Rutas protegidas
    index("./routes/home.tsx"), // Esta será protegida
    route("/chat", "./routes/chat.tsx"), // Esta también
] satisfies RouteConfig;
