import { apiFetch } from '../features/auth/utils/methods';

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
    const { getValidJWTToken } = await import('../services/session.server');
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
    console.log('Notificaciones obtenidas:', res);

    return res;
}
