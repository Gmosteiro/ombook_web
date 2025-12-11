import { type MetaFunction } from "react-router";
import { Link } from "react-router";
import { Route } from "../../../../.react-router/types/app/features/common/pages/+types/Home";
import { requireRoleLoader } from "~/features/auth/components/requireRoleLoader";
import { UserRole } from "~/features/auth/types";
import { MaterialIcon } from "~/features/common/components/ui/MaterialIcon";
import { useLoaderData } from "react-router";

export const meta: MetaFunction = () => {
    return [
        { title: "Ombook - Dashboard" },
        { name: "description", content: "Panel de control de Ombook" },
    ];
};

type LoaderResult = {
    userRole: UserRole;
    perfil: {
        nombre: string;
        apellido: string;
        // agrega otros campos si es necesario
    } | null;
};

export async function loader({ request }: Route.LoaderArgs) {
    await requireRoleLoader([UserRole.ADMINISTRADOR, UserRole.PROFESOR, UserRole.ESTUDIANTE])({ request } as any);

    const { getUserRole } = await import("~/services/session.server");
    const { getPerfil } = await import("../../../routes/api.profile.server");

    const userRole = await getUserRole(request);
    const perfil = await getPerfil(request);

    return new Response(
        JSON.stringify({ userRole, perfil }),
        {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache",
            },
        }
    );
}

export default function Index() {
    const { userRole, perfil } = useLoaderData() as LoaderResult;

    // Quick action cards basadas en el rol
    const quickActions = [
        {
            title: "Mis Cursos",
            description: "Accede a todos tus cursos",
            icon: <MaterialIcon name="school" color="var(--color-ombook-green)" size={36} />,
            link: "/courses",
            roles: [UserRole.ADMINISTRADOR, UserRole.PROFESOR, UserRole.ESTUDIANTE]
        },
        {
            title: "Chat",
            description: "Comunícate con estudiantes y profesores",
            icon: <MaterialIcon name="chat" color="var(--color-ombook-green)" size={36} />,
            link: "/chat",
            roles: [UserRole.ADMINISTRADOR, UserRole.PROFESOR, UserRole.ESTUDIANTE]
        },
        {
            title: "Crear Curso",
            description: "Crea un nuevo curso",
            icon: <MaterialIcon name="add" color="var(--color-ombook-green)" size={36} />,
            link: "/courses/create",
            roles: [UserRole.ADMINISTRADOR]
        },
        {
            title: "Gestión de Usuarios",
            description: "Administra estudiantes y profesores",
            icon: <MaterialIcon name="group" color="var(--color-ombook-green)" size={36} />,
            link: "/users",
            roles: [UserRole.ADMINISTRADOR]
        },
        {
            title: "Auditoria",
            description: "Revisa las actividades del sistema",
            icon: <MaterialIcon name="search" color="var(--color-ombook-green)" size={36} />,
            link: "/audit",
            roles: [UserRole.ADMINISTRADOR]
        },
        {
            title: "Log de Auditoría",
            description: "Ver el historial completo de auditoría",
            icon: <MaterialIcon name="list" color="var(--color-ombook-green)" size={36} />,
            link: "/audit/log",
            roles: [UserRole.ADMINISTRADOR]
        },
        {
            title: "Mi Perfil",
            description: "Ver y editar tu información",
            icon: <MaterialIcon name="person" color="var(--color-ombook-green)" size={36} />,
            link: "/profile",
            roles: [UserRole.ADMINISTRADOR, UserRole.PROFESOR, UserRole.ESTUDIANTE]
        }
    ];

    const filteredActions = quickActions.filter(action =>
        action.roles.includes(userRole as UserRole)
    );

    const nombre = perfil ? perfil.nombre + " " + perfil.apellido : "Usuario";

    return (
        <div className="ombook-container ombook-section">
            {/* Hero Section */}
            <div className="mb-8">
                <h1 className="ombook-heading ombook-heading-xl ombook-text-green mb-2">
                    ¡Bienvenido a Ombook, {nombre}! 👋
                </h1>
            </div>

            {/* Quick Actions Grid */}
            <div className="mb-8">
                <h2 className="ombook-heading ombook-heading-lg ombook-text-brown mb-4">
                    Acceso Rápido
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredActions.map((action) => (
                        <Link
                            key={action.link}
                            to={action.link}
                            className="ombook-card group cursor-pointer transition-all duration-200 hover:scale-105"
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">{action.icon}</div>
                                <div className="flex-1">
                                    <h3 className="ombook-heading ombook-heading-sm ombook-text-gray mb-2 group-hover:ombook-text-green transition-colors">
                                        {action.title}
                                    </h3>
                                    <p className="ombook-text-gray text-sm">
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Info Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tips Card */}
                <div className="ombook-card">
                    <h3 className="ombook-heading ombook-heading-sm ombook-text-brown mb-4">
                        💡 Consejos Útiles
                    </h3>
                    <ul className="space-y-3 ombook-text-gray text-sm">
                        <li className="flex items-start gap-2">
                            <span className="ombook-text-green mt-1">✓</span>
                            <span>Revisa tus notificaciones regularmente para estar al día</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="ombook-text-green mt-1">✓</span>
                            <span>Utiliza el chat para comunicarte con profesores y compañeros</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="ombook-text-green mt-1">✓</span>
                            <span>Mantén tu perfil actualizado con tu información de contacto</span>
                        </li>
                    </ul>
                </div>

                {/* Help Card */}
                <div className="ombook-card ombook-bg-light">
                    <h3 className="ombook-heading ombook-heading-sm ombook-text-brown mb-4">
                        ❓ ¿Necesitas Ayuda?
                    </h3>
                    <p className="ombook-text-gray text-sm mb-4">
                        Si tienes alguna pregunta o problema, estamos aquí para ayudarte.
                    </p>
                    <div className="space-y-2">
                        <a
                            href="mailto:soporte@ombook.com"
                            className="ombook-link text-sm block"
                        >
                            📧 soporte@ombook.com
                        </a>
                        <Link to="/terms" className="ombook-link text-sm block">
                            📄 Términos y Condiciones
                        </Link>
                        <Link to="/privacy" className="ombook-link text-sm block">
                            🔒 Política de Privacidad
                        </Link>
                    </div>
                </div>
            </div>
            <img
                src="/ombook_logo.png"
                style={{ maxWidth: "20%", height: "auto", marginLeft: "40%" }}
                alt="Ombook Logo"
            />
        </div>
    );
}