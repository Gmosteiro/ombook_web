import { ReactNode } from "react";
import { UserRole } from "~/features/auth/types";

interface LayoutProps {
    children: ReactNode;
    userEmail?: string;
    userRole?: UserRole;
    notificationCount?: number;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">

            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}