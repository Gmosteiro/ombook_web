import type { ActionFunctionArgs } from 'react-router';
import { marcarTodasLeidas } from './api.notifications.mark-read.server';

export async function action({ request }: ActionFunctionArgs) {
    await marcarTodasLeidas(request);

    return { success: true };
}
