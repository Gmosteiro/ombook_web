import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Notification {
    id: string;
    title: string;
    body: string;
    timestamp: Date;
    read: boolean;
    data?: Record<string, any>;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
    initialNotifications?: any[];
}

export function NotificationProvider({ children, initialNotifications = [] }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        // Transform initial notifications from server
        return initialNotifications.map(n => ({
            id: n.id || Date.now().toString(),
            title: n.title || 'Notificación',
            body: n.body || '',
            timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
            read: n.read || false,
            data: n.data,
        }));
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );

        try {
            // Persist to backend
            const response = await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ notificationId: id }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark as read');
            }
        } catch (error) {
            // Revert on error
            console.error('Failed to mark notification as read:', error);
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, read: false } : n))
            );
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        const previousNotifications = notifications;
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        try {
            // Persist to backend
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to mark all as read');
            }
        } catch (error) {
            // Revert on error
            console.error('Failed to mark all notifications as read:', error);
            setNotifications(previousNotifications);
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}
