import ForgotPassword from '../features/auth/forgot-password/ForgotPassword';
import { PublicRoute } from '../features/auth/components/PublicRoute';

export default function ForgotPasswordPage() {
    return (
        <PublicRoute>
            <ForgotPassword />
        </PublicRoute>
    );
}
