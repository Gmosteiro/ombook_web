import type { ActionFunctionArgs } from 'react-router';
import { marcarNotificacionLeida } from './api.notifications.mark-read.server';

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const notificationId = formData.get('notificationId') as string;

    if (!notificationId) {
        throw new Error('Notification ID is required');
    }

    await marcarNotificacionLeida(request, notificationId);

    return { success: true };
}
