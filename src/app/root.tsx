import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import "./app.css";
import Navbar from "./features/common/components/Navbar";
import { NotificationProvider } from "./features/common/contexts/NotificationContext";
import { useNotificationPolling } from "./features/common/hooks/useSSENotifications";
import { User } from "./features/auth/types";


export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// Loader para pasar datos de sesión al layout
export async function loader({ request }: { request: Request }) {
  const { getUserId, getUserRole } = await import("./services/session.server");
  const { getPerfil } = await import("./routes/api.profile.server");
  const { obtenerNotificaciones } = await import("./routes/api.notifications.server");

  const userId = await getUserId(request);
  const userRole = await getUserRole(request);
  let avatarUrl: string | undefined = undefined;
  let notifications: any[] = [];

  if (userId) {
    try {
      const perfil = await getPerfil(request);
      avatarUrl = perfil.fotoPerfil
        ? `${perfil.fotoPerfil}?v=${Date.now()}`
        : undefined;

      // Fetch notifications from backend server-side
      notifications = await obtenerNotificaciones(request);
    } catch {
      // Si falla, deja valores por defecto
    }
  }
  return { userId, userRole, avatarUrl, notifications };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { userId, userRole, avatarUrl, notifications } = useLoaderData() as {
    userId: string;
    userRole: User['rol']
    avatarUrl: string | undefined;
    notifications: any[];
  };

  // Component to initialize polling inside NotificationProvider
  function PollingInitializer() {
    useNotificationPolling(Boolean(userId));
    return null;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="">
        <NotificationProvider initialNotifications={notifications}>
          <PollingInitializer />
          <Navbar
            userRole={userRole}
            avatarUrl={avatarUrl}
          />
          <div className="bg-gray-50 min-h-screen pt-20">
            {children}
            <ScrollRestoration />
            <Scripts />
          </div>
        </NotificationProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: any }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      message = "Unauthorized";
      details = "You must be logged in to access this page.";
    } else {
      message = error.status === 404 ? "404" : "Error";
      details = error.statusText || details;
    }
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
