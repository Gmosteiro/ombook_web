import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <ProtectedRoute>
      <div>
        <Welcome />
        <h1>Bienvenido a Ombook</h1>
        <p>Esta es una página protegida</p>
      </div>
    </ProtectedRoute>
  );
}
