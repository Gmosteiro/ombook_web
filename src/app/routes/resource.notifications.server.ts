import { apiFetch } from '../features/auth/utils/methods';
import { getValidJWTToken } from '../services/session.server';

export interface NotificationDTO {
    id: string;
    title: string;
    body: string;
    timestamp: string;
    read: boolean;
}

/**
 * Fetch notifications from backend (server-side only)
 */
export async function obtenerNotificaciones(request: Request): Promise<NotificationDTO[]> {
    const jwtToken = await getValidJWTToken(request);

    const response = await apiFetch('/notificaciones', {
        method: 'GET',
        secure: true,
        jwtToken,
    });

    if (!response.ok) {
        throw new Error('Failed to fetch notifications');
    }

    const res = await response.json();
    return res;
}

/**
 * Mark a notification as read (server-side only)
 */
export async function marcarNotificacionLeida(request: Request, notificationId: string): Promise<void> {
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
