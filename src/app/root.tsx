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
  console.log("[root loader] called");
  const { getUserId, getUserRole } = await import("./services/session.server");
  const { getPerfil } = await import("./routes/api.profile.server");

  console.log("[root loader] Before getUserId/getUserRole");
  const userEmail = await getUserId(request);
  const userRole = await getUserRole(request);
  console.log("[root loader] After getUserId/getUserRole", { userEmail, userRole });

  let avatarUrl: string | undefined = undefined;
  if (userEmail) {
    try {
      const perfil = await getPerfil(request);
      avatarUrl = perfil.fotoPerfil
        ? `${perfil.fotoPerfil}?v=${Date.now()}`
        : undefined;
    } catch {
      // Si falla, deja avatarUrl como undefined
    }
  }
  const notificationCount = 0;

  console.log("Loader data in root:", { userEmail, userRole, avatarUrl, notificationCount });
  return { userEmail, userRole, notificationCount, avatarUrl };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { userEmail, userRole, notificationCount, avatarUrl } = useLoaderData() as {
    userEmail: string;
    userRole: User['rol']
    notificationCount: number;
    avatarUrl: string | undefined;
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="">
        <Navbar
          userEmail={userEmail}
          userRole={userRole}
          notificationCount={notificationCount}
          avatarUrl={avatarUrl}
        />
        <div className="bg-gray-50 min-h-screen pt-20">
          {children}
          <ScrollRestoration />
          <Scripts />
        </div>
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
