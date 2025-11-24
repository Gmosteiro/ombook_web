import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { obtenerNotificaciones, marcarNotificacionLeida, marcarTodasLeidas } from './resource.notifications.server';

/**
 * GET /resource/notifications - Fetch all notifications
 */
export async function loader({ request }: LoaderFunctionArgs) {
    const notifications = await obtenerNotificaciones(request);
    return { notifications };
}

/**
 * POST /resource/notifications - Handle notification actions via intent
 * Supported intents:
 * - markRead: Mark a single notification as read (requires notificationId)
 * - markAllRead: Mark all notifications as read
 */
export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const intent = formData.get('intent') as string;

    switch (intent) {
        case 'markRead': {
            const notificationId = formData.get('notificationId') as string;
            if (!notificationId) {
                throw new Error('Notification ID is required');
            }
            await marcarNotificacionLeida(request, notificationId);
            return { success: true, intent: 'markRead' };
        }

        case 'markAllRead': {
            await marcarTodasLeidas(request);
            return { success: true, intent: 'markAllRead' };
        }

        default:
            throw new Error(`Unknown intent: ${intent}`);
    }
}