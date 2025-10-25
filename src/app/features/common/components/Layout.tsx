import { ReactNode } from "react";
import Navbar from "./Navbar";
import { UserRole } from "~/features/auth/types";

interface LayoutProps {
    children: ReactNode;
    userEmail?: string;
    userRole?: UserRole;
    notificationCount?: number;
}

export default function Layout({ children, userEmail, userRole, notificationCount = 0 }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar
                userEmail={userEmail}
                userRole={userRole}
                notificationCount={notificationCount}
            />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}