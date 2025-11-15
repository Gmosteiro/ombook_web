import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import Logout from "../../auth/components/Logout";
import NotificationBell from "./NotificationBell";
import { getNavbarLinks } from "../utils/Navbar";
import { UserRole } from "~/features/auth/types";

interface NavbarProps {
    userEmail?: string;
    userRole?: UserRole;
    notificationCount?: number;
    avatarUrl?: string;
}

export default function Navbar({ userEmail, userRole, notificationCount = 0, avatarUrl }: NavbarProps) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Cierra el menú si se hace click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }
        if (isUserMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const getInitials = (email: string) => {
        return email.split('@')[0].substring(0, 2).toUpperCase();
    };

    const handleNotificationClick = () => {
        console.log('Notificaciones clicked');
    };

    const styles = {
        link: "text-gray-600 hover:text-blue-600 font-medium transition-colors",
    }

    const links = getNavbarLinks(userRole);

    let isLoggedIn = Boolean(userEmail);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 px-6 py-4 shadow">
            <div className="flex items-center">

                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-semibold text-blue-700 ">Ombook</span>
                </Link>

                {/* Si no está logeado, no mostrar nada más */}
                {!isLoggedIn ? null : (
                    <div className="flex items-center ml-auto mr-5 space-x-8">
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

                        {/* Campana y Perfil juntos */}
                        <div className="relative flex items-center space-x-2" ref={menuRef}>
                            <NotificationBell
                                count={notificationCount}
                                onClick={handleNotificationClick}
                            />
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center focus:outline-none cursor-pointer ml-4"
                                aria-label="Abrir menú de usuario"
                                type="button"
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-medium text-sm">
                                            {getInitials(userEmail ?? "")}
                                        </span>
                                    </div>
                                )}
                                <svg
                                    className="w-4 h-4 text-gray-400 ml-1"
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
                            <div
                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                                style={{ display: isUserMenuOpen ? "block" : "none" }}
                            >
                                <div className="py-1">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Mi Perfil
                                    </Link>

                                    {/* <Link
                                        to="/configuracion"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Configuración
                                    </Link> */}

                                    <hr className="my-1" />
                                    <div className="px-4 py-2">
                                        <Logout
                                            className="w-full"
                                            buttonText="Cerrar Sesión"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}