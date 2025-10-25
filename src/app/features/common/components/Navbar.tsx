import { useState } from "react";
import { Link } from "react-router";
import Logout from "../../auth/components/Logout";
import NotificationBell from "./NotificationBell";
import { getNavbarLinks } from "../utils/Navbar";
import { UserRole } from "~/features/auth/types";

interface NavbarProps {
    userEmail?: string;
    userRole?: UserRole;
    notificationCount?: number;
}

export default function Navbar({ userEmail, userRole, notificationCount = 0 }: NavbarProps) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const getInitials = (email: string) => {
        return email.split('@')[0].substring(0, 2).toUpperCase();
    };

    const handleNotificationClick = () => {
        // Aquí puedes manejar el click en notificaciones
        console.log('Notificaciones clicked');
    };

    const styles = {
        link: "text-gray-600 hover:text-blue-600 font-medium transition-colors",
    }


    const links = getNavbarLinks(userRole);

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-sm">📖</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900">Ombook</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                    {links.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={styles.link}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side - Notifications and User */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <NotificationBell
                        count={notificationCount}
                        onClick={handleNotificationClick}
                    />

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center space-x-3 text-left"
                        >
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                    {userEmail ? getInitials(userEmail) : 'U'}
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <div className="text-sm text-gray-500">
                                    {userEmail || 'usuario@ombook.com'}
                                </div>
                            </div>
                            <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                <div className="py-1">
                                    <Link
                                        to="/perfil"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Mi Perfil
                                    </Link>
                                    <Link
                                        to="/configuracion"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Configuración
                                    </Link>
                                    <hr className="my-1" />
                                    <div className="px-4 py-2">
                                        <Logout
                                            className="w-full"
                                            buttonText="Cerrar Sesión"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}