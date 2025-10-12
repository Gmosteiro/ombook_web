import { PublicRoute } from '../features/auth/components/PublicRoute';
import Login from '../features/auth/login/Login';

export default function LoginRoute() {
    return (
        <PublicRoute>
            <Login />
        </PublicRoute>
    );
}
