import { apiFetch } from '../features/auth/utils/methods';

/**
 * Mark a notification as read (server-side only)
 */
export async function marcarNotificacionLeida(request: Request, notificationId: string): Promise<void> {
    const { getValidJWTToken } = await import('../services/session.server');
    const jwtToken = await getValidJWTToken(request);

    const response = await apiFetch(`/notificaciones/${notificationId}/marcar-leida`, {
        method: 'PUT',
        secure: true,
        jwtToken,
    });

    if (!response.ok) {
        throw new Error('Failed to mark notification as read');
    }
}

/**
 * Mark all notifications as read (server-side only)
 */
export async function marcarTodasLeidas(request: Request): Promise<void> {
    const { getValidJWTToken } = await import('../services/session.server');
    const jwtToken = await getValidJWTToken(request);

    const response = await apiFetch('/notificaciones/marcar-todas-leidas', {
        method: 'PUT',
        secure: true,
        jwtToken,
    });

    if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
    }
}
